'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { payments, registrations, tournaments } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'

export async function startCheckout(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  const registrationId = Number(formData.get('registrationId'))
  const [record] = await db.select({ registration: registrations, tournament: tournaments }).from(registrations).innerJoin(tournaments, eq(registrations.tournamentId, tournaments.id)).where(and(eq(registrations.id, registrationId), eq(registrations.userId, session.user.id))).limit(1)
  if (!record || record.tournament.entryFee <= 0) throw new Error('Invalid paid registration')
  const [payment] = await db.insert(payments).values({ registrationId, userId: session.user.id, provider: 'stripe', amount: record.tournament.entryFee, status: 'pending' }).returning({ id: payments.id })
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')
  const checkout = await stripe.checkout.sessions.create({ mode: 'payment', line_items: [{ price_data: { currency: 'inr', product_data: { name: record.tournament.title }, unit_amount: record.tournament.entryFee * 100 }, quantity: 1 }], success_url: `${process.env.BETTER_AUTH_URL || ''}/dashboard?payment=success`, cancel_url: `${process.env.BETTER_AUTH_URL || ''}/dashboard?payment=cancelled`, metadata: { paymentId: String(payment.id), registrationId: String(registrationId) }, integration_identifier: `nightfall_${Math.random().toString(36).slice(2, 10)}` })
  redirect(checkout.url || '/dashboard')
}
