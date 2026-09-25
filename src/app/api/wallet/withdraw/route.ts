import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";

export async function POST(req: Request) {
  const { amount } = await req.json();
  const n = Math.floor(Number(amount) || 0);
  if (n <= 0) {
    return NextResponse.json({ ok: false, error: "Enter a valid amount." }, { status: 400 });
  }

  const db = await readDB();
  const user = await getSessionUser(db);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  if (user.wallet < n) {
    return NextResponse.json({ ok: false, error: "Insufficient balance." }, { status: 400 });
  }

  user.wallet -= n;
  db.transactions.push({
    id: `tx-${Date.now()}`,
    userId: user.id,
    label: "Withdrawal Request",
    amount: -n,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  });
  await writeDB(db);

  return NextResponse.json({ ok: true, balance: user.wallet });
}
