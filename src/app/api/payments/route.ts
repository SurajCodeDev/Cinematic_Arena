import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function makeRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function GET() {
  const db = await readDB();
  const user = await getSessionUser(db);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  const payments =
    user.role === "admin"
      ? db.payments
      : db.payments.filter((p) => p.userId === user.id);
  const sorted = [...payments].sort((a, b) => {
    const pendingA = a.status === "PENDING VERIFICATION" ? 0 : 1;
    const pendingB = b.status === "PENDING VERIFICATION" ? 0 : 1;
    if (pendingA !== pendingB) return pendingA - pendingB;
    return a.createdAt < b.createdAt ? 1 : -1;
  });
  return NextResponse.json(
    { ok: true, payments: sorted },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

export async function POST(req: Request) {
  const { amount, upiTxnRef, note } = await req.json();
  const n = Math.floor(Number(amount) || 0);
  if (n <= 0) {
    return NextResponse.json({ ok: false, error: "Enter a valid amount." }, { status: 400 });
  }

  const db = await readDB();
  const user = await getSessionUser(db);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  const payment = {
    id: `pay-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    amount: n,
    upiId: db.payment.upiId,
    upiTxnRef: String(upiTxnRef || makeRef()).trim(),
    note: String(note || "").trim(),
    status: "PENDING VERIFICATION",
    createdAt: new Date().toISOString(),
  };

  db.payments.push(payment);
  await writeDB(db);

  return NextResponse.json({ ok: true, payment });
}
