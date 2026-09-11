import { get } from '@vercel/blob'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { payments, user } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [operator] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (operator?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const pathname = new URL(request.url).searchParams.get('pathname')
  if (!pathname || !pathname.startsWith('payment-proofs/')) return NextResponse.json({ error: 'Invalid proof path' }, { status: 400 })
  const [payment] = await db.select({ id: payments.id }).from(payments).where(eq(payments.proofUrl, pathname)).limit(1)
  if (!payment) return NextResponse.json({ error: 'Proof not found' }, { status: 404 })
  const result = await get(pathname, { access: 'private', ifNoneMatch: request.headers.get('if-none-match') ?? undefined })
  if (!result) return NextResponse.json({ error: 'Proof not found' }, { status: 404 })
  if (result.statusCode === 304) return new NextResponse(null, { status: 304, headers: { ETag: result.blob.etag, 'Cache-Control': 'private, no-cache' } })
  return new NextResponse(result.stream, { headers: { 'Content-Type': result.blob.contentType, ETag: result.blob.etag, 'Cache-Control': 'private, no-cache' } })
}
