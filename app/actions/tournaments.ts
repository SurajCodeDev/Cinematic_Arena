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

export async function registerForTournament(tournamentId: number, squadName: string, roster: Array<{ name: string; uid: string; phone: string; role: string }>) {
  const userId = await requireUser()
  const tournament = await db.select().from(tournaments).where(eq(tournaments.id, tournamentId)).limit(1)
  if (!tournament[0] || tournament[0].status !== 'open') throw new Error('Tournament is not open')
  const isSquad = tournament[0].mode.toLowerCase().includes('squad')
  const minPlayers = isSquad ? 2 : 1
  if (roster.length < minPlayers || roster.length > 4) throw new Error(isSquad ? 'Squad must contain 2 to 4 players' : 'Roster must contain 1 player')
  const normalized = roster.map((player) => ({ name: player.name.trim(), uid: player.uid.trim(), phone: player.phone.trim(), role: player.role.trim() }))
  if (normalized.some((player) => !player.name || !player.uid || !player.phone)) throw new Error('Every player needs a name, BGMI UID, and phone number')
  if (new Set(normalized.map((player) => player.uid)).size !== normalized.length) throw new Error('Each player must have a unique BGMI UID')
  if (isSquad && !squadName.trim()) throw new Error('Squad name is required')
  const existing = await db.select({ id: registrations.id }).from(registrations).where(and(eq(registrations.tournamentId, tournamentId), eq(registrations.userId, userId))).limit(1)
  if (existing[0]) throw new Error('You are already registered')
  await db.insert(registrations).values({ tournamentId, userId, squadName: squadName.trim() || null, roster: normalized, paymentStatus: tournament[0].entryFee === 0 ? 'paid' : 'pending', shareToken: randomUUID() })
  revalidatePath('/dashboard')
  return { ok: true }
}
