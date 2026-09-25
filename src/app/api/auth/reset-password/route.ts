import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";
import { findByIdentifier, verifyOtp, OTP_MOCK, isValidEmail, isValidPhone } from "@/lib/server/otp";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { identifier, otp, password } = await req.json();
  const id = String(identifier || "").trim().toLowerCase();
  const otpCode = String(otp || "").trim();
  const nextPassword = String(password || "");

  if (!id || (!isValidEmail(id) && !isValidPhone(id))) {
    return NextResponse.json({ ok: false, error: "Enter a valid email or 10-digit mobile number." }, { status: 400 });
  }
  if (!otpCode || otpCode.length !== 6) {
    return NextResponse.json({ ok: false, error: "Enter the 6-digit OTP." }, { status: 400 });
  }
  if (nextPassword.length < 6) {
    return NextResponse.json({ ok: false, error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const { user } = await findByIdentifier(id);
  if (!user) {
    return NextResponse.json({ ok: false, error: "No account found with this email/mobile." }, { status: 404 });
  }

  const identifiers = [user.email, user.phone, id].filter(Boolean);
  let ok = false;
  for (const ident of identifiers) {
    if (await verifyOtp(user.id, ident, otpCode, "reset")) {
      ok = true;
      break;
    }
  }
  if (!ok) {
    return NextResponse.json({ ok: false, error: OTP_MOCK ? "Invalid OTP." : "Invalid or expired OTP." }, { status: 400 });
  }

  const db = await readDB();
  const live = db.users.find((u) => u.id === user.id);
  if (!live) {
    return NextResponse.json({ ok: false, error: "No account found." }, { status: 404 });
  }
  live.password = nextPassword;
  if (live.email) live.emailVerified = true;
  await writeDB(db);

  return NextResponse.json({ ok: true });
}
