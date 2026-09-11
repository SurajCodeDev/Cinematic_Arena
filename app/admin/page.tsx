import { createTournament } from '@/app/actions/admin'
import { reviewManualPayment } from '@/app/actions/payments'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { payments, tournaments, user } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  const [operator] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (operator?.role !== 'admin') redirect('/dashboard')
  const events = await db.select().from(tournaments).orderBy(desc(tournaments.startsAt)).limit(8)
  const paymentQueue = await db.select().from(payments).where(eq(payments.status, 'review')).orderBy(desc(payments.createdAt)).limit(10)

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
          <div className="flex flex-col justify-between gap-4 border-b border-border p-6 sm:flex-row sm:items-center"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">Event registry</p><h2 className="mt-2 font-display text-2xl font-bold uppercase">Tournament operations</h2></div><details className="relative"><summary className="cursor-pointer list-none bg-primary px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground">Create event</summary><form action={createTournament} className="absolute right-0 top-12 z-10 grid w-80 gap-2 border border-border bg-card p-4 shadow-2xl"><input name="title" required placeholder="Event title" className="border border-input bg-background px-3 py-2 text-sm" /><div className="grid grid-cols-2 gap-2"><input name="mode" required placeholder="Squad / Solo" className="border border-input bg-background px-3 py-2 text-sm" /><input name="map" required placeholder="Erangel" className="border border-input bg-background px-3 py-2 text-sm" /></div><input name="startsAt" required type="datetime-local" className="border border-input bg-background px-3 py-2 text-sm" /><div className="grid grid-cols-3 gap-2"><input name="prizePool" required type="number" min="0" placeholder="Prize" className="border border-input bg-background px-3 py-2 text-sm" /><input name="entryFee" required type="number" min="0" placeholder="Entry" className="border border-input bg-background px-3 py-2 text-sm" /><input name="maxSlots" required type="number" min="1" placeholder="Slots" className="border border-input bg-background px-3 py-2 text-sm" /></div><button className="bg-primary px-3 py-2 font-mono text-[10px] uppercase text-primary-foreground">Publish event</button></form></details></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead><tr className="border-b border-border font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground"><th className="px-6 py-4">Event</th><th className="px-6 py-4">Format</th><th className="px-6 py-4">Entry</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Action</th></tr></thead><tbody>{events.map((event) => <tr key={event.id} className="border-b border-border/70 text-sm last:border-0"><td className="px-6 py-4 font-semibold">{event.title}</td><td className="px-6 py-4 text-muted-foreground">{event.mode} · {event.map}</td><td className="px-6 py-4">{event.entryFee === 0 ? 'FREE' : `₹${event.entryFee}`}</td><td className="px-6 py-4"><span className="border border-primary/30 bg-primary/10 px-2 py-1 font-mono text-[9px] uppercase text-primary">{event.status}</span></td><td className="px-6 py-4"><button className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground hover:text-primary">Modify</button></td></tr>)}</tbody></table></div>
        </section>
        <section className="mt-8 border border-border bg-card p-6"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">Finance queue</p><h2 className="mt-2 font-display text-2xl font-bold uppercase">Manual UPI reviews</h2><div className="mt-5 grid gap-3">{paymentQueue.length ? paymentQueue.map((payment) => <div key={payment.id} className="flex flex-col justify-between gap-3 border border-border p-4 sm:flex-row sm:items-center"><div><p className="font-semibold">Payment #{payment.id} · ₹{payment.amount}</p><a href={payment.proofUrl || '#'} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Open proof</a></div><div className="flex gap-2"><form action={async () => { 'use server'; await reviewManualPayment(payment.id, 'paid') }}><button className="border border-primary/40 px-3 py-2 font-mono text-[9px] uppercase text-primary">Approve</button></form><form action={async () => { 'use server'; await reviewManualPayment(payment.id, 'rejected') }}><button className="border border-destructive/40 px-3 py-2 font-mono text-[9px] uppercase text-destructive">Reject</button></form></div></div>) : <p className="border border-dashed border-border p-6 text-sm text-muted-foreground">No manual payments awaiting review.</p>}</div></section>
      </div>
    </main>
  )
}
