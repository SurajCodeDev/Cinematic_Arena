import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";
import { createSession, safeUser } from "@/lib/server/auth";
import { verifyOtp, OTP_MOCK } from "@/lib/server/otp";

export async function POST(req: Request) {
  const { userId, identifier, otp, purpose } = await req.json();
  const otpCode = String(otp || "").trim();
  const id = String(identifier || "").trim().toLowerCase();
  const mode = purpose || "login";

  if (!otpCode || otpCode.length !== 6) {
    return NextResponse.json({ ok: false, error: "Enter the 6-digit OTP." }, { status: 400 });
  }

  const db = await readDB();

  if (mode === "register" && userId) {
    const user = db.users.find((u) => u.id === userId);
    if (!user) return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });

    const identifiers = [user.email, user.phone].filter(Boolean);
    let ok = false;
    for (const ident of identifiers) {
      if (await verifyOtp(user.id, ident, otpCode, "register")) {
        ok = true;
        break;
      }
    }
    if (!ok) return NextResponse.json({ ok: false, error: OTP_MOCK ? "Invalid OTP." : "Invalid or expired OTP." }, { status: 400 });

    if (user.email) user.emailVerified = true;
    if (user.phone) user.phoneVerified = true;
    await writeDB(db);
    await createSession(user);
    return NextResponse.json({ ok: true, user: safeUser(user) });
  }

  // login mode: verify OTP against existing account
  const { user } = { user: db.users.find((u) => u.email.toLowerCase() === id || u.phone === id) };
  if (!user) return NextResponse.json({ ok: false, error: "No account found." }, { status: 404 });

  const ok = await verifyOtp(user.id, id, otpCode, "login");
  if (!ok) return NextResponse.json({ ok: false, error: OTP_MOCK ? "Invalid OTP." : "Invalid or expired OTP." }, { status: 400 });

  await createSession(user);
  return NextResponse.json({ ok: true, user: safeUser(user) });
}
