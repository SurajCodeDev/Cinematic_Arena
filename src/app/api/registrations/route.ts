import { NextResponse } from "next/server";
import { readDB, writeDB, type ServerRegistration } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";
import { formatINR, isFreeTournament, isInviteOnly, squadSizeFor, totalEntryFee } from "@/lib/arena";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const db = await readDB();
  const user = await getSessionUser(db);
  if (!user) {
    return NextResponse.json({ ok: true, registrations: [] });
  }
  const isAdmin = user.role === "admin";
  if (userId && !isAdmin && userId !== user.id) {
    return NextResponse.json({ ok: false, error: "Not allowed." }, { status: 403 });
  }
  const regs = isAdmin
    ? db.registrations
    : db.registrations.filter((r) => r.userId === user.id);
  return NextResponse.json({ ok: true, registrations: regs });
}

export async function POST(req: Request) {
  const { tournamentId, teamName, playerName, playerUid, playerEmail, members, paymentMethod, upiTxnRef, note } = await req.json();
  const db = await readDB();
  const user = await getSessionUser(db);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  const userId = user.id;

  if (db.registrations.some((r) => r.userId === userId && r.tournamentId === tournamentId)) {
    return NextResponse.json({ ok: false, error: "Already registered." }, { status: 409 });
  }

  const t = db.tournaments.find((x) => x.id === tournamentId);
  if (!t) {
    return NextResponse.json({ ok: false, error: "Tournament not found." }, { status: 404 });
  }
  if (t.teamsJoined >= t.teams) {
    return NextResponse.json({ ok: false, error: "Tournament is full." }, { status: 400 });
  }
  if (isInviteOnly(t)) {
    return NextResponse.json({ ok: false, error: "This tournament is invite-only." }, { status: 403 });
  }

  const size = squadSizeFor(t.mode);
  const fee = totalEntryFee(t);
  const cleanMembers = Array.isArray(members)
    ? members
        .map((m: { name?: string; uid?: string }) => ({
          name: (m?.name || "").toString().trim(),
          uid: (m?.uid || "").toString().trim(),
        }))
        .filter((m: { name: string; uid: string }) => m.name && m.uid)
    : [];
  if (cleanMembers.length > size - 1) {
    return NextResponse.json({ ok: false, error: `Too many teammates for ${t.mode} mode. Max ${size - 1}.` }, { status: 400 });
  }

  const registration: ServerRegistration = {
    userId,
    tournamentId,
    tournamentName: t.name,
    playerName: playerName || user.name,
    playerUid: playerUid || user.uid,
    playerEmail: playerEmail || user.email,
    teamName: teamName || "Team Solo",
    members: cleanMembers,
    claimed: false,
    status: "FREE",
    registeredAt: new Date().toISOString(),
  };

  let wallet = user.wallet;
  let pendingPayment = null;

  if (!isFreeTournament(t)) {
    const method = paymentMethod === "wallet" ? "wallet" : paymentMethod === "upi" ? "upi" : "wallet";

    if (method === "upi") {
      const payId = `pay-${Date.now()}`;
      pendingPayment = {
        id: payId,
        userId,
        userName: user.name,
        amount: fee,
        upiId: db.payment.upiId,
        upiTxnRef: String(upiTxnRef || "").trim(),
        note: String(note || "").trim(),
        status: "PENDING VERIFICATION",
        createdAt: new Date().toISOString(),
        type: "ENTRY" as const,
        method: "UPI" as const,
        tournamentId,
        tournamentName: t.name,
      };
      db.payments.push(pendingPayment);
      registration.status = "PENDING";
      registration.paymentId = payId;
      db.notifications.push({
        id: `nt-${Date.now()}`,
        type: "PAYMENT",
        message: `Entry payment of ${formatINR(fee)} (${size} players) for ${t.name} submitted. Awaiting admin verification.`,
        date: new Date().toISOString().slice(0, 10),
        read: false,
        userId,
      });
    } else {
      if (user.wallet < fee) {
        return NextResponse.json(
          { ok: false, error: `Insufficient wallet balance. Entry is ${formatINR(fee)} for ${size} players. Add funds first.` },
          { status: 400 }
        );
      }
      user.wallet -= fee;
      wallet = user.wallet;
      registration.status = "WALLET";
      db.transactions.push({
        id: `tx-${Date.now()}`,
        userId,
        label: `Entry Fee (${size} players) — ${t.name}`,
        amount: -fee,
        status: "PAID",
        createdAt: new Date().toISOString(),
      });
    }
  }

  db.registrations.push(registration);
  if (isFreeTournament(t) || registration.status === "WALLET") {
    t.teamsJoined += 1;
  }
  await writeDB(db);

  return NextResponse.json({
    ok: true,
    wallet,
    pending: !!pendingPayment,
    payment: pendingPayment,
    registrations: db.registrations.filter((r) => r.userId === userId),
  });
}

export async function DELETE(req: Request) {
  const { tournamentId } = await req.json();
  const db = await readDB();
  const user = await getSessionUser(db);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  const userId = user.id;

  const before = db.registrations.length;
  const reg = db.registrations.find((r) => r.userId === userId && r.tournamentId === tournamentId);
  db.registrations = db.registrations.filter(
    (r) => !(r.userId === userId && r.tournamentId === tournamentId)
  );

  if (db.registrations.length !== before) {
    const t = db.tournaments.find((x) => x.id === tournamentId);
    if (t && t.teamsJoined > 0 && reg && reg.status !== "PENDING") t.teamsJoined -= 1;
    if (reg?.paymentId) {
      db.payments = db.payments.filter((p) => p.id !== reg.paymentId);
    }
  }
  await writeDB(db);
  return NextResponse.json({ ok: true });
}
