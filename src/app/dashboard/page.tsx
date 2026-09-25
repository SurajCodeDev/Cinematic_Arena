"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  getRegistrationsForUser,
  refreshRegistrations,
  getTournament,
  getPlayers,
  getTeams,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type Registration,
} from "@/lib/store";
import { useStoreRefresh } from "@/lib/useStoreRefresh";
import { apiGetWallet, apiTopUp, apiWithdraw, apiClaimPrize, apiGetPaymentConfig, apiGetPayments, apiGetWithdrawals, apiCreateRazorpayOrder, apiVerifyRazorpay, type ApiTransaction, type PaymentConfig, type PaymentProof, type Withdrawal } from "@/lib/api";
import { formatINR } from "@/lib/arena";
import { openRazorpayCheckout } from "@/lib/razorpayCheckout";
import { ProfileEditor } from "@/components/ProfileEditor";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const refresh = useStoreRefresh();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [notifications, setNotifications] = useState(() => getNotifications());
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [topupOpen, setTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [upiTxnRef, setUpiTxnRef] = useState("");
  const [payNote, setPayNote] = useState("");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [toast, setToast] = useState("");
  const [claiming, setClaiming] = useState<string | null>(null);
  const [payConfig, setPayConfig] = useState<PaymentConfig | null>(null);
  const [lastPayment, setLastPayment] = useState<PaymentProof | null>(null);
  const [payments, setPayments] = useState<PaymentProof[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  useEffect(() => {
    apiGetPaymentConfig()
      .then(setPayConfig)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      refreshRegistrations(user.id)
        .then(() => setRegistrations(getRegistrationsForUser(user.id)))
        .catch(() => setRegistrations(getRegistrationsForUser(user.id)));
    }
    setNotifications(getNotifications());
  }, [user, refresh]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = () => {
      apiGetPayments()
        .then((res) => {
          if (!cancelled && res.ok) setPayments(res.payments.filter((p) => p.userId === user.id));
        })
        .catch(() => {});
      apiGetWithdrawals()
        .then((res) => {
          if (!cancelled && res.ok) setWithdrawals(res.withdrawals.filter((w) => w.userId === user.id));
        })
        .catch(() => {});
      apiGetWallet()
        .then((res) => {
          if (!cancelled && res.ok) {
            setBalance(res.balance);
            setTransactions(res.transactions);
          }
        })
        .catch(() => {});
    };
    load();
    const timer = window.setInterval(load, 8000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [user, refresh]);

  if (loading) return null;

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="holo-panel clip-corner p-10 text-center">
          <p className="font-display text-xl font-black text-white">ACCESS DENIED</p>
          <p className="mt-2 font-body text-sm text-slate-400">Sign in to view your player dashboard.</p>
          <a href="/login" className="btn-primary mt-6 inline-block px-8 py-3 font-display text-sm">
            SIGN IN
          </a>
        </div>
      </main>
    );
  }

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleTopup = async () => {
    const n = parseInt(topupAmount, 10);
    if (!n || n <= 0) {
      showToast("ENTER A VALID AMOUNT");
      return;
    }
    if (payConfig?.razorpayEnabled) {
      try {
        const order = await apiCreateRazorpayOrder({ kind: "TOPUP", amount: n, note: payNote });
        if (!order.ok) {
          showToast(order.error || "RAZORPAY START FAILED");
          return;
        }
        const checkout = await openRazorpayCheckout(order);
        const verified = await apiVerifyRazorpay(checkout);
        if (verified.ok) {
          if (typeof verified.wallet === "number") setBalance(verified.wallet);
          setTopupOpen(false);
          setLastPayment(verified.payment || null);
          if (verified.payment) {
            setPayments((prev) => [verified.payment!, ...prev.filter((p) => p.id !== verified.payment!.id)]);
          }
          setTopupAmount("");
          setPayNote("");
          showToast("WALLET CREDITED VIA RAZORPAY");
        } else {
          showToast(verified.error || "VERIFY FAILED");
        }
      } catch (err) {
        showToast(err instanceof Error ? err.message.toUpperCase() : "PAYMENT CANCELLED");
      }
      return;
    }
    if (!upiTxnRef.trim()) {
      showToast("ENTER UPI TRANSACTION REF");
      return;
    }
    const res = await apiTopUp(n, upiTxnRef.trim(), payNote);
    if (res.ok) {
      setBalance(res.balance);
      setTopupOpen(false);
      setLastPayment(res.payment || null);
      if (res.payment) {
        setPayments((prev) => [res.payment!, ...prev.filter((p) => p.id !== res.payment!.id)]);
      }
      setTopupAmount("");
      setUpiTxnRef("");
      setPayNote("");
      showToast("PAYMENT SENT TO ADMIN FOR VERIFY");
    } else {
      showToast(res.error || "TOP-UP FAILED");
    }
  };

  const handleWithdraw = async () => {
    const n = parseInt(withdrawAmount, 10);
    if (!n || n <= 0) {
      showToast("ENTER A VALID AMOUNT");
      return;
    }
    const res = await apiWithdraw(n);
    if (res.ok) {
      setBalance(res.balance);
      setWithdrawOpen(false);
      setWithdrawAmount("");
      showToast("WITHDRAWAL REQUESTED");
    } else {
      showToast(res.error || "WITHDRAWAL FAILED");
    }
  };

  const handleClaim = async (tournamentId: string) => {
    setClaiming(tournamentId);
    const res = await apiClaimPrize(tournamentId);
    setClaiming(null);
    if (res.ok) {
      setBalance(res.balance);
      showToast(`PRIZE ${formatINR(res.amount)} CREDITED`);
      if (user) setRegistrations(getRegistrationsForUser(user.id));
    } else {
      showToast(res.error || "CLAIM FAILED");
    }
  };

  const userTournaments = registrations
    .map((r) => getTournament(r.tournamentId))
    .filter((t): t is NonNullable<typeof t> => !!t);

  const player = getPlayers().find((p) => p.name.toLowerCase() === user.name.toLowerCase());

  const whatsappLink = (p: PaymentProof) => {
    const num = payConfig?.whatsappNumber || "917015742792";
    const msg = [
      "NEXT LEVEL ARENA - PAYMENT PROOF",
      "--------------------------------",
      `Player: ${p.userName}`,
      `Amount: ${formatINR(p.amount)}`,
      `UPI ID (paid to): ${p.upiId}`,
      `UPI Txn Ref: ${p.upiTxnRef}`,
      p.note ? `Note: ${p.note}` : "",
      `Status: ${p.status}`,
      `Time: ${new Date(p.createdAt).toLocaleString("en-IN")}`,
      "--------------------------------",
      "Please verify my payment. Thank you!",
    ].filter(Boolean).join("\n");
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-24">
      <div className="grid-bg absolute inset-0 opacity-30" />
      <div className="relative z-10 mx-auto max-w-[1200px]">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-10 flex flex-col gap-6 border border-[#1a2134] bg-[#0a0d16]/70 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-cyan-400/50 bg-cyan-400/10 font-display text-2xl font-black text-cyan-400 shadow-glow">
                {user.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-body text-[10px] tracking-[0.25em] text-slate-500">WELCOME BACK, PLAYER</p>
                <h1 className="font-display text-2xl font-black tracking-wide text-white">{user.name}</h1>
                <p className="mt-1 font-body text-xs tracking-[0.15em] text-slate-400">
                  {user.username ? `@${user.username} · ` : ""}UID {user.uid} · {user.team}
                </p>
                <p className="mt-1 break-all font-body text-[10px] tracking-[0.12em] text-slate-500">
                  {user.email || "no email"} · {user.phone || "no mobile"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 border border-cyan-400/40 bg-cyan-400/5 px-4 py-2.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
              <span className="font-body text-[10px] font-semibold tracking-[0.2em] text-cyan-400">READY TO COMPETE</span>
            </div>
          </div>
        </motion.div>

        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "MATCHES", value: player?.matches ?? 0 },
            { label: "WINS", value: player?.wins ?? 0 },
            { label: "KILLS", value: player?.kills ?? 0 },
            { label: "KD", value: player?.kd ?? 0 },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="holo-panel clip-corner-sm flex flex-col items-center py-5 text-center"
            >
              <span className="font-display text-2xl font-black text-white sm:text-3xl">{s.value}</span>
              <span className="mt-1 font-body text-[10px] font-semibold tracking-[0.3em] text-cyan-400">{s.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="mb-10">
          <ProfileEditor />
        </div>

        <div className="mb-10 grid gap-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="holo-panel scanline clip-corner p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-sm font-bold tracking-[0.3em] text-white">WALLET</h2>
              <span className="font-body text-[9px] tracking-[0.2em] text-slate-500">LIVE BALANCE</span>
            </div>
            <div className="mb-5 flex items-end justify-between border border-[#1a2134] bg-[#0a0d16]/60 p-5">
              <div>
                <p className="font-display text-3xl font-black text-cyan-400 text-glow">{formatINR(balance)}</p>
                <p className="mt-1 font-body text-[9px] tracking-[0.25em] text-slate-500">WALLET BALANCE</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setTopupOpen(true)} className="btn-primary px-4 py-2 font-display text-[10px]">+ ADD FUNDS</button>
                <button onClick={() => setWithdrawOpen(true)} className="btn-ghost px-4 py-2 font-display text-[10px]">WITHDRAW</button>
              </div>
            </div>
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <p className="py-6 text-center font-body text-xs text-slate-600">NO TRANSACTIONS YET</p>
              ) : (
                transactions.slice(0, 6).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between border border-[#1a2134] bg-[#0a0d16]/40 px-4 py-2.5">
                    <span className="font-body text-xs text-slate-400">{tx.label}</span>
                    <span className={`font-display text-xs font-black ${tx.amount >= 0 ? "text-cyan-400" : "text-red-400"}`}>
                      {tx.amount >= 0 ? "+" : ""}{formatINR(tx.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="holo-panel scanline clip-corner p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-sm font-bold tracking-[0.3em] text-white">NOTIFICATIONS</h2>
              <button
                onClick={() => {
                  setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                  markAllNotificationsRead();
                }}
                className="font-body text-[9px] tracking-[0.2em] text-slate-500 transition-colors hover:text-cyan-400"
              >
                MARK ALL READ
              </button>
            </div>
            <div className="space-y-2">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
                    markNotificationRead(n.id);
                  }}
                  className={`flex w-full items-start gap-3 border px-4 py-3 text-left transition-colors ${
                    n.read ? "border-[#1a2134] bg-[#0a0d16]/40" : "border-cyan-400/30 bg-[#0a0d16]/70"
                  }`}
                >
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${n.read ? "bg-slate-600" : "bg-cyan-400"}`} />
                  <div>
                    <p className={`font-body text-xs ${n.read ? "text-slate-500" : "text-slate-200"}`}>{n.message}</p>
                    <p className="mt-1 font-body text-[9px] tracking-[0.2em] text-slate-600">{n.type} · {n.date}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mb-10 grid gap-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="holo-panel clip-corner p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-sm font-bold tracking-[0.3em] text-white">PAYMENTS</h2>
              <span className="font-body text-[9px] tracking-[0.2em] text-slate-500">GATEWAY STATUS</span>
            </div>
            {payments.length === 0 ? (
              <p className="py-6 text-center font-body text-xs text-slate-600">NO PAYMENTS YET</p>
            ) : (
              <div className="space-y-2">
                {payments.slice(0, 6).map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 border border-[#1a2134] bg-[#0a0d16]/40 px-4 py-2.5">
                    <div className="min-w-0">
                            <p className="font-body text-xs text-slate-300">{p.type === "ENTRY" ? (p.tournamentName || "Entry fee") : "Wallet Top-up"}</p>
                      <p className="font-body text-[9px] tracking-[0.15em] text-slate-600">{p.method === "RAZORPAY" ? "RAZORPAY" : "UPI"} · {p.razorpayPaymentId || p.upiTxnRef}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-display text-xs font-black text-cyan-400">{formatINR(p.amount)}</span>
                      <span className={`rounded-sm border px-2 py-0.5 font-body text-[8px] font-semibold tracking-[0.15em] ${
                        p.status === "VERIFIED" ? "border-emerald-500/40 text-emerald-400" : p.status === "REJECTED" ? "border-red-500/40 text-red-400" : "border-amber-400/40 text-amber-400"
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="holo-panel clip-corner p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-sm font-bold tracking-[0.3em] text-white">WITHDRAWALS</h2>
              <span className="font-body text-[9px] tracking-[0.2em] text-slate-500">TRACKING</span>
            </div>
            {withdrawals.length === 0 ? (
              <p className="py-6 text-center font-body text-xs text-slate-600">NO WITHDRAWALS YET</p>
            ) : (
              <div className="space-y-2">
                {withdrawals.slice(0, 6).map((w) => (
                  <div key={w.id} className="flex items-center justify-between gap-3 border border-[#1a2134] bg-[#0a0d16]/40 px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="font-body text-xs text-slate-300">Withdrawal Request</p>
                      <p className="font-body text-[9px] tracking-[0.15em] text-slate-600">
                        {new Date(w.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-display text-xs font-black text-cyan-400">{formatINR(w.amount)}</span>
                      <span className={`rounded-sm border px-2 py-0.5 font-body text-[8px] font-semibold tracking-[0.15em] ${
                        w.status === "APPROVED" ? "border-emerald-500/40 text-emerald-400" : w.status === "REJECTED" ? "border-red-500/40 text-red-400" : "border-amber-400/40 text-amber-400"
                      }`}>
                        {w.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="holo-panel scanline clip-corner p-6 lg:col-span-2">
            <h2 className="mb-6 font-display text-sm font-bold tracking-[0.3em] text-white">MY TOURNAMENTS</h2>
            {userTournaments.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <p className="font-body text-sm text-slate-500">No tournaments registered yet.</p>
                <a href="/#tournaments" className="btn-primary mt-5 inline-block px-8 py-3 font-display text-xs">
                  BROWSE TOURNAMENTS
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map((r) => {
                  const t = getTournament(r.tournamentId);
                  if (!t) return null;
                  return (
                    <div key={`${r.userId}-${r.tournamentId}`} className="border border-[#1a2134] bg-[#0a0d16]/60 px-4 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <a href={`/tournaments/${t.id}`} data-cursor="VIEW" className="flex items-center gap-3">
                          <img src={t.image} alt={t.short} className="h-12 w-16 object-cover opacity-80" />
                          <div>
                            <p className="font-display text-sm font-bold text-white">{t.short}</p>
                            <p className="font-body text-[10px] tracking-[0.15em] text-slate-500">{t.date} · {t.time} · {t.map}</p>
                          </div>
                        </a>
                        <span className={`rounded-sm border px-2 py-1 font-body text-[9px] tracking-[0.2em] ${
                          t.status === "COMPLETED" ? "border-slate-600/50 text-slate-400" : "border-cyan-400/40 text-cyan-400"
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      {r.members && r.members.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[#1a2134] pt-3">
                          {r.members.map((m, i) => (
                            <span key={i} title={`UID: ${m.uid}`} className="rounded-sm border border-[#12182a] bg-[#05060a] px-2 py-0.5 font-body text-[9px] tracking-[0.1em] text-slate-400">
                              {m.name} <span className="text-cyan-500">{m.uid}</span>
                            </span>
                          ))}
                        </div>
                      )}
                      {t.status === "COMPLETED" && (
                        <button
                          onClick={() => handleClaim(t.id)}
                          disabled={claiming === t.id || r.claimed || (!!t.winner && t.winner.toLowerCase() !== r.teamName.toLowerCase() && t.winner.toLowerCase() !== r.playerName.toLowerCase())}
                          className={`mt-3 w-full px-4 py-2.5 font-display text-[10px] ${
                            r.claimed
                              ? "border border-emerald-500/40 bg-emerald-500/5 font-body text-emerald-400"
                              : "btn-primary"
                          }`}
                        >
                          {claiming === t.id
                            ? "CREDITING..."
                            : r.claimed
                            ? "PRIZE CREDITED"
                            : t.winner && t.winner.toLowerCase() !== r.teamName.toLowerCase() && t.winner.toLowerCase() !== r.playerName.toLowerCase()
                            ? "RESULTS DECLARED"
                            : t.winner
                            ? `CLAIM WINNER PRIZE`
                            : "AWAITING RESULTS"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="holo-panel clip-corner p-6">
            <h2 className="mb-6 font-display text-sm font-bold tracking-[0.3em] text-white">QUICK STATS</h2>
            <div className="space-y-4">
              {getTeams().slice(0, 3).map((team) => (
                <div key={team.id} className="flex items-center justify-between border border-[#1a2134] bg-[#0a0d16]/60 px-4 py-3">
                  <div>
                    <p className="font-body text-xs font-semibold tracking-[0.1em] text-slate-200">{team.name}</p>
                    <p className="font-body text-[9px] tracking-[0.2em] text-slate-500">{team.points} PTS · {team.kills} KILLS</p>
                  </div>
                  <span className="font-display text-base font-black text-cyan-400">#{team.placement.toFixed(1)}</span>
                </div>
              ))}
            </div>
            <a href="/#leaderboard" data-cursor="VIEW" className="btn-ghost mt-6 flex w-full items-center justify-center gap-2 px-4 py-3 font-display text-[11px]">
              FULL LEADERBOARD <span>→</span>
            </a>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {topupOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[900] flex items-center justify-center bg-black/80 px-6"
            onClick={() => setTopupOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="holo-panel scanline clip-corner w-full max-w-sm p-6"
            >
              <p className="mb-1 font-display text-sm font-bold tracking-[0.3em] text-white">ADD FUNDS</p>
              <p className="mb-4 font-body text-[10px] tracking-[0.2em] text-slate-500">
                {payConfig?.razorpayEnabled
                  ? "PAY VIA RAZORPAY · SETTLES TO ORGANIZER BANK"
                  : "PAY VIA UPI AND WE CREDIT YOUR WALLET"}
              </p>

              {payConfig?.razorpayEnabled ? (
                <div className="mb-4 border border-cyan-400/40 bg-cyan-400/5 p-4">
                  <p className="font-body text-[9px] font-semibold tracking-[0.25em] text-cyan-400">RAZORPAY CHECKOUT</p>
                  <p className="mt-2 font-body text-[11px] leading-relaxed text-slate-400">
                    UPI, cards aur netbanking. Paisa organizer ke Razorpay-linked bank account mein settle hota hai. Instant wallet credit.
                  </p>
                </div>
              ) : (
              <div className="mb-4 border border-cyan-400/40 bg-cyan-400/5 p-4">
                <p className="font-body text-[9px] font-semibold tracking-[0.25em] text-slate-500">PAY TO THIS UPI ID</p>
                <p className="mt-1 break-all font-display text-sm font-black text-cyan-400">{payConfig?.upiId || "ksuraj138@ybl"}</p>
                <p className="mt-1 font-body text-[9px] tracking-[0.2em] text-slate-500">PAYEE: {payConfig?.payeeName || "NEXT LEVEL ARENA"}</p>
              </div>
              )}

              <input
                type="number"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="Enter amount (₹)"
                className="w-full border border-[#1a2134] bg-[#0a0d16] px-4 py-3 font-body text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {[100, 500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setTopupAmount(String(amt))}
                    className="border border-[#1a2134] px-3 py-1 font-body text-[10px] text-slate-400 transition-colors hover:border-cyan-400/50 hover:text-cyan-400"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {!payConfig?.razorpayEnabled && (
                <input
                  type="text"
                  value={upiTxnRef}
                  onChange={(e) => setUpiTxnRef(e.target.value)}
                  placeholder="UPI Transaction Ref (required)"
                  className="w-full border border-[#1a2134] bg-[#0a0d16] px-4 py-2.5 font-body text-xs text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60"
                />
                )}
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="Note (optional)"
                  className="w-full border border-[#1a2134] bg-[#0a0d16] px-4 py-2.5 font-body text-xs text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60"
                />
              </div>

              <button onClick={handleTopup} className="btn-primary mt-5 w-full px-4 py-3 font-display text-xs">
                {payConfig?.razorpayEnabled
                  ? `PAY ${topupAmount ? `₹${topupAmount}` : ""} VIA RAZORPAY`
                  : `I HAVE PAID ${topupAmount ? `₹${topupAmount}` : ""} VIA UPI`}
              </button>
            </motion.div>
          </motion.div>
        )}

        {withdrawOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[900] flex items-center justify-center bg-black/80 px-6"
            onClick={() => setWithdrawOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="holo-panel scanline clip-corner w-full max-w-sm p-6"
            >
              <p className="mb-1 font-display text-sm font-bold tracking-[0.3em] text-white">WITHDRAW</p>
              <p className="mb-4 font-body text-[10px] tracking-[0.2em] text-slate-500">
                AVAILABLE: <span className="text-cyan-400">{formatINR(balance)}</span>
              </p>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full border border-[#1a2134] bg-[#0a0d16] px-4 py-3 font-body text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60"
              />
              <button onClick={handleWithdraw} className="btn-primary mt-5 w-full px-4 py-3 font-display text-xs">
                REQUEST WITHDRAWAL
              </button>
            </motion.div>
          </motion.div>
        )}

        {lastPayment && payConfig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[910] flex items-center justify-center bg-black/80 px-6"
            onClick={() => setLastPayment(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="holo-panel scanline clip-corner w-full max-w-md p-6"
            >
              <div className={`mb-4 flex items-center gap-2 border px-4 py-3 ${
                lastPayment.status === "VERIFIED" ? "border-emerald-500/40 bg-emerald-500/5" : "border-amber-400/40 bg-amber-400/5"
              }`}>
                <span className={`h-2 w-2 rounded-full ${lastPayment.status === "VERIFIED" ? "bg-emerald-400" : "bg-amber-400"}`} />
                <p className={`font-body text-[10px] font-semibold tracking-[0.25em] ${
                  lastPayment.status === "VERIFIED" ? "text-emerald-400" : "text-amber-400"
                }`}>
                  {lastPayment.status === "VERIFIED" ? "PAYMENT RECEIVED · WALLET CREDITED" : "PAYMENT SUBMITTED · AWAITING VERIFICATION"}
                </p>
              </div>

              <p className="mb-4 font-display text-sm font-bold tracking-[0.3em] text-white">PAYMENT RECEIPT</p>
              <div className="space-y-2 border border-[#1a2134] bg-[#0a0d16]/60 p-4 font-body text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">AMOUNT</span>
                  <span className="font-bold text-cyan-400">{formatINR(lastPayment.amount)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="shrink-0 text-slate-500">METHOD</span>
                  <span className="text-right">{lastPayment.method === "RAZORPAY" ? "RAZORPAY" : "UPI"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="shrink-0 text-slate-500">TXN REF</span>
                  <span className="break-all text-right">{lastPayment.razorpayPaymentId || lastPayment.upiTxnRef}</span>
                </div>
                {lastPayment.note && (
                  <div className="flex justify-between gap-4">
                    <span className="shrink-0 text-slate-500">NOTE</span>
                    <span className="text-right text-slate-400">{lastPayment.note}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">STATUS</span>
                  <span className={`font-semibold ${lastPayment.status === "VERIFIED" ? "text-emerald-400" : "text-amber-400"}`}>{lastPayment.status}</span>
                </div>
              </div>

              {lastPayment.method === "RAZORPAY" ? (
                <p className="mt-4 border-l-2 border-cyan-400/60 bg-[#0a0d16]/40 px-4 py-3 font-body text-[11px] leading-relaxed text-slate-400">
                  Razorpay ne payment capture kar liya. Paisa organizer ke linked bank account mein settle hoga.
                </p>
              ) : (
                <>
                  <p className="mt-4 border-l-2 border-cyan-400/60 bg-[#0a0d16]/40 px-4 py-3 font-body text-[11px] leading-relaxed text-slate-400">
                    Aapka payment proof ready hai. Niche button dabao to payment proof WhatsApp par admin (7015742792) ko bheja jayega.
                  </p>
                  <a
                    href={whatsappLink(lastPayment)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary mt-5 flex w-full items-center justify-center gap-2 px-4 py-3 font-display text-xs"
                  >
                    SEND PAYMENT PROOF ON WHATSAPP
                  </a>
                </>
              )}
              <button onClick={() => setLastPayment(null)} className="btn-ghost mt-2 w-full px-4 py-2.5 font-display text-[10px]">
                CLOSE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-8 left-1/2 z-[999] -translate-x-1/2 border border-cyan-400/50 bg-[#05060a] px-6 py-3 font-body text-xs font-semibold tracking-[0.2em] text-cyan-400 shadow-glow"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
