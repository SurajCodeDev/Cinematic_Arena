import type { Tournament, Match } from "@/data/arena";
import type { User } from "@/lib/store";

export interface ApiUser {
  id: string;
  name: string;
  username?: string;
  email: string;
  phone: string;
  role: "admin" | "player";
  uid: string;
  team: string;
  wallet: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  avatar?: string;
  createdAt?: string;
  transactions?: ApiTransaction[];
}

export interface ApiRegistrationMember {
  name: string;
  uid: string;
}

export type ApiRegistrationStatus = "PAID" | "PENDING" | "WALLET" | "FREE";

export interface ApiRegistration {
  userId: string;
  tournamentId: string;
  tournamentName: string;
  playerName: string;
  playerUid: string;
  playerEmail: string;
  teamName: string;
  members: ApiRegistrationMember[];
  claimed: boolean;
  status: ApiRegistrationStatus;
  paymentId?: string;
  registeredAt: string;
}

export interface ApiTransaction {
  id: string;
  userId: string;
  label: string;
  amount: number;
  status: string;
  createdAt: string;
}

async function json<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return res.json() as Promise<T>;
}

// ---- Auth ----

export async function apiLogin(email: string, password: string) {
  return json<{ ok: boolean; error?: string; user?: ApiUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier: email, password }),
  });
}

export async function apiLoginWithIdentifier(identifier: string, password: string) {
  return json<{ ok: boolean; error?: string; user?: ApiUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
}

export async function apiRegister(data: { name: string; email: string; phone: string; password: string; uid: string; team: string }) {
  return json<{ ok: boolean; error?: string; pendingUserId?: string; mockOtp?: string | null; delivery?: "email" | "mock" | "failed"; sentTo?: string[] }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiSendOtp(identifier: string, purpose = "login", userId?: string) {
  return json<{ ok: boolean; error?: string; mockOtp?: string | null; delivery?: "email" | "mock"; sentTo?: string }>("/api/auth/otp/send", {
    method: "POST",
    body: JSON.stringify({ identifier, purpose, userId }),
  });
}

export async function apiVerifyOtp(data: { userId?: string; identifier?: string; otp: string; purpose?: string }) {
  return json<{ ok: boolean; error?: string; user?: ApiUser }>("/api/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiLogout() {
  return json<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
}

export async function apiResetPassword(identifier: string, otp: string, password: string) {
  return json<{ ok: boolean; error?: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ identifier, otp, password }),
  });
}

export async function apiMe() {
  return json<{ ok: boolean; user: ApiUser | null }>("/api/auth/me");
}

