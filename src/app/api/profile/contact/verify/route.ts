import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";
import { getSessionUser, safeUser } from "@/lib/server/auth";
import { verifyOtp, OTP_MOCK, isValidEmail, isValidPhone } from "@/lib/server/otp";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const db = await readDB();
  const user = await getSessionUser(db);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  const { type, value, otp } = await req.json();
  const kind = String(type || "").trim();
  const next = String(value || "").trim().toLowerCase();
  const code = String(otp || "").trim();

  if (!code || code.length !== 6) {
    return NextResponse.json({ ok: false, error: "Enter the 6-digit OTP." }, { status: 400 });
  }

  if (kind === "email") {
    if (!isValidEmail(next)) {
      return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
    }
    const ok = await verifyOtp(user.id, next, code, "change-email");
    if (!ok) {
      return NextResponse.json({ ok: false, error: OTP_MOCK ? "Invalid OTP." : "Invalid or expired OTP." }, { status: 400 });
    }
    const latest = await readDB();
    const live = latest.users.find((u) => u.id === user.id);
    if (!live) return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
    live.email = next;
    live.emailVerified = true;
    await writeDB(latest);
    return NextResponse.json({ ok: true, user: safeUser(live) });
  }

  if (kind === "phone") {
    if (!isValidPhone(next)) {
      return NextResponse.json({ ok: false, error: "Enter a valid 10-digit Indian mobile number." }, { status: 400 });
    }
    const ok = await verifyOtp(user.id, next, code, "change-phone");
    if (!ok) {
      return NextResponse.json({ ok: false, error: OTP_MOCK ? "Invalid OTP." : "Invalid or expired OTP." }, { status: 400 });
    }
    const latest = await readDB();
    const live = latest.users.find((u) => u.id === user.id);
    if (!live) return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
    live.phone = next;
    live.phoneVerified = true;
    await writeDB(latest);
    return NextResponse.json({ ok: true, user: safeUser(live) });
  }

  return NextResponse.json({ ok: false, error: "Choose email or mobile." }, { status: 400 });
}
