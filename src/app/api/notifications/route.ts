import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";

export async function GET() {
  const db = await readDB();
  const user = await getSessionUser(db);
  let notifications = db.notifications;
  if (user) {
    notifications = notifications.filter((n) => !n.userId || n.userId === user.id);
  } else {
    notifications = notifications.filter((n) => !n.userId);
  }
  const sorted = [...notifications].sort((a, b) => (a.date < b.date ? 1 : -1));
  return NextResponse.json({ ok: true, notifications: sorted });
}

export async function PUT(req: Request) {
  const { id } = await req.json();
  const db = await readDB();
  const user = await getSessionUser(db);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  const n = db.notifications.find((x) => x.id === id && (!x.userId || x.userId === user.id));
  if (n) n.read = true;
  await writeDB(db);
  return NextResponse.json({ ok: true });
}

export async function POST() {
  const db = await readDB();
  const user = await getSessionUser(db);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  for (const n of db.notifications) {
    if (!n.userId || n.userId === user.id) n.read = true;
  }
  await writeDB(db);
  return NextResponse.json({ ok: true });
}