export async function apiUpdateProfile(data: { name?: string; username?: string; team?: string; uid?: string; avatar?: string }) {
  return json<{ ok: boolean; error?: string; user?: ApiUser }>("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function apiSendContactOtp(type: "email" | "phone", value: string) {
  return json<{ ok: boolean; error?: string; mockOtp?: string | null; delivery?: "email" | "mock"; sentTo?: string }>("/api/profile/contact/send", {
    method: "POST",
    body: JSON.stringify({ type, value }),
  });
}

export async function apiVerifyContactOtp(type: "email" | "phone", value: string, otp: string) {
  return json<{ ok: boolean; error?: string; user?: ApiUser }>("/api/profile/contact/verify", {
    method: "POST",
    body: JSON.stringify({ type, value, otp }),
  });
}

// ---- Tournaments ----

export async function apiGetTournaments(): Promise<Tournament[]> {
  const data = await json<{ ok: boolean; tournaments: Tournament[] }>("/api/tournaments");
  return data.tournaments;
}

export async function apiSaveTournament(t: Tournament) {
  return json<{ ok: boolean }>("/api/tournaments", { method: "PUT", body: JSON.stringify(t) });
}

export async function apiAddTournament(t: Partial<Tournament>) {
  return json<{ ok: boolean }>("/api/tournaments", { method: "POST", body: JSON.stringify(t) });
}

export async function apiDeleteTournament(id: string) {
  return json<{ ok: boolean }>("/api/tournaments", { method: "DELETE", body: JSON.stringify({ id }) });
}

export async function apiResetTournaments() {
  return json<{ ok: boolean; tournaments: Tournament[] }>("/api/tournaments/reset", { method: "POST" });
}

// ---- Registrations ----

export async function apiGetRegistrations(userId?: string): Promise<ApiRegistration[]> {
  const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  const data = await json<{ ok: boolean; registrations: ApiRegistration[] }>(`/api/registrations${qs}`);
  return data.registrations;
}

export async function apiRegisterForTournament(
  userId: string,
  tournamentId: string,
  details: {
    teamName: string;
    playerName: string;
    playerUid: string;
    playerEmail: string;
    members: ApiRegistrationMember[];
    paymentMethod?: "wallet" | "upi";
    upiTxnRef?: string;
    note?: string;
  }
) {
  return json<{ ok: boolean; error?: string; wallet?: number; pending?: boolean; payment?: PaymentProof }>(
    "/api/registrations",
    {
      method: "POST",
      body: JSON.stringify({ userId, tournamentId, ...details }),
    }
  );
}

export async function apiUnregisterFromTournament(userId: string, tournamentId: string) {
  return json<{ ok: boolean }>("/api/registrations", {
    method: "DELETE",
    body: JSON.stringify({ userId, tournamentId }),
  });
}

// ---- Wallet ----

export interface PaymentProof {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  upiId: string;
  upiTxnRef: string;
  note: string;
  status: string;
  createdAt: string;
  type?: "TOPUP" | "ENTRY";
  method?: "UPI" | "RAZORPAY" | "WALLET";
  tournamentId?: string;
  tournamentName?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  verifyRemarks?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  upiId: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  processedAt?: string;
  remarks?: string;
}

export interface ApiNotification {
  id: string;
  type: "MATCH" | "RESULT" | "PAYMENT" | "ANNOUNCEMENT" | "DISPUTE";
  message: string;
  date: string;
  read: boolean;
  userId?: string;
}

export interface ApiRoom {
  tournamentId: string;
  roomId: string;
  password: string;
  updatedAt: string;
}

export interface PaymentConfig {
  ok: boolean;
  upiId: string;
  whatsappNumber: string;
  payeeName: string;
  razorpayEnabled?: boolean;
}

export async function apiGetWallet() {
  return json<{ ok: boolean; balance: number; transactions: ApiTransaction[] }>("/api/wallet");
}

export async function apiTopUp(amount: number, upiTxnRef?: string, note?: string) {
  return json<{ ok: boolean; balance: number; payment?: PaymentProof; error?: string }>("/api/wallet/topup", {
    method: "POST",
    body: JSON.stringify({ amount, upiTxnRef, note }),
  });
}

export async function apiWithdraw(amount: number) {
  return json<{ ok: boolean; balance: number; error?: string }>("/api/withdrawals", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export async function apiGetWithdrawals(): Promise<{ ok: boolean; withdrawals: Withdrawal[] }> {
  return json<{ ok: boolean; withdrawals: Withdrawal[] }>("/api/withdrawals");
}

export async function apiProcessWithdrawal(id: string, action: "approve" | "reject", opts?: { upiId?: string; remarks?: string }) {
  return json<{ ok: boolean; error?: string }>("/api/withdrawals", {
    method: "PUT",
    body: JSON.stringify({ id, action, ...opts }),
  });
}

export async function apiGetPaymentConfig(): Promise<PaymentConfig> {
  return json<PaymentConfig>("/api/payment/config");
}

export async function apiGetPayments(): Promise<{ ok: boolean; payments: PaymentProof[] }> {
  return json<{ ok: boolean; payments: PaymentProof[] }>("/api/payments");
}

export async function apiProcessPayment(id: string, action: "verify" | "reject", remarks?: string) {
  return json<{ ok: boolean; error?: string }>(`/api/payments/${id}`, {
    method: "PUT",
    body: JSON.stringify({ action, remarks }),
  });
}

export interface RazorpayOrderResponse {
  ok: boolean;
  error?: string;
  keyId: string;
  orderId: string;
  amount: number;
  amountPaise: number;
  currency: string;
  paymentId: string;
  name: string;
  description: string;
  prefill: { name?: string; email?: string; contact?: string };
}

export async function apiCreateRazorpayOrder(body: {
  kind: "TOPUP" | "ENTRY";
  amount?: number;
  note?: string;
  tournamentId?: string;
  playerName?: string;
  playerUid?: string;
  playerEmail?: string;
  teamName?: string;
  members?: { name: string; uid: string }[];
}) {
  return json<RazorpayOrderResponse>("/api/razorpay/order", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiVerifyRazorpay(body: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  return json<{ ok: boolean; error?: string; payment?: PaymentProof; wallet?: number; verified?: boolean }>(
    "/api/razorpay/verify",
    { method: "POST", body: JSON.stringify(body) }
  );
}

// ---- Matches ----

export async function apiGetMatches(): Promise<Match[]> {
  const data = await json<{ ok: boolean; matches: Match[] }>("/api/matches");
  return data.matches;
}

export async function apiAddMatch(m: Partial<Match>) {
  return json<{ ok: boolean; error?: string }>("/api/matches", { method: "POST", body: JSON.stringify(m) });
}

export async function apiSaveMatch(m: Match) {
  return json<{ ok: boolean; error?: string }>("/api/matches", { method: "PUT", body: JSON.stringify(m) });
}

export async function apiDeleteMatch(id: string) {
  return json<{ ok: boolean }>("/api/matches", { method: "DELETE", body: JSON.stringify({ id }) });
}

// ---- Notifications ----

export async function apiGetNotifications(): Promise<{ ok: boolean; notifications: ApiNotification[] }> {
  return json<{ ok: boolean; notifications: ApiNotification[] }>("/api/notifications");
}

export async function apiMarkNotificationRead(id: string) {
  return json<{ ok: boolean }>("/api/notifications", { method: "PUT", body: JSON.stringify({ id }) });
}

export async function apiMarkAllNotificationsRead() {
  return json<{ ok: boolean }>("/api/notifications", { method: "POST" });
}

// ---- Rooms ----

export async function apiGetRoom(tournamentId: string): Promise<{ ok: boolean; room: ApiRoom | null }> {
  return json<{ ok: boolean; room: ApiRoom | null }>(`/api/rooms?tournamentId=${encodeURIComponent(tournamentId)}`);
}

export async function apiSetRoom(tournamentId: string, roomId: string, password: string) {
  return json<{ ok: boolean; error?: string }>("/api/rooms", {
    method: "PUT",
    body: JSON.stringify({ tournamentId, roomId, password }),
  });
}

// ---- Winner declare ----

export async function apiDeclareWinner(tournamentId: string, winner: string) {
  return json<{ ok: boolean; error?: string; creditedTo?: string | null; amount?: number }>("/api/prize/declare", {
    method: "POST",
    body: JSON.stringify({ tournamentId, winner }),
  });
}

// ---- Prize ----

export async function apiClaimPrize(tournamentId: string) {
  return json<{ ok: boolean; balance: number; amount: number; error?: string }>("/api/prize/claim", {
    method: "POST",
    body: JSON.stringify({ tournamentId }),
  });
}

// ---- Users ----

export async function apiGetUsers(): Promise<ApiUser[]> {
  const data = await json<{ ok: boolean; users?: ApiUser[]; error?: string }>("/api/users");
  if (!data.ok || !Array.isArray(data.users)) {
    throw new Error(data.error ?? "Failed to load users");
  }
  return data.users;
}

export type { User, Match };
