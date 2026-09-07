'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const isSignUp = mode === 'sign-up'

  function useDemo(role: 'admin' | 'player') {
    setEmail(role === 'admin' ? 'admin@nightfall.test' : 'player@nightfall.test')
    setPassword(role === 'admin' ? 'NightfallAdmin2026!' : 'NightfallPlayer2026!')
    setError('Demo credentials loaded. Press sign in to enter the arena.')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true); setError('')
    const data = new FormData(event.currentTarget)
    const result = isSignUp
      ? await authClient.signUp.email({ name: String(data.get('name')), email: String(data.get('email')), password: String(data.get('password')) })
      : await authClient.signIn.email({ email: String(data.get('email')), password: String(data.get('password')) })
    setPending(false)
    if (result.error) { setError('We could not verify those details. Please try again.'); return }
    router.push('/dashboard'); router.refresh()
  }

  return <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-5 border border-border bg-card/80 p-6 backdrop-blur sm:p-8">
    <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Nightfall access</p><h1 className="mt-3 font-display text-4xl font-bold uppercase">{isSignUp ? 'Create operator' : 'Return to arena'}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{isSignUp ? 'Build your verified player identity and squad profile.' : 'Sign in to manage registrations, rosters, and winnings.'}</p></div>
    {isSignUp && <label className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Display name<input name="name" required minLength={2} className="border border-input bg-background px-3 py-3 font-sans text-sm normal-case tracking-normal text-foreground" /></label>}
    <label className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Email<input name="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="border border-input bg-background px-3 py-3 font-sans text-sm normal-case tracking-normal text-foreground" /></label>
    <label className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Password<input name="password" type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="border border-input bg-background px-3 py-3 font-sans text-sm normal-case tracking-normal text-foreground" /></label>
    {!isSignUp && <div className="border border-primary/20 bg-primary/5 p-4"><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-primary">Demo access</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Use a seeded role to inspect the player or admin experience.</p><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => useDemo('player')} className="border border-border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-foreground hover:border-primary/50">Demo player</button><button type="button" onClick={() => useDemo('admin')} className="border border-primary/40 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-primary hover:bg-primary/10">Demo admin</button></div><p className="mt-3 font-mono text-[8px] leading-4 text-muted-foreground">Player: player@nightfall.test<br />Admin: admin@nightfall.test</p></div>}
    {error && <p role="alert" className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
    <button disabled={pending} className="bg-primary px-5 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-primary-foreground disabled:opacity-60">{pending ? 'Verifying...' : isSignUp ? 'Create profile' : 'Sign in'}</button>
    <a href={isSignUp ? '/sign-in' : '/sign-up'} className="text-center text-sm text-muted-foreground hover:text-primary">{isSignUp ? 'Already have access? Sign in' : 'New operator? Create an account'}</a>
  </form>
}
