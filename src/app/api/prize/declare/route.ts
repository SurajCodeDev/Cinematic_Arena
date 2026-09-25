import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";
import { prizeNumber } from "@/lib/arena";

export async function POST(req: Request) {
  const { tournamentId, winner } = await req.json();
  const db = await readDB();
  const admin = await getSessionUser(db);
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  const t = db.tournaments.find((x) => x.id === tournamentId);
  if (!t) {
    return NextResponse.json({ ok: false, error: "Tournament not found." }, { status: 404 });
  }

  const winnerName = String(winner || "").trim();
  if (!winnerName) {
    return NextResponse.json({ ok: false, error: "Winner team name is required." }, { status: 400 });
  }

  t.winner = winnerName;
  t.status = "COMPLETED";

  const winnerShare = Math.floor(prizeNumber(t) * 0.5);
  const reg = db.registrations.find(
    (r) =>
      r.tournamentId === tournamentId &&
      (r.teamName.toLowerCase() === winnerName.toLowerCase() || r.playerName.toLowerCase() === winnerName.toLowerCase())
  );

  let creditedTo = "";
  if (reg && !reg.claimed) {
    const captain = db.users.find((u) => u.id === reg.userId);
    if (captain) {
      captain.wallet += winnerShare;
      reg.claimed = true;
      creditedTo = captain.name;
      db.transactions.push({
        id: `tx-${Date.now()}`,
        userId: captain.id,
        label: `Prize — ${t.name}`,
        amount: winnerShare,
        status: "CREDITED",
        createdAt: new Date().toISOString(),
      });
      db.notifications.push({
        id: `nt-${Date.now()}`,
        type: "RESULT",
        message: `Congratulations! ${winnerName} won ${t.name}. Prize of ₹${winnerShare.toLocaleString("en-IN")} credited to your wallet.`,
        date: new Date().toISOString().slice(0, 10),
        read: false,
        userId: captain.id,
      });
    }
  }

  db.notifications.push({
    id: `nt-${Date.now()}`,
    type: "RESULT",
    message: `${winnerName} is crowned champion of ${t.name}! Prize pool ${t.prizePool} won.`,
    date: new Date().toISOString().slice(0, 10),
    read: false,
  });

  await writeDB(db);

  return NextResponse.json({
    ok: true,
    tournament: t,
    creditedTo: creditedTo || null,
    amount: reg && !creditedTo ? 0 : winnerShare,
  });
}
