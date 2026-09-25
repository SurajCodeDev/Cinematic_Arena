import { NextResponse } from "next/server";
import { readDB, writeDB, type ServerPayment } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";
import { createRazorpayOrder, isRazorpayEnabled, razorpayKeys } from "@/lib/server/razorpay";
import { formatINR, isFreeTournament, isInviteOnly, squadSizeFor, totalEntryFee } from "@/lib/arena";

export async function POST(req: Request) {
  if (!isRazorpayEnabled()) {
    return NextResponse.json({ ok: false, error: "Razorpay is not configured." }, { status: 503 });
  }

  const body = await req.json();
  const kind = body.kind === "ENTRY" ? "ENTRY" : "TOPUP";
  const db = await readDB();
  const user = await getSessionUser(db);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  let amount = 0;
  let tournamentId = "";
  let tournamentName = "";
  let note = "";

  if (kind === "ENTRY") {
    tournamentId = String(body.tournamentId || "");
    const t = db.tournaments.find((x) => x.id === tournamentId);
    if (!t) return NextResponse.json({ ok: false, error: "Tournament not found." }, { status: 404 });
    if (isInviteOnly(t) || isFreeTournament(t)) {
      return NextResponse.json({ ok: false, error: "This event does not take Razorpay entry." }, { status: 400 });
    }
    if (t.teamsJoined >= t.teams) {
      return NextResponse.json({ ok: false, error: "Tournament is full." }, { status: 400 });
    }
    const existing = db.registrations.find((r) => r.userId === user.id && r.tournamentId === tournamentId);
    if (existing && existing.status !== "PENDING") {
      return NextResponse.json({ ok: false, error: "Already registered." }, { status: 409 });
    }
    amount = totalEntryFee(t);
    tournamentName = t.name;
    note = `Entry ${t.short} · ${squadSizeFor(t.mode)} players`;
  } else {
    amount = Math.floor(Number(body.amount) || 0);
    if (amount <= 0 || amount > 1000000) {
      return NextResponse.json({ ok: false, error: "Enter a valid amount between ₹1 and ₹10,00,000." }, { status: 400 });
    }
    note = String(body.note || "Wallet top-up").trim();
  }

  if (amount <= 0) {
    return NextResponse.json({ ok: false, error: "Invalid amount." }, { status: 400 });
  }

  const payId = `pay-${Date.now()}`;
  let orderId = "";
  try {
    orderId = await createRazorpayOrder({
      amountPaise: amount * 100,
      receipt: payId,
      notes: {
        payId,
        userId: user.id,
        kind,
        tournamentId,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not create Razorpay order." },
      { status: 502 }
    );
  }

  const payment: ServerPayment = {
    id: payId,
    userId: user.id,
    userName: user.name,
    amount,
    upiId: "razorpay",
    upiTxnRef: orderId,
    note,
    status: "PENDING VERIFICATION",
    createdAt: new Date().toISOString(),
    type: kind,
    method: "RAZORPAY",
    tournamentId: tournamentId || undefined,
    tournamentName: tournamentName || undefined,
    razorpayOrderId: orderId,
  };
  db.payments.push(payment);

  if (kind === "ENTRY" && tournamentId) {
    const t = db.tournaments.find((x) => x.id === tournamentId);
    const size = t ? squadSizeFor(t.mode) : 4;
    const cleanMembers = Array.isArray(body.members)
      ? body.members
          .map((m: { name?: string; uid?: string }) => ({
            name: (m?.name || "").toString().trim(),
            uid: (m?.uid || "").toString().trim(),
          }))
          .filter((m: { name: string; uid: string }) => m.name && m.uid)
          .slice(0, Math.max(0, size - 1))
      : [];
    db.registrations = db.registrations.filter(
      (r) => !(r.userId === user.id && r.tournamentId === tournamentId && r.status === "PENDING")
    );
    db.registrations.push({
      userId: user.id,
      tournamentId,
      tournamentName,
      playerName: String(body.playerName || user.name),
      playerUid: String(body.playerUid || user.uid),
      playerEmail: String(body.playerEmail || user.email),
      teamName: String(body.teamName || "Team Solo"),
      members: cleanMembers,
      claimed: false,
      status: "PENDING",
      paymentId: payId,
      registeredAt: new Date().toISOString(),
    });
  }

  db.notifications.push({
    id: `nt-${Date.now()}`,
    type: "PAYMENT",
    message: kind === "ENTRY"
      ? `Razorpay entry of ${formatINR(amount)} for ${tournamentName} started. Complete payment in the checkout.`
      : `Razorpay wallet top-up of ${formatINR(amount)} started. Complete payment in the checkout.`,
    date: new Date().toISOString().slice(0, 10),
    read: false,
    userId: user.id,
  });
  await writeDB(db);

  const { keyId } = razorpayKeys();
  return NextResponse.json({
    ok: true,
    keyId,
    orderId,
    amount,
    amountPaise: amount * 100,
    currency: "INR",
    paymentId: payId,
    name: "NEXT LEVEL ARENA",
    description: note,
    prefill: { name: user.name, email: user.email, contact: user.phone },
  });
}
