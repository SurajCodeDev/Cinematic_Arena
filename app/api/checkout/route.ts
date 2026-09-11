import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { payments, registrations, tournaments } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json() as { registrationId?: number }
  if (!body.registrationId) return NextResponse.json({ error: 'Registration is required' }, { status: 400 })
  const [record] = await db.select({ registration: registrations, tournament: tournaments }).from(registrations).innerJoin(tournaments, eq(registrations.tournamentId, tournaments.id)).where(and(eq(registrations.id, body.registrationId), eq(registrations.userId, session.user.id))).limit(1)
  if (!record || record.tournament.entryFee <= 0) return NextResponse.json({ error: 'Invalid paid registration' }, { status: 400 })
  const [payment] = await db.insert(payments).values({ registrationId: record.registration.id, userId: session.user.id, provider: 'stripe', amount: record.tournament.entryFee, status: 'pending' }).returning({ id: payments.id })
  const checkout = await stripe.checkout.sessions.create({ mode: 'payment', line_items: [{ price_data: { currency: 'inr', product_data: { name: record.tournament.title }, unit_amount: record.tournament.entryFee * 100 }, quantity: 1 }], success_url: `${request.headers.get('origin') || ''}/dashboard?payment=success`, cancel_url: `${request.headers.get('origin') || ''}/dashboard?payment=cancelled`, metadata: { paymentId: String(payment.id), registrationId: String(record.registration.id) }, integration_identifier: `nightfall_${Math.random().toString(36).slice(2, 10)}` })
  await db.update(payments).set({ providerReference: checkout.id, updatedAt: new Date() }).where(eq(payments.id, payment.id))
  return NextResponse.json({ url: checkout.url })
}
