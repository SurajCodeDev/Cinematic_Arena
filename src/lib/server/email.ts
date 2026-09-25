export type EmailSendResult = { ok: true } | { ok: false; error: string };

function smtpEnabled(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

export function emailDeliveryEnabled(): boolean {
  return smtpEnabled();
}

export function emailReachable(email: string): boolean {
  const address = String(email || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address);
}

function fromAddress(): string {
  const smtpUser = (process.env.SMTP_USER || "").trim();
  if (process.env.OTP_EMAIL_FROM) return process.env.OTP_EMAIL_FROM;
  if (smtpUser) return `NEXT LEVEL ARENA <${smtpUser}>`;
  return "NEXT LEVEL ARENA <ksuraj138@gmail.com>";
}

function otpHtml(name: string, otp: string): string {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;background:#05060c;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:520px;margin:0 auto;padding:32px 20px">
      <div style="text-align:center;margin-bottom:24px">
        <div style="display:inline-block;transform:rotate(45deg);border:2px solid #22d3ee;padding:8px;margin-bottom:12px">
          <div style="width:10px;height:10px;background:#22d3ee"></div>
        </div>
        <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:4px;font-weight:900">NEXT LEVEL ARENA</h1>
      </div>
      <div style="background:#0a0d16;border:1px solid #1a2134;padding:32px 24px;text-align:center">
        <p style="margin:0 0 6px;color:#94a3b8;font-size:13px">HEY ${(name || "PLAYER").toUpperCase()},</p>
        <p style="margin:0 0 18px;color:#e2e8f0;font-size:14px">Your one-time code to enter the arena:</p>
        <p style="margin:0 0 18px;font-size:36px;letter-spacing:12px;font-weight:900;color:#22d3ee">${otp}</p>
        <p style="margin:0 0 4px;color:#64748b;font-size:12px">This code expires in 10 minutes.</p>
        <p style="margin:0;color:#64748b;font-size:12px">Never share this code with anyone.</p>
      </div>
      <p style="text-align:center;color:#334155;font-size:11px;margin-top:20px">
        NEXT LEVEL ARENA — DROP. FIGHT. CLAIM.
      </p>
    </div>
  </body>
</html>`;
}

export async function sendOtpEmail(to: string, name: string, otp: string): Promise<EmailSendResult> {
  if (!smtpEnabled()) {
    return {
      ok: false,
      error: "Gmail SMTP is not configured. Set SMTP_USER=vaibhavseth020@gmail.com and SMTP_PASS on Vercel.",
    };
  }
  const user = (process.env.SMTP_USER || "").trim();
  const pass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: fromAddress(),
      to,
      replyTo: user,
      subject: "NEXT LEVEL ARENA — Your OTP",
      html: otpHtml(name, otp),
      text: `Your NEXT LEVEL ARENA OTP is ${otp}. It expires in 10 minutes.`,
    });
    return { ok: true };
  } catch (err) {
    console.error("OTP email send failed:", err);
    return {
      ok: false,
      error: "Gmail SMTP failed. Login as vaibhavseth020@gmail.com, create an App Password, then Redeploy.",
    };
  }
}
