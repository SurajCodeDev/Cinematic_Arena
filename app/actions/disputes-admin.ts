'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { disputes, user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function resolveDispute(disputeId: number, status: 'resolved' | 'dismissed', resolution: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const [operator] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (!['admin', 'moderator', 'referee'].includes(operator?.role ?? '')) throw new Error('Forbidden')
  await db.update(disputes).set({ status, resolution, resolvedAt: new Date() }).where(eq(disputes.id, disputeId))
  revalidatePath('/admin')
}
