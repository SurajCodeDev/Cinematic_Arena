import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";
import { verifyCheckoutSignature } from "@/lib/server/razorpay";
import { fulfillVerifiedPayment } from "@/lib/server/fulfillPayment";

export async function POST(req: Request) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
  const db = await readDB();
  const user = await getSessionUser(db);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  const orderId = String(razorpay_order_id || "");
  const rzpPayId = String(razorpay_payment_id || "");
  const signature = String(razorpay_signature || "");
  if (!verifyCheckoutSignature(orderId, rzpPayId, signature)) {
    return NextResponse.json({ ok: false, error: "Invalid Razorpay signature." }, { status: 400 });
  }

  const pay = db.payments.find((p) => p.razorpayOrderId === orderId && p.userId === user.id);
  if (!pay) {
    return NextResponse.json({ ok: false, error: "Payment not found." }, { status: 404 });
  }

  pay.razorpayPaymentId = rzpPayId;
  pay.upiTxnRef = rzpPayId;
  if (pay.status !== "VERIFIED") {
    fulfillVerifiedPayment(db, pay, "razorpay");
  }
  await writeDB(db);

  const fresh = db.users.find((u) => u.id === user.id);
  return NextResponse.json({
    ok: true,
    payment: pay,
    wallet: fresh?.wallet ?? user.wallet,
    verified: pay.status === "VERIFIED",
  });
}
