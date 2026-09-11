import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { payments, registrations, tournaments } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json() as { registrationId?: number; proofUrl?: string }
  if (!body.registrationId || !body.proofUrl?.startsWith('https://')) return NextResponse.json({ error: 'Registration and secure proof URL are required' }, { status: 400 })
  const [record] = await db.select({ registration: registrations, tournament: tournaments }).from(registrations).innerJoin(tournaments, eq(registrations.tournamentId, tournaments.id)).where(and(eq(registrations.id, body.registrationId), eq(registrations.userId, session.user.id))).limit(1)
  if (!record || record.tournament.entryFee <= 0) return NextResponse.json({ error: 'Invalid paid registration' }, { status: 400 })
  await db.insert(payments).values({ registrationId: record.registration.id, userId: session.user.id, provider: 'upi_manual', amount: record.tournament.entryFee, status: 'review', proofUrl: body.proofUrl })
  return NextResponse.json({ ok: true, status: 'review' })
}
