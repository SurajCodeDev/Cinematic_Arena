import { NextResponse } from "next/server";
import { readDB } from "@/lib/server/db";
import { findByIdentifier, issueOtp, OTP_MOCK, isValidEmail, isValidPhone } from "@/lib/server/otp";
import { emailDeliveryEnabled, emailReachable, sendOtpEmail } from "@/lib/server/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { identifier, purpose, userId } = await req.json();
  const id = String(identifier || "").trim().toLowerCase();
  const mode = String(purpose || "login");

  if (!id || (!isValidEmail(id) && !isValidPhone(id))) {
    return NextResponse.json({ ok: false, error: "Enter a valid email or 10-digit mobile number." }, { status: 400 });
  }

  const { user } = await findByIdentifier(id);
  let resolved = user;
  if (!resolved && userId) {
    const db = await readDB();
    resolved = db.users.find((u) => u.id === userId);
  }
  if (!resolved) {
    return NextResponse.json({ ok: false, error: "No account found with this email/mobile. Please register first." }, { status: 404 });
  }

  const sendTo = mode === "reset" ? String(resolved.email || "").trim().toLowerCase() : id;
  if (mode === "reset" && !isValidEmail(sendTo)) {
    return NextResponse.json(
      { ok: false, error: "This account has no email. Contact support to reset password." },
      { status: 400 }
    );
  }

  const otp = await issueOtp(resolved.id, sendTo, mode);
  const isEmail = isValidEmail(sendTo);

  if (isEmail) {
    if (!emailDeliveryEnabled()) {
      if (OTP_MOCK) {
        return NextResponse.json({ ok: true, sentTo: sendTo, delivery: "mock", mockOtp: otp });
      }
      return NextResponse.json(
        { ok: false, error: "Gmail SMTP is not configured. Set SMTP_USER and SMTP_PASS on Vercel." },
        { status: 503 }
      );
    }
    if (!emailReachable(sendTo)) {
      return NextResponse.json({ ok: false, error: "OTP email is restricted for this address." }, { status: 403 });
    }
    const sent = await sendOtpEmail(sendTo, resolved.name, otp);
    if (!sent.ok) {
      if (OTP_MOCK) {
        return NextResponse.json({ ok: true, sentTo: sendTo, delivery: "mock", mockOtp: otp });
      }
      return NextResponse.json({ ok: false, error: sent.error }, { status: 502 });
    }
    return NextResponse.json({ ok: true, sentTo: sendTo, delivery: "email", mockOtp: null });
  }

  if (!OTP_MOCK) {
    return NextResponse.json(
      { ok: false, error: "OTP is sent to your email. Use the email you registered with." },
      { status: 503 }
    );
  }

  return NextResponse.json({
    ok: true,
    sentTo: sendTo,
    delivery: "mock",
    mockOtp: otp,
  });
}
