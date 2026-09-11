'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { payments, registrations, user } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function reviewManualPayment(paymentId: number, decision: 'paid' | 'rejected') {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const [operator] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (operator?.role !== 'admin') throw new Error('Forbidden')
  const [payment] = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1)
  if (!payment || payment.provider !== 'upi_manual' || payment.status !== 'review') throw new Error('Payment is not reviewable')
  await db.update(payments).set({ status: decision, updatedAt: new Date() }).where(eq(payments.id, paymentId))
  await db.update(registrations).set({ paymentStatus: decision }).where(and(eq(registrations.id, payment.registrationId), eq(registrations.userId, payment.userId)))
  revalidatePath('/admin')
  revalidatePath('/dashboard')
}
