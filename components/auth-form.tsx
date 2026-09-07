'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const isSignUp = mode === 'sign-up'

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
    <label className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Email<input name="email" type="email" required className="border border-input bg-background px-3 py-3 font-sans text-sm normal-case tracking-normal text-foreground" /></label>
    <label className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Password<input name="password" type="password" required minLength={8} className="border border-input bg-background px-3 py-3 font-sans text-sm normal-case tracking-normal text-foreground" /></label>
    {error && <p role="alert" className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
    <button disabled={pending} className="bg-primary px-5 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-primary-foreground disabled:opacity-60">{pending ? 'Verifying...' : isSignUp ? 'Create profile' : 'Sign in'}</button>
    <a href={isSignUp ? '/sign-in' : '/sign-up'} className="text-center text-sm text-muted-foreground hover:text-primary">{isSignUp ? 'Already have access? Sign in' : 'New operator? Create an account'}</a>
  </form>
}
