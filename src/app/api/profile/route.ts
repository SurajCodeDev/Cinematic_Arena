import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";
import { getSessionUser, safeUser } from "@/lib/server/auth";
import { isValidUid } from "@/lib/server/otp";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const db = await readDB();
  const user = await getSessionUser(db);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json();
  const name = String(body.name ?? user.name).trim();
  const team = String(body.team ?? user.team).trim();
  const uid = String(body.uid ?? user.uid).trim();
  const username = String(body.username ?? user.username ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);
  const avatar = typeof body.avatar === "string" ? body.avatar : user.avatar || "";

  if (!name) {
    return NextResponse.json({ ok: false, error: "Name is required." }, { status: 400 });
  }
  if (uid && !isValidUid(uid)) {
    return NextResponse.json({ ok: false, error: "Enter a valid BGMI UID (9-10 digits)." }, { status: 400 });
  }
  if (avatar && avatar.length > 350000) {
    return NextResponse.json({ ok: false, error: "Profile photo is too large. Use a smaller image." }, { status: 400 });
  }
  if (username && username !== (user.username || "").toLowerCase()) {
    const taken = db.users.find((u) => u.id !== user.id && (u.username || "").toLowerCase() === username);
    if (taken) {
      return NextResponse.json({ ok: false, error: "Username already taken." }, { status: 409 });
    }
  }

  user.name = name;
  user.team = team || user.team;
  if (uid) user.uid = uid;
  if (username) user.username = username;
  user.avatar = avatar;

  await writeDB(db);
  return NextResponse.json({ ok: true, user: safeUser(user) });
}
