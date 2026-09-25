import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";
import { verifyWebhookSignature } from "@/lib/server/razorpay";
import { fulfillVerifiedPayment } from "@/lib/server/fulfillPayment";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ ok: false, error: "Invalid webhook signature." }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string; status?: string } } };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const entity = event.payload?.payment?.entity;
  const orderId = entity?.order_id || "";
  const rzpPayId = entity?.id || "";
  if (!orderId || event.event !== "payment.captured") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const db = await readDB();
  const pay = db.payments.find((p) => p.razorpayOrderId === orderId);
  if (!pay) {
    return NextResponse.json({ ok: true, ignored: true });
  }
  pay.razorpayPaymentId = rzpPayId;
  pay.upiTxnRef = rzpPayId;
  if (pay.status !== "VERIFIED") {
    fulfillVerifiedPayment(db, pay, "razorpay-webhook");
    await writeDB(db);
  }
  return NextResponse.json({ ok: true });
}
