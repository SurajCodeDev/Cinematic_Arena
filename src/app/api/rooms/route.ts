import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tournamentId = searchParams.get("tournamentId");
  if (!tournamentId) {
    return NextResponse.json({ ok: false, error: "tournamentId is required." }, { status: 400 });
  }
  const db = await readDB();
  const user = await getSessionUser(db);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  const isAdmin = user.role === "admin";
  const registered = db.registrations.some((r) => r.userId === user.id && r.tournamentId === tournamentId);
  if (!isAdmin && !registered) {
    return NextResponse.json({ ok: false, error: "Join the tournament to see the room." }, { status: 403 });
  }
  const room = db.rooms.find((r) => r.tournamentId === tournamentId) || null;
  return NextResponse.json({ ok: true, room });
}

export async function PUT(req: Request) {
  const db = await readDB();
  const admin = await getSessionUser(db);
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }
  const { tournamentId, roomId, password } = await req.json();
  if (!tournamentId) {
    return NextResponse.json({ ok: false, error: "tournamentId is required." }, { status: 400 });
  }
  const existing = db.rooms.find((r) => r.tournamentId === tournamentId);
  const room = {
    tournamentId,
    roomId: String(roomId || "").trim(),
    password: String(password || "").trim(),
    updatedAt: new Date().toISOString(),
  };
  if (existing) {
    existing.roomId = room.roomId;
    existing.password = room.password;
    existing.updatedAt = room.updatedAt;
  } else {
    db.rooms.push(room);
  }
  await writeDB(db);
  return NextResponse.json({ ok: true, room });
}
