'use client'

import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Crosshair,
  Flame,
  Gamepad2,
  Gift,
  Menu,
  MessageCircle,
  ShieldCheck,
  Swords,
  Trophy,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react'

const tournaments = [
  { id: 1, title: 'Blood Moon Invitational', type: 'Squad · Erangel', date: 'Tonight · 09:30 PM', prize: '₹25,000', entry: '₹99', players: '71 / 100', status: 'Filling fast', accent: 'crimson' },
  { id: 2, title: 'Vampire Solo Hunt', type: 'Solo · Livik', date: 'Tomorrow · 07:00 PM', prize: '₹8,500', entry: 'FREE', players: '238 / 500', status: 'Open', accent: 'violet' },
  { id: 3, title: 'Nightwatch Scrims', type: 'Squad · Miramar', date: 'Sun, 15 Sep · 06:00 PM', prize: '₹50,000', entry: '₹249', players: '44 / 64', status: 'Open', accent: 'amber' },
]

const navItems = ['Arena', 'Tournaments', 'Leaderboard', 'How it works']

export function ArenaHome() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All events')
  const [toast, setToast] = useState('')
  const filtered = useMemo(() => activeFilter === 'All events' ? tournaments : tournaments.filter((event) => activeFilter === 'Free' ? event.entry === 'FREE' : event.entry !== 'FREE'), [activeFilter])

  function notify(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {toast && <div role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-primary/30 bg-card px-5 py-3 text-sm text-card-foreground shadow-2xl">{toast}</div>}
      <div className="arena-noise pointer-events-none fixed inset-0 z-0 opacity-40" />
      <header className="relative z-20 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <button className="flex items-center gap-3" onClick={() => notify('Welcome to the Nightfall Arena')} aria-label="Nightfall Arena home">
            <span className="grid size-10 place-items-center border border-primary/40 bg-primary/10 text-primary shadow-[0_0_24px_var(--primary-glow)]"><Swords className="size-5" /></span>
            <span className="text-left"><span className="block font-display text-sm font-bold tracking-[0.2em] text-foreground">NIGHTFALL</span><span className="block font-mono text-[9px] tracking-[0.38em] text-muted-foreground">ARENA / 4.6</span></span>
          </button>
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
            {navItems.map((item, index) => <a key={item} href={index === 1 ? '#tournaments' : index === 2 ? '#leaderboard' : '#top'} className={`font-mono text-[11px] uppercase tracking-[0.16em] transition-colors hover:text-primary ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`}>{item}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            <button className="hidden size-10 place-items-center border border-border bg-card/50 text-muted-foreground transition hover:border-primary/50 hover:text-primary sm:grid" onClick={() => notify('Notifications are clear')} aria-label="Notifications"><Bell className="size-4" /></button>
            <a href="/sign-in" className="hidden items-center gap-2 border border-border bg-card/50 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground transition hover:border-primary/50 hover:text-primary sm:flex"><Users className="size-4" /> Sign in</a>
            <a href="/sign-in" className="flex items-center border border-primary/40 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-primary transition hover:bg-primary/10 sm:hidden">Login</a>
            <button className="grid size-10 place-items-center border border-border text-muted-foreground lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">{mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
          </div>
        </div>
        {mobileOpen && <div className="border-t border-border px-5 py-4 lg:hidden"><div className="flex flex-col gap-4">{navItems.map((item) => <a key={item} href="#tournaments" className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground" onClick={() => setMobileOpen(false)}>{item}</a>)}</div></div>}
      </header>

      <section id="top" className="relative isolate min-h-[600px] overflow-hidden border-b border-border lg:min-h-[650px]">
        <img src="/arena-vampire.png" alt="Masked tactical champion in the Nightfall Arena" className="absolute inset-0 -z-20 size-full object-cover object-center opacity-80" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,oklch(0.07_0.015_270)_0%,oklch(0.08_0.01_270/.82)_33%,oklch(0.08_0.01_270/.2)_73%,oklch(0.08_0.01_270/.72)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,oklch(0.07_0.015_270)_0%,transparent_45%,oklch(0.07_0.015_270/.5)_100%)]" />
        <div className="mx-auto flex min-h-[600px] max-w-7xl items-end px-5 pb-16 pt-24 lg:min-h-[650px] lg:items-center lg:px-8 lg:pb-12">
          <div className="max-w-2xl">
            <div className="mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-primary"><span className="size-2 animate-pulse bg-primary" /> Season 01 · The Crimson Protocol</div>
            <h1 className="font-display text-5xl font-black uppercase leading-[0.9] tracking-[-0.04em] text-foreground sm:text-7xl lg:text-8xl">Enter the<br /><span className="text-primary text-shadow-glow">Nightfall.</span></h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-foreground/70 sm:text-lg">BGMI 4.6 tournament operations for players who came to dominate. Form your squad, survive the blood moon, and claim your share of the arena.</p>
            <div className="mt-9 flex flex-wrap gap-3"><button className="group flex items-center gap-3 bg-primary px-6 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-primary-foreground transition hover:bg-primary/90" onClick={() => document.getElementById('tournaments')?.scrollIntoView({ behavior: 'smooth' })}>Browse tournaments <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></button><a href="/sign-up" className="flex items-center gap-3 border border-foreground/20 bg-background/30 px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground backdrop-blur-sm transition hover:border-primary/50 hover:text-primary">Create your squad <Users className="size-4" /></a></div>
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 border-t border-foreground/15 pt-5"><div><p className="font-display text-2xl font-bold text-foreground">₹12.8L</p><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Prize pool paid</p></div><div><p className="font-display text-2xl font-bold text-foreground">4,280+</p><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Arena players</p></div><div><p className="font-display text-2xl font-bold text-foreground">100%</p><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Fair play tracked</p></div></div>
          </div>
        </div>
        <div className="absolute bottom-8 right-8 hidden items-center gap-3 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground lg:flex"><span className="size-1.5 bg-primary" /> Scroll to deploy <ChevronRight className="size-3" /></div>
      </section>

      <section className="border-b border-border bg-card/35"><div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border sm:grid-cols-4"><Stat icon={<Trophy />} value="128" label="Events hosted" /><Stat icon={<Zap />} value="24/7" label="Live operations" /><Stat icon={<ShieldCheck />} value="99.8%" label="Fair-play score" /><Stat icon={<CircleDollarSign />} value="₹0" label="Withdrawal fees" /></div></section>

      <section id="tournaments" className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><div className="section-kicker"><span /> Live deployment board</div><h2 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl">Choose your hunt</h2><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Free entries, high-stakes prize pools, and anti-cheat reviewed events. Every match is built for a clean competitive experience.</p></div><div className="flex gap-1 border border-border bg-card/60 p-1" role="tablist" aria-label="Tournament filters">{['All events', 'Free', 'Paid'].map((filter) => <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition ${activeFilter === filter ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`} role="tab" aria-selected={activeFilter === filter}>{filter}</button>)}</div></div><div className="mt-9 grid gap-4 lg:grid-cols-3">{filtered.map((event) => <TournamentCard key={event.id} event={event} onJoin={() => notify(`${event.title} selected — sign in to register`)} />)}</div></section>

      <section id="leaderboard" className="border-y border-border bg-card/30"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1fr_1.15fr] lg:px-8"><div><div className="section-kicker"><span /> Command center</div><h2 className="mt-4 max-w-md font-display text-4xl font-bold uppercase leading-none tracking-tight">Built for the<br /><span className="text-primary">whole squad.</span></h2><p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">One control room for registrations, roster invites, match rooms, scoreboards, prize ledgers, and dispute resolution. No scattered screenshots. No guesswork.</p><div className="mt-8 grid max-w-md gap-3 sm:grid-cols-2"><Feature icon={<Gamepad2 />} title="Match ready" text="Room details release securely before the drop." /><Feature icon={<MessageCircle />} title="Share squad link" text="Invite teammates through WhatsApp or Telegram." /><Feature icon={<ShieldCheck />} title="Evidence first" text="Report suspicious play with a clear audit trail." /><Feature icon={<WalletCards />} title="Prize control" text="Track entries, winnings, and withdrawals." /></div></div><div className="border border-border bg-background/70 p-5 sm:p-7"><div className="flex items-center justify-between border-b border-border pb-5"><div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Season leaderboard</p><p className="mt-1 font-display text-xl font-bold uppercase">The bloodline</p></div><span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground"><span className="size-1.5 animate-pulse bg-primary" /> Live</span></div><div className="mt-3">{['VAMP//PRIME', 'Team Revenant', 'Clutch Coven', 'Nocturne 4'].map((team, index) => <div key={team} className="flex items-center gap-4 border-b border-border/70 py-4 last:border-0"><span className={`font-mono text-xs ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`}>0{index + 1}</span><div className={`grid size-9 place-items-center border ${index === 0 ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground'}`}><Crosshair className="size-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{team}</p><p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{index + 1 === 1 ? 'Squad · 4 wins' : 'Squad · Verified'}</p></div><p className="font-mono text-sm text-foreground">{[1240, 1048, 986, 912][index]} <span className="text-[9px] text-muted-foreground">PTS</span></p></div>)}</div><button className="mt-3 flex w-full items-center justify-center gap-2 border border-border py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition hover:border-primary/50 hover:text-primary" onClick={() => notify('Full leaderboard is coming to the player dashboard')}>View full leaderboard <ArrowRight className="size-3" /></button></div></div></section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="relative overflow-hidden border border-primary/25 bg-primary/5 px-6 py-12 text-center sm:px-12"><div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" /><Flame className="mx-auto size-6 text-primary" /><h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-bold uppercase tracking-tight sm:text-5xl">The arena is waiting.</h2><p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted-foreground">Create your player profile, join your first event, and put your name on the board.</p><button className="mt-8 inline-flex items-center gap-3 bg-primary px-6 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-primary-foreground transition hover:bg-primary/90" onClick={() => notify('Secure player onboarding is ready')}>Deploy your profile <ArrowRight className="size-4" /></button></div></section>

      <footer className="border-t border-border"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8"><div><p className="font-display text-sm font-bold tracking-[0.2em]">NIGHTFALL ARENA</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Competitive. Verified. Yours.</p></div><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">© 2026 Nightfall Operations · Fair play only</p></div></footer>
    </main>
  )
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) { return <div className="flex items-center gap-3 px-4 py-5 sm:justify-center sm:gap-4 sm:py-7"><span className="text-primary">{icon}</span><div><p className="font-display text-xl font-bold text-foreground sm:text-2xl">{value}</p><p className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground sm:text-[9px]">{label}</p></div></div> }
function TournamentCard({ event, onJoin }: { event: typeof tournaments[number]; onJoin: () => void }) { return <article className="group relative border border-border bg-card/60 p-5 transition hover:-translate-y-1 hover:border-primary/50 hover:bg-card"><div className={`absolute inset-x-0 top-0 h-0.5 ${event.accent === 'crimson' ? 'bg-primary' : event.accent === 'violet' ? 'bg-violet-400' : 'bg-amber-400'}`} /><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-2"><span className="size-2 bg-primary" /><span className="font-mono text-[9px] uppercase tracking-[0.15em] text-primary">{event.status}</span></div><span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">ID / NF-0{event.id}42</span></div><h3 className="mt-8 font-display text-2xl font-bold uppercase leading-none text-foreground">{event.title}</h3><div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground"><span>{event.type}</span><span>{event.date}</span></div><div className="mt-7 grid grid-cols-3 border-y border-border py-4"><div><p className="font-display text-lg font-bold text-foreground">{event.prize}</p><p className="font-mono text-[8px] uppercase tracking-[0.1em] text-muted-foreground">Prize pool</p></div><div><p className="font-display text-lg font-bold text-foreground">{event.entry}</p><p className="font-mono text-[8px] uppercase tracking-[0.1em] text-muted-foreground">Entry</p></div><div><p className="font-display text-lg font-bold text-foreground">{event.players}</p><p className="font-mono text-[8px] uppercase tracking-[0.1em] text-muted-foreground">Slots</p></div></div><button onClick={onJoin} className="mt-5 flex w-full items-center justify-between border border-border px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground transition group-hover:border-primary/50 group-hover:text-primary"><span>View event brief</span><ChevronRight className="size-4" /></button></article> }
function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="border border-border bg-background/40 p-4"><span className="text-primary">{icon}</span><p className="mt-3 text-xs font-semibold text-foreground">{title}</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">{text}</p></div> }

export default ArenaHome
