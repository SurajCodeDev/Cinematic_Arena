import { put } from '@vercel/blob'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { payments, registrations, tournaments } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

const MAX_PROOF_BYTES = 5 * 1024 * 1024
const allowedTypes = new Set(['image/jpeg', 'image/png', 'application/pdf'])

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const registrationId = Number(formData.get('registrationId'))
  const proof = formData.get('proof')
  if (!Number.isInteger(registrationId) || !(proof instanceof File)) return NextResponse.json({ error: 'Registration and proof file are required' }, { status: 400 })
  if (!allowedTypes.has(proof.type) || proof.size <= 0 || proof.size > MAX_PROOF_BYTES) return NextResponse.json({ error: 'Upload a JPG, PNG, or PDF under 5MB' }, { status: 400 })

  const [record] = await db.select({ registration: registrations, tournament: tournaments }).from(registrations).innerJoin(tournaments, eq(registrations.tournamentId, tournaments.id)).where(and(eq(registrations.id, registrationId), eq(registrations.userId, session.user.id))).limit(1)
  if (!record || record.tournament.entryFee <= 0) return NextResponse.json({ error: 'Invalid paid registration' }, { status: 400 })
  const [existing] = await db.select({ id: payments.id }).from(payments).where(and(eq(payments.registrationId, registrationId), eq(payments.status, 'review'))).limit(1)
  if (existing) return NextResponse.json({ error: 'Payment is already under review' }, { status: 409 })

  const blob = await put(`payment-proofs/${session.user.id}/${registrationId}-${Date.now()}-${proof.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`, proof, { access: 'private', addRandomSuffix: true })
  await db.insert(payments).values({ registrationId, userId: session.user.id, provider: 'upi_manual', amount: record.tournament.entryFee, status: 'review', proofUrl: blob.pathname })
  return NextResponse.json({ ok: true, status: 'review' })
}
