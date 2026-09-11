import QRCode from 'qrcode'

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ amount?: string }> }) {
  const { amount = '99' } = await searchParams
  const uri = `upi://pay?pa=ksuraj138@ybl&pn=Nightfall%20Arena&am=${encodeURIComponent(amount)}&cu=INR`
  const qr = await QRCode.toDataURL(uri, { margin: 1, width: 280 })
  return <main className="min-h-screen bg-background px-5 py-12 text-foreground"><div className="mx-auto max-w-lg border border-border bg-card p-6 text-center sm:p-10"><a href="/" className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Back to arena</a><p className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Manual UPI fallback</p><h1 className="mt-3 font-display text-4xl font-bold uppercase">Scan to pay</h1><p className="mt-4 text-sm text-muted-foreground">Pay the exact entry amount, then submit the transaction screenshot to admin for review.</p><img src={qr} alt="UPI payment QR code" className="mx-auto mt-7 size-64 border border-border bg-white p-3" /><p className="mt-5 font-mono text-sm text-foreground">ksuraj138@ybl</p><p className="mt-2 font-mono text-xs text-primary">₹{amount}</p><p className="mt-7 border border-primary/20 bg-primary/5 p-4 text-left text-xs leading-5 text-muted-foreground">Never share your UPI PIN or OTP. Payment is marked active only after manual verification.</p></div></main>
}
