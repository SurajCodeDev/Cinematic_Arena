import { NextResponse } from "next/server";
import { readDB } from "@/lib/server/db";
import { createSession, safeUser } from "@/lib/server/auth";

export async function POST(req: Request) {
  const { identifier, password } = await req.json();
  const id = String(identifier || "").trim().toLowerCase();

  if (!id || !password) {
    return NextResponse.json({ ok: false, error: "Email/Mobile and password required." }, { status: 400 });
  }

  const db = await readDB();
  const user = db.users.find(
    (u) =>
      u.email.toLowerCase() === id ||
      u.phone === id ||
      (u.username ? u.username.toLowerCase() === id : false)
  );

  if (!user || user.password !== password) {
    return NextResponse.json({ ok: false, error: "Invalid credentials." }, { status: 401 });
  }

  await createSession(user);
  return NextResponse.json({ ok: true, user: safeUser(user) });
}
