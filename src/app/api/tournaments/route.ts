import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";
import { clampPrizeLabel } from "@/lib/arena";

export async function GET() {
  const db = await readDB();
  return NextResponse.json({ ok: true, tournaments: db.tournaments });
}

export async function POST(req: Request) {
  const body = await req.json();
  const db = await readDB();
  const admin = await getSessionUser(db);
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }
  const t = {
    id: `t-${Date.now()}`,
    name: "New BGMI Tournament",
    short: "NEW EVENT",
    game: "BGMI",
    status: "UPCOMING",
    mode: "SQUAD",
    prizePool: "₹2,500",
    entryFee: "₹19",
    teams: 64,
    teamsJoined: 0,
    date: "01 SEP",
    time: "08:00 PM",
    format: "Point-Based League",
    map: "ERANGEL",
    rules: ["Fair play is mandatory.", "Screenshots required for results."],
    image: "/images/bgmi-9.jpg",
    ...body,
  };
  t.prizePool = clampPrizeLabel(t.prizePool);
  db.tournaments.push(t);
  await writeDB(db);
  return NextResponse.json({ ok: true, tournament: t });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const db = await readDB();
  const admin = await getSessionUser(db);
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }
  const idx = db.tournaments.findIndex((t) => t.id === body.id);
  if (idx < 0) {
    return NextResponse.json({ ok: false, error: "Tournament not found." }, { status: 404 });
  }
  db.tournaments[idx] = { ...db.tournaments[idx], ...body };
  db.tournaments[idx].prizePool = clampPrizeLabel(db.tournaments[idx].prizePool);
  await writeDB(db);
  return NextResponse.json({ ok: true, tournament: db.tournaments[idx] });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const db = await readDB();
  const admin = await getSessionUser(db);
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }
  db.tournaments = db.tournaments.filter((t) => t.id !== id);
  db.registrations = db.registrations.filter((r) => r.tournamentId !== id);
  await writeDB(db);
  return NextResponse.json({ ok: true });
}
