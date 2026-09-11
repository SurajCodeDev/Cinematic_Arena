'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { fairPlayReports, user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function requireModerator() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const [operator] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (!['admin', 'moderator', 'referee'].includes(operator?.role ?? '')) throw new Error('Forbidden')
  return session.user.id
}

export async function resolveFairPlayReport(reportId: number, status: 'resolved' | 'dismissed', resolution: string) {
  const userId = await requireModerator()
  await db.update(fairPlayReports).set({ status, resolution, resolvedAt: new Date() }).where(eq(fairPlayReports.id, reportId))
  revalidatePath('/admin')
  return userId
}
