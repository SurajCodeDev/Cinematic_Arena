'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { registrations, tournaments } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'node:crypto'

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function registerForTournament(tournamentId: number, squadName: string, roster: string[]) {
  const userId = await requireUser()
  const tournament = await db.select().from(tournaments).where(eq(tournaments.id, tournamentId)).limit(1)
  if (!tournament[0] || tournament[0].status !== 'open') throw new Error('Tournament is not open')
  if (roster.length < 1 || roster.length > 4) throw new Error('Roster must contain 1 to 4 players')
  const existing = await db.select({ id: registrations.id }).from(registrations).where(and(eq(registrations.tournamentId, tournamentId), eq(registrations.userId, userId))).limit(1)
  if (existing[0]) throw new Error('You are already registered')
  await db.insert(registrations).values({ tournamentId, userId, squadName: squadName.trim() || null, roster, paymentStatus: tournament[0].entryFee === 0 ? 'paid' : 'pending', shareToken: randomUUID() })
  revalidatePath('/dashboard')
  return { ok: true }
}
