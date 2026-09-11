import { registerForTournament } from '@/app/actions/tournaments'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tournaments } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [databaseEvent] = await db.select().from(tournaments).where(eq(tournaments.id, Number(id))).limit(1)
  const demoEvents = {
    1: { id: 1, title: 'Blood Moon Invitational', mode: 'Squad', map: 'Erangel', status: 'open', prizePool: 25000, entryFee: 99, maxSlots: 100, antiCheat: true },
    2: { id: 2, title: 'Vampire Solo Hunt', mode: 'Solo', map: 'Livik', status: 'open', prizePool: 8500, entryFee: 0, maxSlots: 500, antiCheat: true },
    3: { id: 3, title: 'Nightwatch Scrims', mode: 'Squad', map: 'Miramar', status: 'open', prizePool: 50000, entryFee: 249, maxSlots: 64, antiCheat: true },
  } as const
  const event = databaseEvent ?? demoEvents[Number(id) as keyof typeof demoEvents]
  if (!event) redirect('/')
  const session = await auth.api.getSession({ headers: await headers() })
  async function register(formData: FormData) {
    'use server'
    await registerForTournament(event.id, String(formData.get('squadName') || ''), String(formData.get('roster') || '').split(',').map((value) => value.trim()).filter(Boolean))
    redirect('/dashboard?registered=1')
  }
  return <main className="min-h-screen bg-background px-5 py-12 text-foreground lg:px-10"><div className="mx-auto max-w-4xl"><a href="/" className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-primary">Back to arena</a><div className="mt-8 border border-border bg-card p-6 sm:p-10"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Event brief · NF-{String(event.id).padStart(4, '0')}</p><h1 className="mt-4 font-display text-5xl font-bold uppercase">{event.title}</h1><p className="mt-4 text-muted-foreground">{event.mode} · {event.map} · {event.status}</p><div className="mt-8 grid gap-3 sm:grid-cols-4">{[['Prize', `₹${event.prizePool}`], ['Entry', event.entryFee ? `₹${event.entryFee}` : 'FREE'], ['Slots', String(event.maxSlots)], ['Fair play', event.antiCheat ? 'Tracked' : 'Standard']].map(([label, value]) => <div key={label} className="border border-border p-4"><p className="font-mono text-[9px] uppercase text-muted-foreground">{label}</p><p className="mt-2 font-display text-2xl font-bold">{value}</p></div>)}</div>{session?.user ? <form action={register} className="mt-8 grid gap-4 border-t border-border pt-8"><h2 className="font-display text-2xl font-bold uppercase">Deploy your roster</h2><input name="squadName" placeholder="Squad name (optional for solo)" className="border border-input bg-background px-4 py-3 text-sm" required={event.mode.toLowerCase().includes('squad')} /><input name="roster" placeholder="Player names, comma separated" className="border border-input bg-background px-4 py-3 text-sm" required /><button className="bg-primary px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground">Register now</button></form> : <a href="/sign-in" className="mt-8 inline-flex bg-primary px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground">Sign in to register</a>}</div></div></main>
}
