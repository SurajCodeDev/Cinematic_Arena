import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tournamentId = searchParams.get("tournamentId");
  const db = await readDB();
  let matches = db.matches;
  if (tournamentId) matches = matches.filter((m) => m.tournamentId === tournamentId);
  return NextResponse.json({ ok: true, matches });
}

export async function POST(req: Request) {
  const db = await readDB();
  const user = await getSessionUser(db);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }
  const body = await req.json();
  const match = {
    id: `M${String(Date.now()).slice(-4)}`,
    tournamentId: body.tournamentId || "",
    tournament: body.tournament || "Untitled Tournament",
    map: body.map || "ERANGEL",
    mode: body.mode || "SQUAD",
    date: body.date || "01 SEP",
    time: body.time || "08:00 PM",
    status: body.status || "UPCOMING",
    teams: Array.isArray(body.teams) ? body.teams : [],
    roomId: body.roomId || "",
    password: body.password || "",
    ...body,
  };
  db.matches.push(match);
  await writeDB(db);
  return NextResponse.json({ ok: true, match });
}

export async function PUT(req: Request) {
  const db = await readDB();
  const user = await getSessionUser(db);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }
  const body = await req.json();
  const idx = db.matches.findIndex((m) => m.id === body.id);
  if (idx < 0) {
    return NextResponse.json({ ok: false, error: "Match not found." }, { status: 404 });
  }
  db.matches[idx] = { ...db.matches[idx], ...body };
  await writeDB(db);
  return NextResponse.json({ ok: true, match: db.matches[idx] });
}

export async function DELETE(req: Request) {
  const db = await readDB();
  const user = await getSessionUser(db);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }
  const { id } = await req.json();
  db.matches = db.matches.filter((m) => m.id !== id);
  await writeDB(db);
  return NextResponse.json({ ok: true });
}
