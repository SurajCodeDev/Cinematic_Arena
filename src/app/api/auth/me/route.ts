import { NextResponse } from "next/server";
import { readDB } from "@/lib/server/db";
import { getSessionUser, safeUser } from "@/lib/server/auth";

export async function GET() {
  const db = await readDB();
  const user = await getSessionUser(db);
  if (!user) {
    return NextResponse.json({ ok: false, user: null });
  }
  return NextResponse.json({ ok: true, user: safeUser(user) });
}
