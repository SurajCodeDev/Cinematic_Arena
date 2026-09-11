'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { disputes } from '@/lib/db/schema'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function openDispute(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  await db.insert(disputes).values({ tournamentId: Number(formData.get('tournamentId')), registrationId: Number(formData.get('registrationId')) || null, openedBy: session.user.id, category: String(formData.get('category') || 'other'), details: String(formData.get('details') || '').trim(), status: 'open' })
  revalidatePath('/dashboard')
}
