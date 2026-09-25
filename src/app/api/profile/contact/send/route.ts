import { NextResponse } from "next/server";
import { readDB } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";
import { issueOtp, OTP_MOCK, isValidEmail, isValidPhone } from "@/lib/server/otp";
import { emailDeliveryEnabled, emailReachable, sendOtpEmail } from "@/lib/server/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const db = await readDB();
  const user = await getSessionUser(db);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  const { type, value } = await req.json();
  const kind = String(type || "").trim();
  const next = String(value || "").trim().toLowerCase();

  if (kind !== "email" && kind !== "phone") {
    return NextResponse.json({ ok: false, error: "Choose email or mobile." }, { status: 400 });
  }

  if (kind === "email") {
    if (!isValidEmail(next)) {
      return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
    }
    const taken = db.users.find((u) => u.id !== user.id && u.email.toLowerCase() === next);
    if (taken) {
      return NextResponse.json({ ok: false, error: "This email is already used." }, { status: 409 });
    }
    const otp = await issueOtp(user.id, next, "change-email");
    if (!emailDeliveryEnabled()) {
      if (OTP_MOCK) return NextResponse.json({ ok: true, sentTo: next, delivery: "mock", mockOtp: otp });
      return NextResponse.json({ ok: false, error: "Gmail SMTP is not configured." }, { status: 503 });
    }
    if (!emailReachable(next)) {
      return NextResponse.json({ ok: false, error: "OTP email is restricted for this address." }, { status: 403 });
    }
    const sent = await sendOtpEmail(next, user.name, otp);
    if (!sent.ok) {
      if (OTP_MOCK) return NextResponse.json({ ok: true, sentTo: next, delivery: "mock", mockOtp: otp });
      return NextResponse.json({ ok: false, error: sent.error }, { status: 502 });
    }
    return NextResponse.json({ ok: true, sentTo: next, delivery: "email", mockOtp: null });
  }

  if (!isValidPhone(next)) {
    return NextResponse.json({ ok: false, error: "Enter a valid 10-digit Indian mobile number." }, { status: 400 });
  }
  const taken = db.users.find((u) => u.id !== user.id && u.phone === next);
  if (taken) {
    return NextResponse.json({ ok: false, error: "This mobile number is already used." }, { status: 409 });
  }
  const otp = await issueOtp(user.id, next, "change-phone");
  if (!emailDeliveryEnabled() || !user.email) {
    if (OTP_MOCK) return NextResponse.json({ ok: true, sentTo: user.email || next, delivery: "mock", mockOtp: otp });
    return NextResponse.json({ ok: false, error: "OTP is sent to your current email. Add an email first." }, { status: 503 });
  }
  const sent = await sendOtpEmail(user.email, user.name, otp);
  if (!sent.ok) {
    if (OTP_MOCK) return NextResponse.json({ ok: true, sentTo: user.email, delivery: "mock", mockOtp: otp });
    return NextResponse.json({ ok: false, error: sent.error }, { status: 502 });
  }
  return NextResponse.json({ ok: true, sentTo: user.email, delivery: "email", mockOtp: null });
}
