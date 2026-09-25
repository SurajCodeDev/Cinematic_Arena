import { NextResponse } from "next/server";
import { readDB } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";

export async function GET() {
  const db = await readDB();
  const admin = await getSessionUser(db);
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }
  const safe = db.users.map((u) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    phone: u.phone,
    role: u.role,
    uid: u.uid,
    team: u.team,
    wallet: u.wallet,
    emailVerified: u.emailVerified,
    phoneVerified: u.phoneVerified,
    avatar: u.avatar || "",
    createdAt: u.createdAt,
    transactions: db.transactions
      .filter((t) => t.userId === u.id)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
  }));
  return NextResponse.json({ ok: true, users: safe });
}
