import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";

export async function POST(req: Request) {
  const { amount, upiTxnRef, note } = await req.json();
  const n = Math.floor(Number(amount) || 0);
  if (n <= 0 || n > 1000000) {
    return NextResponse.json({ ok: false, error: "Enter a valid amount between ₹1 and ₹10,00,000." }, { status: 400 });
  }

  const db = await readDB();
  const user = await getSessionUser(db);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  const txnRef = String(upiTxnRef || "").trim();
  if (!txnRef) {
    return NextResponse.json({ ok: false, error: "Enter your UPI transaction reference." }, { status: 400 });
  }
  const payment = {
    id: `pay-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    amount: n,
    upiId: db.payment.upiId,
    upiTxnRef: txnRef,
    note: String(note || "").trim(),
    status: "PENDING VERIFICATION",
    createdAt: new Date().toISOString(),
    type: "TOPUP" as const,
    method: "UPI" as const,
  };
  db.payments.push(payment);
  db.notifications.push({
    id: `nt-${Date.now()}`,
    type: "PAYMENT",
    message: `Wallet top-up of ₹${n.toLocaleString("en-IN")} submitted. Awaiting admin verification.`,
    date: new Date().toISOString().slice(0, 10),
    read: false,
    userId: user.id,
  });
  await writeDB(db);

  return NextResponse.json({ ok: true, balance: user.wallet, payment });
}
