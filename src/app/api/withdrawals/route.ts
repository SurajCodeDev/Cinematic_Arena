import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";

export async function GET() {
  const db = await readDB();
  const user = await getSessionUser(db);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  const withdrawals =
    user.role === "admin" ? db.withdrawals : db.withdrawals.filter((w) => w.userId === user.id);
  const sorted = [...withdrawals].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return NextResponse.json({ ok: true, withdrawals: sorted });
}

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

  const withdrawal = {
    id: `wd-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    upiId: "",
    amount: n,
    status: "PENDING" as const,
    createdAt: new Date().toISOString(),
  };
  db.withdrawals.push(withdrawal);
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

  return NextResponse.json({ ok: true, balance: user.wallet, withdrawal });
}

export async function PUT(req: Request) {
  const db = await readDB();
  const admin = await getSessionUser(db);
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }
  const { id, action, upiId, remarks } = await req.json();

  const w = db.withdrawals.find((x) => x.id === id);
  if (!w) {
    return NextResponse.json({ ok: false, error: "Withdrawal not found." }, { status: 404 });
  }
  if (w.status !== "PENDING") {
    return NextResponse.json({ ok: false, error: "Withdrawal already processed." }, { status: 409 });
  }

  const user = db.users.find((u) => u.id === w.userId);

  if (action === "approve") {
    w.status = "APPROVED";
    w.upiId = String(upiId || "").trim();
    w.processedAt = new Date().toISOString();
    if (user) {
      db.notifications.push({
        id: `nt-${Date.now()}`,
        type: "PAYMENT",
        message: `Your withdrawal of ₹${w.amount.toLocaleString("en-IN")} has been approved and sent to your UPI.`,
        date: new Date().toISOString().slice(0, 10),
        read: false,
        userId: w.userId,
      });
      const tx = db.transactions.find((t) => t.userId === w.userId && t.amount === -w.amount && t.status === "PENDING");
      if (tx) tx.status = "APPROVED";
    }
  } else if (action === "reject") {
    w.status = "REJECTED";
    w.remarks = String(remarks || "Withdrawal rejected by admin.").trim();
    w.processedAt = new Date().toISOString();
    if (user) {
      user.wallet += w.amount;
      db.transactions.push({
        id: `tx-${Date.now()}`,
        userId: w.userId,
        label: "Withdrawal Refund",
        amount: w.amount,
        status: "CREDITED",
        createdAt: new Date().toISOString(),
      });
      db.notifications.push({
        id: `nt-${Date.now()}`,
        type: "PAYMENT",
        message: `Your withdrawal of ₹${w.amount.toLocaleString("en-IN")} was rejected. Amount refunded to wallet.`,
        date: new Date().toISOString().slice(0, 10),
        read: false,
        userId: w.userId,
      });
    }
  } else {
    return NextResponse.json({ ok: false, error: "Invalid action." }, { status: 400 });
  }

  await writeDB(db);
  return NextResponse.json({ ok: true, withdrawal: w, balance: user?.wallet });
}
