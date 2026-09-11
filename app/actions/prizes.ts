'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { prizeLedger, user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function releasePrize(ledgerId: number) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const [operator] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (operator?.role !== 'admin' && operator?.role !== 'finance') throw new Error('Forbidden')
  await db.update(prizeLedger).set({ status: 'released', releasedAt: new Date() }).where(eq(prizeLedger.id, ledgerId))
  revalidatePath('/admin')
}
