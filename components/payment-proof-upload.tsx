'use client'

import { MessageCircle, Send } from 'lucide-react'
import { useState } from 'react'

export function PaymentProofUpload({ registrationId }: { registrationId?: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState('')
  const [pending, setPending] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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
    if (response.ok) {
      setFile(null)
      setSubmitted(true)
    }
  }

  return <form onSubmit={submitProof} className="mt-6 border-t border-border pt-6 text-left"><label className="grid gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Payment screenshot<input type="file" accept="image/jpeg,image/png,application/pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} className="border border-input bg-background p-3 text-xs normal-case tracking-normal text-foreground file:mr-3 file:border-0 file:bg-primary file:px-3 file:py-2 file:font-mono file:text-[9px] file:uppercase file:text-primary-foreground" /></label><button disabled={pending || !registrationId} className="mt-4 w-full bg-primary px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">{pending ? 'Uploading...' : 'Submit for review'}</button>{status && <p role="status" className="mt-3 text-xs leading-5 text-muted-foreground">{status}</p>}{submitted && <div className="mt-5 grid gap-3 border-t border-border pt-5"><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-primary">Send payment details directly</p><div className="grid gap-2 sm:grid-cols-2"><a target="_blank" rel="noreferrer" href={`https://wa.me/917015742792?text=${encodeURIComponent(`Nightfall Arena payment submitted. Registration ID: ${registrationId}. Please verify my payment.`)}`} className="flex items-center justify-center gap-2 border border-primary/40 px-4 py-3 font-mono text-[9px] uppercase tracking-[0.1em] text-primary hover:bg-primary/10"><MessageCircle className="size-4" />WhatsApp admin</a><a target="_blank" rel="noreferrer" href={`https://t.me/BESTCHEAT_VIP?text=${encodeURIComponent(`Payment submitted for registration ${registrationId}. Please verify.`)}`} className="flex items-center justify-center gap-2 border border-border px-4 py-3 font-mono text-[9px] uppercase tracking-[0.1em] text-foreground hover:border-primary/50"><Send className="size-4" />Telegram admin</a></div></div>}</form>
}
