import { db } from '@/lib/db'
import { payments, registrations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')
  const signature = (await headers()).get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!signature || !secret) return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 })
  let event: Stripe.Event
  try { event = stripe.webhooks.constructEvent(await request.text(), signature, secret) } catch { return NextResponse.json({ error: 'Invalid signature' }, { status: 400 }) }
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const checkout = event.data.object as Stripe.Checkout.Session
    if (checkout.payment_status === 'paid' && checkout.metadata?.paymentId && checkout.metadata.registrationId) {
      await db.update(payments).set({ status: 'paid', updatedAt: new Date() }).where(eq(payments.id, Number(checkout.metadata.paymentId)))
      await db.update(registrations).set({ paymentStatus: 'paid' }).where(eq(registrations.id, Number(checkout.metadata.registrationId)))
    }
  }
  return NextResponse.json({ received: true })
}
