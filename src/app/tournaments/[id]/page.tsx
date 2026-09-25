"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { getTournament, getTournaments, getRegistrations, isRegistered, registerForTournament, unregisterFromTournament, refreshRegistrations } from "@/lib/store";
import { TournamentCard } from "@/components/TournamentCard";
import { useAuth } from "@/context/AuthContext";
import { useStoreRefresh } from "@/lib/useStoreRefresh";
import { apiGetWallet, apiTopUp, apiGetPaymentConfig, apiGetRoom, apiCreateRazorpayOrder, apiVerifyRazorpay, type ApiRoom, type PaymentConfig } from "@/lib/api";
import { entryFeeNumber, isFreeTournament, isInviteOnly, prizeNumber, squadSizeFor, totalEntryFee, formatINR } from "@/lib/arena";
import { openRazorpayCheckout } from "@/lib/razorpayCheckout";

const statusColor: Record<string, string> = {
  LIVE: "text-red-400 border-red-500/50",
  "REGISTRATION OPEN": "text-cyan-400 border-cyan-400/50",
  UPCOMING: "text-blue-400 border-blue-500/50",
  COMPLETED: "text-slate-500 border-slate-600/50",
};

export default function TournamentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useAuth();
  const refresh = useStoreRefresh();
  const [t, setT] = useState(() => getTournament(id));
  const [registered, setRegistered] = useState(false);
  const [regStatus, setRegStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [wallet, setWallet] = useState<number | null>(null);
  const [topupOpen, setTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [payMethod, setPayMethod] = useState<"razorpay" | "upi" | "wallet">("wallet");
  const [upiTxnRef, setUpiTxnRef] = useState("");
  const [upiNote, setUpiNote] = useState("");
  const [payConfig, setPayConfig] = useState<PaymentConfig | null>(null);
  const [room, setRoom] = useState<ApiRoom | null>(null);
  const [form, setForm] = useState({
    playerName: user?.name ?? "",
    playerUid: user?.uid ?? "",
    playerEmail: user?.email ?? "",
    teamName: user?.team ?? "",
  });

  const size = useMemo(() => (t ? squadSizeFor(t.mode) : 1), [t]);
  const [members, setMembers] = useState<{ name: string; uid: string }[]>([]);

  useEffect(() => {
    setT(getTournament(id));
  }, [id, refresh]);

  useEffect(() => {
    let active = true;
    if (user) {
      setForm({
        playerName: user.name ?? "",
        playerUid: user.uid ?? "",
        playerEmail: user.email ?? "",
        teamName: user.team ?? "",
      });
      refreshRegistrations(user.id)
        .then(() => { if (active) setRegistered(isRegistered(user.id, id)); })
        .catch(() => { if (active) setRegistered(isRegistered(user.id, id)); });
    } else {
      setRegistered(false);
    }
    return () => { active = false; };
  }, [user, id]);

  useEffect(() => {
    if (user) {
      const reg = getRegistrations().find((r) => r.userId === user.id && r.tournamentId === id);
      setRegStatus(reg?.status ?? null);
      if (reg) {
        apiGetRoom(id)
          .then((res) => {
            if (res.ok) setRoom(res.room);
          })
          .catch(() => {});
      }
    } else {
      setRegStatus(null);
      setRoom(null);
    }
  }, [user, id, refresh, registered]);

  useEffect(() => {
    apiGetPaymentConfig()
      .then((c) => {
        setPayConfig(c);
        if (c.razorpayEnabled) setPayMethod("razorpay");
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      apiGetWallet()
        .then((res) => {
          if (res.ok) setWallet(res.balance);
        })
        .catch(() => {});
    } else {
      setWallet(null);
    }
  }, [user]);

  useEffect(() => {
    setMembers((prev) => {
      const needed = size - 1;
      if (prev.length === needed) return prev;
      const next = [...prev];
      while (next.length < needed) next.push({ name: "", uid: "" });
      return next.slice(0, needed);
    });
  }, [size]);

  if (!t) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <p className="font-display text-2xl font-black text-white">TOURNAMENT NOT FOUND</p>
          <a href="/" className="btn-primary mt-6 inline-block px-8 py-3 font-display text-sm">
            BACK TO ARENA
          </a>
        </div>
      </main>
    );
  }

  const perPlayer = entryFeeNumber(t);
  const fee = totalEntryFee(t);
  const upiIntent = `upi://pay?pa=${payConfig?.upiId || "ksuraj138@ybl"}&pn=${encodeURIComponent(payConfig?.payeeName || "NEXT LEVEL ARENA")}&am=${fee}&cu=INR&tn=${encodeURIComponent(`Entry ${t.short}`)}`;

  const handleRegister = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (!/^\d{9,10}$/.test(form.playerUid)) {
      alert("Enter a valid BGMI UID (9-10 digits).");
      return;
    }
    if (!form.playerName.trim() || !form.playerEmail.trim() || !form.teamName.trim()) {
      alert("Fill in all player details before registering.");
      return;
    }
    const filledMembers = members.filter((m) => m.name.trim() && m.uid.trim());
    for (const m of filledMembers) {
      if (!/^\d{9,10}$/.test(m.uid)) {
        alert(`Invalid BGMI UID for teammate ${m.name}.`);
        return;
      }
    }
    if (members.length > 0 && filledMembers.length !== members.length) {
      alert("Fill in complete details for every teammate.");
      return;
    }
    if (!isFreeTournament(t) && payMethod === "upi") {
      if (!upiTxnRef.trim()) {
        alert("Enter your UPI transaction reference after paying.");
        return;
      }
    }
    if (!isFreeTournament(t) && payMethod === "razorpay") {
      setBusy(true);
      try {
        const order = await apiCreateRazorpayOrder({
          kind: "ENTRY",
          tournamentId: t.id,
          ...form,
          members: filledMembers,
        });
        if (!order.ok) {
          alert(order.error || "Could not start Razorpay checkout.");
          return;
        }
        const checkout = await openRazorpayCheckout(order);
        const verified = await apiVerifyRazorpay(checkout);
        if (!verified.ok) {
          alert(verified.error || "Payment verification failed.");
          return;
        }
        await refreshRegistrations(user.id);
        setRegistered(true);
        setRegStatus(verified.payment?.status === "VERIFIED" ? "PAID" : "PENDING");
        setT(getTournament(t.id));
        if (typeof verified.wallet === "number") setWallet(verified.wallet);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Payment cancelled.");
      } finally {
        setBusy(false);
      }
      return;
    }
    setBusy(true);
    const res = await registerForTournament(user.id, t.id, {
      ...form,
      members: filledMembers,
      paymentMethod: isFreeTournament(t) ? "wallet" : payMethod === "upi" ? "upi" : "wallet",
      upiTxnRef: payMethod === "upi" ? upiTxnRef : undefined,
      note: payMethod === "upi" ? upiNote : undefined,
    });
    setBusy(false);
    if (res.ok) {
      setRegistered(true);
      setRegStatus(res.pending ? "PENDING" : null);
      setT(getTournament(t.id));
      if (typeof res.wallet === "number") setWallet(res.wallet);
    } else {
      alert(res.error || "Registration failed.");
    }
  };

  const handleTopup = async () => {
    const n = parseInt(topupAmount, 10);
    if (!n || n <= 0) {
      alert("Enter a valid amount.");
      return;
    }
    if (payConfig?.razorpayEnabled) {
      try {
        const order = await apiCreateRazorpayOrder({ kind: "TOPUP", amount: n, note: upiNote });
        if (!order.ok) {
          alert(order.error || "Could not start Razorpay checkout.");
          return;
        }
        const checkout = await openRazorpayCheckout(order);
        const verified = await apiVerifyRazorpay(checkout);
        if (verified.ok) {
          setTopupOpen(false);
          setTopupAmount("");
          if (typeof verified.wallet === "number") setWallet(verified.wallet);
          alert(`Wallet credited ${formatINR(n)} via Razorpay.`);
        } else {
          alert(verified.error || "Payment verification failed.");
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : "Payment cancelled.");
      }
      return;
    }
    if (!upiTxnRef.trim()) {
      alert("Enter your UPI transaction reference after paying.");
      return;
    }
    const res = await apiTopUp(n, upiTxnRef.trim(), upiNote);
    if (res.ok) {
      setTopupOpen(false);
      setTopupAmount("");
      alert(`Top-up of ${formatINR(n)} submitted for verification. Admin will credit your wallet shortly.`);
    } else {
      alert(res.error || "Top-up failed.");
    }
  };

  const handleUnregister = async () => {
    if (!user) return;
    setBusy(true);
    await unregisterFromTournament(user.id, t.id);
    setBusy(false);
    setRegistered(false);
    setRegStatus(null);
    setRoom(null);
    setT(getTournament(t.id));
  };

  const related = getTournaments().filter((x) => x.id !== t.id).slice(0, 4);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="relative h-[48vh] min-h-[280px] w-full overflow-hidden sm:h-[60vh] sm:min-h-[380px]">
        <img src={t.image} alt={t.short} className="h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05060a]/60 via-[#05060a]/30 to-[#05060a]" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-[1200px] px-4 pb-8 sm:px-6 sm:pb-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className={`rounded-sm border px-2 py-0.5 font-body text-[9px] font-semibold tracking-[0.15em] ${statusColor[t.status]}`}>
                  {t.status}
                </span>
                <span className="font-body text-[10px] tracking-[0.2em] text-slate-400">{t.game} · {t.mode}</span>
              </div>
              <h1 className="font-display text-3xl font-black tracking-wide text-white text-glow sm:text-5xl">{t.short}</h1>
              <p className="mt-2 font-body text-sm tracking-[0.2em] text-slate-400">{t.name}</p>
              {t.winner && (
                <p className="mt-3 inline-block rounded-sm border border-cyan-400/50 bg-cyan-400/10 px-3 py-1 font-body text-[10px] font-semibold tracking-[0.2em] text-cyan-400">
                  CHAMPIONS: {t.winner}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="holo-panel clip-corner p-6 lg:col-span-2"
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#1a2134] pb-5">
              <div>
                <p className="font-display text-3xl font-black text-cyan-400 text-glow">{t.prizePool}</p>
                <p className="font-body text-[10px] tracking-[0.25em] text-slate-500">PRIZE POOL</p>
              </div>
              <div className="text-right">
                <p className="font-display text-lg font-bold text-white">{t.teamsJoined} / {t.teams}</p>
                <p className="font-body text-[10px] tracking-[0.25em] text-slate-500">TEAMS REGISTERED</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                { label: "ENTRY FEE", value: isFreeTournament(t) ? "FREE" : `${t.entryFee} / PLAYER` },
                { label: "DATE", value: t.date },
                { label: "TIME", value: t.time },
                { label: "FORMAT", value: t.format },
                { label: "MAP", value: t.map },
                { label: "MODE", value: t.mode },
              ].map((info) => (
                <div key={info.label} className="border border-[#1a2134] bg-[#0a0d16]/60 px-4 py-3">
                  <p className="font-body text-[9px] tracking-[0.25em] text-slate-500">{info.label}</p>
                  <p className={`mt-1 font-body text-sm font-semibold ${info.label === "ENTRY FEE" && info.value === "FREE" ? "text-emerald-400" : "text-slate-200"}`}>{info.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="mb-4 font-display text-sm font-bold tracking-[0.25em] text-cyan-400">PRIZE DISTRIBUTION</h3>
              <div className="overflow-hidden border border-[#1a2134]">
                <div className="flex items-center justify-between border-b border-[#1a2134] bg-[#0a0d16]/80 px-5 py-3">
                  <div>
                    <p className="font-display text-base font-black text-cyan-400">1ST PLACE</p>
                    <p className="font-body text-[9px] tracking-[0.2em] text-slate-500">CHAMPIONS</p>
                  </div>
                  <p className="font-display text-base font-black text-white">{formatINR(Math.floor(prizeNumber(t) * 0.5))}</p>
                </div>
                <div className="flex items-center justify-between border-b border-[#1a2134] bg-[#0a0d16]/50 px-5 py-3">
                  <div>
                    <p className="font-display text-sm font-bold text-slate-200">2ND PLACE</p>
                    <p className="font-body text-[9px] tracking-[0.2em] text-slate-500">RUNNER-UP</p>
                  </div>
                  <p className="font-display text-sm font-black text-slate-200">{formatINR(Math.floor(prizeNumber(t) * 0.3))}</p>
                </div>
                <div className="flex items-center justify-between bg-[#0a0d16]/40 px-5 py-3">
                  <div>
                    <p className="font-display text-sm font-bold text-slate-300">3RD PLACE</p>
                    <p className="font-body text-[9px] tracking-[0.2em] text-slate-500">SEMI-FINALIST</p>
                  </div>
                  <p className="font-display text-sm font-black text-slate-300">{formatINR(Math.floor(prizeNumber(t) * 0.2))}</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="mb-4 font-display text-sm font-bold tracking-[0.25em] text-cyan-400">TOURNAMENT RULES</h3>
              <ul className="space-y-2.5">
                {t.rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-3 font-body text-sm text-slate-400">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rotate-45 bg-cyan-400/70" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="holo-panel scanline clip-corner h-fit p-6 lg:sticky lg:top-24"
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="font-display text-xs font-bold tracking-[0.3em] text-white">REGISTRATION</span>
              {t.status === "LIVE" && (
                <span className="flex items-center gap-1.5 font-body text-[10px] text-red-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> LIVE
                </span>
              )}
            </div>

            <div className="mb-6 space-y-3 border-b border-[#1a2134] pb-6 font-body text-xs text-slate-400">
              <div className="flex justify-between">
                <span>SLOTS FILLED</span>
                <span className="text-slate-200">{t.teamsJoined}/{t.teams}</span>
              </div>
              <div className="flex justify-between">
                <span>ENTRY / PLAYER</span>
                {isFreeTournament(t) ? (
                  <span className="rounded-sm border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 font-body text-[9px] font-bold tracking-[0.15em] text-emerald-400">FREE</span>
                ) : (
                  <span className="text-slate-200">{t.entryFee}</span>
                )}
              </div>
              {!isFreeTournament(t) && (
                <div className="flex justify-between">
                  <span>TOTAL ({size} PLAYERS)</span>
                  <span className="text-cyan-400">{formatINR(fee)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>PRIZE POOL</span>
                <span className="text-cyan-400">{t.prizePool}</span>
              </div>
              {user && wallet !== null && (
                <div className="flex justify-between border-t border-[#1a2134] pt-3">
                  <span>WALLET</span>
                  <span className="text-cyan-300">{formatINR(wallet)}</span>
                </div>
              )}
            </div>

            {room && t.status === "LIVE" && (
              <div className="mb-5 border border-emerald-500/40 bg-emerald-500/5 p-4">
                <p className="mb-2 font-body text-[9px] font-semibold tracking-[0.25em] text-emerald-400">LIVE ROOM ACCESS</p>
                <div className="space-y-1 font-body text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ROOM ID</span>
                    <span className="font-display font-black tracking-[0.2em] text-white">{room.roomId || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">PASSWORD</span>
                    <span className="font-display font-black tracking-[0.2em] text-emerald-400">{room.password || "—"}</span>
                  </div>
                </div>
              </div>
            )}

            {registered ? (
              <div className="flex flex-col gap-3">
                {regStatus === "PENDING" ? (
                  <div className="flex items-center justify-center gap-2 border border-amber-400/40 bg-amber-400/10 px-4 py-3 font-body text-xs font-semibold tracking-[0.2em] text-amber-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" /> PAYMENT UNDER VERIFICATION
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 border border-cyan-400/40 bg-cyan-400/10 px-4 py-3 font-body text-xs font-semibold tracking-[0.2em] text-cyan-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> REGISTERED
                  </div>
                )}
                {t.status === "COMPLETED" && t.winner && (
                  <div className="flex items-center justify-center gap-2 border border-cyan-400/40 bg-cyan-400/10 px-4 py-3 font-body text-xs font-semibold tracking-[0.2em] text-cyan-400">
                    WINNER: {t.winner}
                  </div>
                )}
                {regStatus === "PENDING" && (
                  <p className="font-body text-[10px] leading-relaxed tracking-[0.1em] text-slate-500">
                    Aapka entry payment verification mein hai. Razorpay payment auto-verify hota hai. Manual UPI ke liye admin verify karega.
                  </p>
                )}
                <button onClick={handleUnregister} disabled={busy} className="btn-ghost w-full px-4 py-3 font-display text-[11px]">
                  {busy ? "PROCESSING..." : "CANCEL REGISTRATION"}
                </button>
              </div>
            ) : user ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 border border-[#1a2134] bg-[#05060a]/60 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-body text-[9px] font-semibold tracking-[0.25em] text-slate-500">STEP 1 · LEADER DETAILS</p>
                    <span className="font-body text-[9px] tracking-[0.15em] text-slate-600">CAPTAIN</span>
                  </div>
                  {(
                    [
                      { key: "playerName", label: "PLAYER NAME", placeholder: "Your in-game name" },
                      { key: "playerUid", label: "BGMI UID", placeholder: "5401234567" },
                      { key: "playerEmail", label: "EMAIL", placeholder: "you@arena.in" },
                      { key: "teamName", label: "TEAM NAME", placeholder: "Team Nova" },
                    ] as const
                  ).map((f) => (
                    <div key={f.key}>
                      <label className="mb-1 block font-body text-[8px] font-semibold tracking-[0.25em] text-slate-500">
                        {f.label}
                      </label>
                      <input
                        type={f.key === "playerEmail" ? "email" : "text"}
                        value={form[f.key]}
                        onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full border border-[#1a2134] bg-[#0a0d16] px-3 py-2 font-body text-xs text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60"
                      />
                    </div>
                  ))}
                </div>

                {size > 1 && (
                  <div className="flex flex-col gap-3 border border-[#1a2134] bg-[#05060a]/60 p-4">
                    <p className="font-body text-[9px] font-semibold tracking-[0.25em] text-slate-500">
                      STEP 2 · TEAM MEMBERS <span className="text-slate-600">({size - 1} TEAMMATES)</span>
                    </p>
                    {members.map((m, idx) => (
                      <div key={idx} className="flex flex-col gap-2 border border-[#12182a] bg-[#0a0d16]/50 p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-body text-[9px] font-bold tracking-[0.2em] text-cyan-400">MEMBER {idx + 1}</span>
                          <span className="font-body text-[9px] tracking-[0.15em] text-slate-600">TEAMMATE</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            value={m.name}
                            onChange={(e) =>
                              setMembers((prev) => prev.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)))
                            }
                            placeholder="Player name"
                            className="w-full border border-[#1a2134] bg-[#0a0d16] px-3 py-2 font-body text-xs text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60"
                          />
                          <input
                            value={m.uid}
                            onChange={(e) =>
                              setMembers((prev) => prev.map((x, i) => (i === idx ? { ...x, uid: e.target.value } : x)))
                            }
                            placeholder="BGMI UID"
                            className="w-full border border-[#1a2134] bg-[#0a0d16] px-3 py-2 font-body text-xs text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!isFreeTournament(t) && (
                  <div className="flex flex-col gap-3 border border-[#1a2134] bg-[#05060a]/60 p-4">
                    <p className="font-body text-[9px] font-semibold tracking-[0.25em] text-slate-500">STEP 3 · ENTRY FEE</p>
                    <div className={`mb-1 grid gap-2 ${payConfig?.razorpayEnabled ? "grid-cols-3" : "grid-cols-2"}`}>
                      {payConfig?.razorpayEnabled && (
                        <button
                          onClick={() => setPayMethod("razorpay")}
                          className={`border px-3 py-2 font-body text-[10px] font-semibold tracking-[0.15em] transition-colors ${
                            payMethod === "razorpay" ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-400" : "border-[#1a2134] text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          RAZORPAY
                        </button>
                      )}
                      <button
                        onClick={() => setPayMethod("upi")}
                        className={`border px-3 py-2 font-body text-[10px] font-semibold tracking-[0.15em] transition-colors ${
                          payMethod === "upi" ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-400" : "border-[#1a2134] text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        UPI / QR
                      </button>
                      <button
                        onClick={() => setPayMethod("wallet")}
                        className={`border px-3 py-2 font-body text-[10px] font-semibold tracking-[0.15em] transition-colors ${
                          payMethod === "wallet" ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-400" : "border-[#1a2134] text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        WALLET
                      </button>
                    </div>

                    {payMethod === "razorpay" ? (
                      <div className="flex flex-col gap-2 border border-[#1a2134] bg-[#0a0d16]/50 p-4">
                        <div className="flex items-center justify-between font-body text-xs text-slate-400">
                          <span>PER PLAYER</span>
                          <span className="font-bold text-slate-200">{formatINR(perPlayer)}</span>
                        </div>
                        <div className="flex items-center justify-between font-body text-xs text-slate-400">
                          <span>TOTAL ({size} PLAYERS)</span>
                          <span className="font-bold text-cyan-400">{formatINR(fee)}</span>
                        </div>
                        <p className="font-body text-[9px] leading-relaxed tracking-[0.1em] text-slate-500">
                          UPI, cards aur netbanking Razorpay se. Paisa organizer ke bank account mein settle hota hai. Instant verify.
                        </p>
                      </div>
                    ) : payMethod === "upi" ? (
                      <div className="flex flex-col items-center gap-3 border border-[#1a2134] bg-[#0a0d16]/50 p-4">
                        <QRCodeSVG value={upiIntent} size={150} bgColor="#05060a" fgColor="#22d3ee" level="M" />
                        <div className="text-center">
                          <p className="font-body text-[8px] font-semibold tracking-[0.25em] text-slate-500">PAY TO THIS UPI ID</p>
                          <p className="break-all font-display text-xs font-black text-cyan-400">{payConfig?.upiId || "ksuraj138@ybl"}</p>
                          <p className="mt-1 font-body text-[8px] tracking-[0.2em] text-slate-500">PAYEE: {payConfig?.payeeName || "NEXT LEVEL ARENA"} · AMOUNT: {formatINR(fee)} ({size} × {formatINR(perPlayer)})</p>
                        </div>
                        <a
                          href={upiIntent}
                          className="btn-primary w-full px-4 py-2.5 text-center font-display text-[10px]"
                        >
                          OPEN UPI APP TO PAY
                        </a>
                        <input
                          value={upiTxnRef}
                          onChange={(e) => setUpiTxnRef(e.target.value)}
                          placeholder="UPI Transaction Ref"
                          className="w-full border border-[#1a2134] bg-[#05060a] px-3 py-2 font-body text-xs text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60"
                        />
                        <input
                          value={upiNote}
                          onChange={(e) => setUpiNote(e.target.value)}
                          placeholder="Payment note (optional)"
                          className="w-full border border-[#1a2134] bg-[#05060a] px-3 py-2 font-body text-xs text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60"
                        />
                        <p className="font-body text-[9px] leading-relaxed tracking-[0.1em] text-slate-500">
                          UPI se payment karo, txn ref daalo aur SUBMIT karo. Admin verify karke aapko tournament mein add karega.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between font-body text-xs text-slate-400">
                          <span>PER PLAYER</span>
                          <span className="font-bold text-slate-200">{formatINR(perPlayer)}</span>
                        </div>
                        <div className="flex items-center justify-between font-body text-xs text-slate-400">
                          <span>TOTAL ({size} PLAYERS)</span>
                          <span className="font-bold text-cyan-400">{formatINR(fee)}</span>
                        </div>
                        <div className="flex items-center justify-between font-body text-xs text-slate-400">
                          <span>WALLET BALANCE</span>
                          <span className={`font-bold ${wallet !== null && wallet >= fee ? "text-emerald-400" : "text-red-400"}`}>
                            {wallet !== null ? formatINR(wallet) : "—"}
                          </span>
                        </div>
                        {wallet !== null && wallet < fee && (
                          <button onClick={() => setTopupOpen(true)} className="btn-primary w-full px-4 py-2.5 font-display text-[11px]">
                            + ADD FUNDS TO WALLET
                          </button>
                        )}
                      </div>
                    )}
                    {isInviteOnly(t) && (
                      <p className="font-body text-[10px] tracking-[0.15em] text-slate-500">INVITE-ONLY EVENT · SPONSORED SLOTS</p>
                    )}
                  </div>
                )}

                <button
                  onClick={handleRegister}
                  disabled={busy || t.status === "COMPLETED" || t.teamsJoined >= t.teams}
                  className="btn-primary w-full px-4 py-4 font-display text-sm"
                >
                  {busy
                    ? "PROCESSING..."
                    : t.teamsJoined >= t.teams
                    ? "TOURNAMENT FULL"
                    : t.status === "COMPLETED"
                    ? "TOURNAMENT OVER"
                    : isFreeTournament(t)
                    ? "CONFIRM FREE ENTRY"
                    : payMethod === "razorpay"
                    ? `PAY ${formatINR(fee)} VIA RAZORPAY`
                    : payMethod === "upi"
                    ? "I HAVE PAID VIA UPI — SUBMIT"
                    : wallet !== null && wallet < fee
                    ? "ADD FUNDS TO REGISTER"
                    : "PAY & REGISTER"}
                </button>
              </div>
            ) : (
              <button onClick={handleRegister} disabled={t.status === "COMPLETED" || t.teamsJoined >= t.teams} className="btn-primary w-full px-4 py-4 font-display text-sm">
                {t.teamsJoined >= t.teams
                  ? "TOURNAMENT FULL"
                  : t.status === "COMPLETED"
                  ? "TOURNAMENT OVER"
                  : "JOIN TOURNAMENT"}
              </button>
            )}

            {!user && (
              <p className="mt-4 text-center font-body text-[10px] tracking-[0.15em] text-slate-500">
                SIGN IN REQUIRED TO REGISTER
              </p>
            )}

            {topupOpen && (
              <div className="mt-4 border border-cyan-400/40 bg-[#05060a] p-4">
                <p className="mb-3 font-body text-[9px] font-semibold tracking-[0.25em] text-cyan-400">{payConfig?.razorpayEnabled ? "ADD FUNDS VIA RAZORPAY" : "ADD FUNDS VIA UPI"}</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    placeholder="Amount"
                    className="w-full border border-[#1a2134] bg-[#0a0d16] px-3 py-2 font-body text-xs text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60"
                  />
                  <button onClick={handleTopup} className="btn-primary shrink-0 px-4 py-2 font-display text-[10px]">
                    PAY
                  </button>
                </div>
                <div className="mt-3 flex gap-2">
                  {[100, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setTopupAmount(String(amt))}
                      className="border border-[#1a2134] px-3 py-1 font-body text-[10px] text-slate-400 transition-colors hover:border-cyan-400/50 hover:text-cyan-400"
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <div className="mt-14 sm:mt-20">
          <h2 className="mb-6 text-center font-display text-xl font-black tracking-wide text-white sm:mb-8 sm:text-3xl">
            MORE <span className="text-cyan-400">EVENTS</span>
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((rt) => (
              <TournamentCard key={rt.id} t={rt} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
