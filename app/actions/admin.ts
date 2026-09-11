'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tournaments, user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const [operator] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (operator?.role !== 'admin') throw new Error('Forbidden')
  return session.user.id
}

export async function createTournament(formData: FormData) {
  const userId = await requireAdmin()
  await db.insert(tournaments).values({ title: String(formData.get('title') || '').trim(), mode: String(formData.get('mode') || 'Solo'), map: String(formData.get('map') || 'Erangel'), startsAt: new Date(String(formData.get('startsAt'))), prizePool: Number(formData.get('prizePool') || 0), entryFee: Number(formData.get('entryFee') || 0), maxSlots: Number(formData.get('maxSlots') || 100), status: 'open', antiCheat: true, createdBy: userId })
  revalidatePath('/admin')
  revalidatePath('/')
}
