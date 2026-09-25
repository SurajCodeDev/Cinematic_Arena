import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";

export async function POST() {
  const db = await readDB();
  const admin = await getSessionUser(db);
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }
  const arena = await import("@/data/arena");
  db.tournaments = arena.tournaments.map((t) => ({ ...t }));
  db.matches = arena.matches.map((m) => ({ ...m, teams: (m.teams || []).map((team) => ({ ...team })) }));
  db.notifications = arena.defaultNotifications.map((n) => ({ ...n }));
  db.rooms = [];
  await writeDB(db);
  return NextResponse.json({ ok: true, tournaments: db.tournaments, matches: db.matches });
}
