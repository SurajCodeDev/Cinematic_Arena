import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";
import { fulfillVerifiedPayment } from "@/lib/server/fulfillPayment";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { action, remarks } = await req.json();
  const db = await readDB();
  const admin = await getSessionUser(db);
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  const pay = db.payments.find((p) => p.id === id);
  if (!pay) {
    return NextResponse.json({ ok: false, error: "Payment not found." }, { status: 404 });
  }

  if (action === "verify") {
    if (pay.status === "VERIFIED") {
      return NextResponse.json({ ok: true, payment: pay });
    }
    pay.verifyRemarks = String(remarks || "").trim();
    const ok = fulfillVerifiedPayment(db, pay, admin.name);
    if (!ok && pay.status !== "VERIFIED") {
      return NextResponse.json({ ok: false, error: "Payer account not found." }, { status: 404 });
    }
  } else if (action === "reject") {
    pay.status = "REJECTED";
    pay.verifyRemarks = String(remarks || "Payment could not be verified.").trim();
    pay.verifiedAt = new Date().toISOString();
    pay.verifiedBy = admin.name;

    if (pay.type === "ENTRY" && pay.tournamentId) {
      db.registrations = db.registrations.filter(
        (r) => !(r.userId === pay.userId && r.tournamentId === pay.tournamentId && r.paymentId === pay.id)
      );
    }
    db.notifications.push({
      id: `nt-${Date.now()}`,
      type: "PAYMENT",
      message: `Your payment of ₹${pay.amount.toLocaleString("en-IN")} was rejected. ${pay.verifyRemarks}`,
      date: new Date().toISOString().slice(0, 10),
      read: false,
      userId: pay.userId,
    });
  } else {
    return NextResponse.json({ ok: false, error: "Invalid action." }, { status: 400 });
  }

  await writeDB(db);
  return NextResponse.json({ ok: true, payment: pay });
}
