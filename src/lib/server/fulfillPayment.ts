import type { DBShape, ServerPayment } from "@/lib/server/db";

export function fulfillVerifiedPayment(
  db: DBShape,
  pay: ServerPayment,
  verifiedBy: string
): boolean {
  if (pay.status === "VERIFIED") return false;

  const user = db.users.find((u) => u.id === pay.userId);
  if (!user) return false;

  pay.status = "VERIFIED";
  pay.verifiedAt = new Date().toISOString();
  pay.verifiedBy = verifiedBy;
  if (!pay.verifyRemarks) pay.verifyRemarks = "";

  const via = pay.method === "RAZORPAY" ? "Razorpay" : "UPI";

  if (pay.type === "ENTRY" && pay.tournamentId) {
    const reg = db.registrations.find(
      (r) => r.userId === pay.userId && r.tournamentId === pay.tournamentId && r.paymentId === pay.id
    );
    if (reg && reg.status === "PENDING") {
      reg.status = "PAID";
      const t = db.tournaments.find((x) => x.id === pay.tournamentId);
      if (t && t.teamsJoined < t.teams) t.teamsJoined += 1;
      db.notifications.push({
        id: `nt-${Date.now()}`,
        type: "PAYMENT",
        message: `Your entry payment for ${pay.tournamentName || "the tournament"} is verified. You are now registered!`,
        date: new Date().toISOString().slice(0, 10),
        read: false,
        userId: pay.userId,
      });
    }
    return true;
  }

  user.wallet += pay.amount;
  db.transactions.push({
    id: `tx-${Date.now()}`,
    userId: pay.userId,
    label: `Wallet Top-up (${via})`,
    amount: pay.amount,
    status: "CREDITED",
    createdAt: new Date().toISOString(),
  });
  db.notifications.push({
    id: `nt-${Date.now()}`,
    type: "PAYMENT",
    message: `Your ${via} payment of ₹${pay.amount.toLocaleString("en-IN")} was verified. Wallet credited!`,
    date: new Date().toISOString().slice(0, 10),
    read: false,
    userId: pay.userId,
  });
  return true;
}
