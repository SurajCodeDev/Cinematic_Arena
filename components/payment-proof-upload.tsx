'use client'

import { useState } from 'react'

export function PaymentProofUpload({ registrationId }: { registrationId?: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState('')
  const [pending, setPending] = useState(false)

  async function submitProof(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!registrationId || !file) {
      setStatus('Select a payment screenshot first.')
      return
    }
    setPending(true)
    setStatus('Uploading proof securely...')
    const formData = new FormData()
    formData.set('registrationId', registrationId)
    formData.set('proof', file)
    const response = await fetch('/api/payments/manual', { method: 'POST', body: formData })
    const result = await response.json()
    setPending(false)
    setStatus(response.ok ? 'Submitted. Admin review is pending.' : result.error || 'Upload failed. Try again.')
    if (response.ok) setFile(null)
  }

  return <form onSubmit={submitProof} className="mt-6 border-t border-border pt-6 text-left"><label className="grid gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Payment screenshot<input type="file" accept="image/jpeg,image/png,application/pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} className="border border-input bg-background p-3 text-xs normal-case tracking-normal text-foreground file:mr-3 file:border-0 file:bg-primary file:px-3 file:py-2 file:font-mono file:text-[9px] file:uppercase file:text-primary-foreground" /></label><button disabled={pending || !registrationId} className="mt-4 w-full bg-primary px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">{pending ? 'Uploading...' : 'Submit for review'}</button>{status && <p role="status" className="mt-3 text-xs leading-5 text-muted-foreground">{status}</p>}</form>
}
