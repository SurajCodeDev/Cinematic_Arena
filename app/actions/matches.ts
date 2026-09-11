'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { matches, matchResults, user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const [operator] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (!['admin', 'referee'].includes(operator?.role ?? '')) throw new Error('Forbidden')
  return session.user.id
}

export async function createMatch(formData: FormData) {
  const userId = await requireAdmin()
  await db.insert(matches).values({ tournamentId: Number(formData.get('tournamentId')), title: String(formData.get('title') || 'Match 1'), startsAt: new Date(String(formData.get('startsAt'))), roomId: String(formData.get('roomId') || ''), roomPassword: String(formData.get('roomPassword') || ''), status: 'scheduled', createdBy: userId })
  revalidatePath('/admin')
}

export async function submitMatchResult(formData: FormData) {
  const userId = await requireAdmin()
  const kills = Math.max(0, Number(formData.get('kills') || 0))
  const placement = Math.max(0, Number(formData.get('placement') || 0))
  const points = kills * 1 + (placement > 0 ? Math.max(0, 25 - placement) : 0)
  await db.insert(matchResults).values({ matchId: Number(formData.get('matchId')), registrationId: Number(formData.get('registrationId')), placement, kills, points, status: 'approved', approvedBy: userId })
  revalidatePath('/admin')
}
