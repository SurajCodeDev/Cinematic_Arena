import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tournaments, user } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  const [operator] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (operator?.role !== 'admin') redirect('/dashboard')
  const events = await db.select().from(tournaments).orderBy(desc(tournaments.startsAt)).limit(8)

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
          <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Restricted operations</p><h1 className="mt-3 font-display text-5xl font-bold uppercase">Admin command</h1><p className="mt-2 text-sm text-muted-foreground">Create events, review payments, resolve fair-play reports, and publish winners.</p></div>
          <a href="/" className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-primary">Back to arena</a>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[['Open events', String(events.length), 'Schedules live'], ['Payment queue', '06', 'Manual UPI reviews'], ['Reports', '02', 'Need referee review'], ['Prize ledger', '₹1.84L', 'Ready to release']].map(([label, value, detail]) => <article key={label} className="border border-border bg-card p-5"><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</p><p className="mt-4 font-display text-3xl font-bold">{value}</p><p className="mt-2 text-xs text-muted-foreground">{detail}</p></article>)}
        </div>
        <section className="mt-8 border border-border bg-card">
          <div className="flex flex-col justify-between gap-4 border-b border-border p-6 sm:flex-row sm:items-center"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">Event registry</p><h2 className="mt-2 font-display text-2xl font-bold uppercase">Tournament operations</h2></div><button className="bg-primary px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground">Create event</button></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead><tr className="border-b border-border font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground"><th className="px-6 py-4">Event</th><th className="px-6 py-4">Format</th><th className="px-6 py-4">Entry</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Action</th></tr></thead><tbody>{events.map((event) => <tr key={event.id} className="border-b border-border/70 text-sm last:border-0"><td className="px-6 py-4 font-semibold">{event.title}</td><td className="px-6 py-4 text-muted-foreground">{event.mode} · {event.map}</td><td className="px-6 py-4">{event.entryFee === 0 ? 'FREE' : `₹${event.entryFee}`}</td><td className="px-6 py-4"><span className="border border-primary/30 bg-primary/10 px-2 py-1 font-mono text-[9px] uppercase text-primary">{event.status}</span></td><td className="px-6 py-4"><button className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground hover:text-primary">Modify</button></td></tr>)}</tbody></table></div>
        </section>
      </div>
    </main>
  )
}
