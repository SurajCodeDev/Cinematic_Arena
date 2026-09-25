"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register, verifyRegistration, sendOtp, user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [uid, setUid] = useState("");
  const [team, setTeam] = useState("");
  const [otp, setOtp] = useState("");
  const [mockOtp, setMockOtp] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | undefined>(undefined);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  if (user) {
    router.replace(user.role === "admin" ? "/admin" : "/dashboard");
    return null;
  }

  const validateDetails = () => {
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirm) return "Passwords do not match.";
    if (!/^\d{9,10}$/.test(uid)) return "Enter a valid BGMI UID (9-10 digits).";
    if (phone && !/^[6-9]\d{9}$/.test(phone)) return "Enter a valid 10-digit Indian mobile number.";
    return "";
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const detailErr = validateDetails();
    if (detailErr) {
      setError(detailErr);
      return;
    }
    setLoading(true);
    const res = await register({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      uid: uid.trim(),
      team: team.trim() || "Team Solo",
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.error || "Registration failed.");
      return;
    }
    setPendingUserId(res.pendingUserId);
    setMockOtp(res.mockOtp || null);
    setEmailSent(res.delivery === "email");
    if (res.error) setError(res.error);
    setStep(2);
  };

  const handleResendOtp = async () => {
    setError("");
    if (!email.trim()) {
      setError("Enter your email to resend OTP.");
      return;
    }
    setResending(true);
    const res = await sendOtp(email.trim(), "register", pendingUserId);
    setResending(false);
    if (!res.ok) {
      setError(res.error || "Failed to resend OTP.");
      return;
    }
    setMockOtp(res.mockOtp || null);
    setEmailSent(res.delivery === "email");
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    if (!pendingUserId) {
      setError("Missing pending registration.");
      return;
    }
    setLoading(true);
    const res = await verifyRegistration(pendingUserId, otp);
    setLoading(false);
    if (!res.ok) setError(res.error || "OTP verification failed.");
  };

  const inputCls =
    "w-full border border-[#1a2134] bg-[#0a0d16] px-4 py-3 font-body text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24">
      <div className="grid-bg absolute inset-0 opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_-10%,rgba(34,211,238,0.1),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="holo-panel scanline clip-corner p-8">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-3 flex h-12 w-12 rotate-45 items-center justify-center border-2 border-cyan-400 shadow-glow">
              <div className="h-2.5 w-2.5 -rotate-45 bg-cyan-400" />
            </div>
            <h1 className="font-display text-2xl font-black tracking-[0.2em] text-white">
              {step === 1 ? "JOIN THE ARENA" : "VERIFY YOUR IDENTITY"}
            </h1>
            <p className="mt-1 font-body text-xs tracking-[0.2em] text-slate-500">
              {step === 1 ? "CREATE YOUR PLAYER ACCOUNT" : "ENTER THE OTP SENT TO YOU"}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-body text-[10px] font-semibold tracking-[0.25em] text-slate-400">
                    PLAYER NAME
                  </label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your IGN" className={inputCls} />
                </div>
                <div>
                  <label className="mb-2 block font-body text-[10px] font-semibold tracking-[0.25em] text-slate-400">
                    BGMI UID
                  </label>
                  <input type="text" required value={uid} onChange={(e) => setUid(e.target.value)} placeholder="5400000000" className={inputCls} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-body text-[10px] font-semibold tracking-[0.25em] text-slate-400">
                    EMAIL
                  </label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@arena.in" className={inputCls} />
                </div>
                <div>
                  <label className="mb-2 block font-body text-[10px] font-semibold tracking-[0.25em] text-slate-400">
                    MOBILE <span className="normal-case tracking-normal text-slate-600">(10-digit)</span>
                  </label>
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="7XXXXXXXXX" className={inputCls} />
                </div>
              </div>

              <div>
                <label className="mb-2 block font-body text-[10px] font-semibold tracking-[0.25em] text-slate-400">
                  TEAM NAME
                </label>
                <input type="text" value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Team Nova (optional)" className={inputCls} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-body text-[10px] font-semibold tracking-[0.25em] text-slate-400">
                    PASSWORD
                  </label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className={inputCls} />
                </div>
                <div>
                  <label className="mb-2 block font-body text-[10px] font-semibold tracking-[0.25em] text-slate-400">
                    CONFIRM PASSWORD
                  </label>
                  <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" className={inputCls} />
                </div>
              </div>

              {error && (
                <p className="border border-red-500/30 bg-red-500/5 px-4 py-2.5 font-body text-xs text-red-400">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full px-6 py-3.5 font-display text-sm">
                {loading ? "CREATING PLAYER..." : "CREATE ACCOUNT"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="border border-cyan-500/30 bg-cyan-500/5 px-4 py-3 text-center">
                <p className="font-body text-[9px] tracking-[0.25em] text-cyan-400">
                  {emailSent ? "OTP SENT TO YOUR EMAIL" : "CHECK YOUR EMAIL FOR THE OTP"}
                </p>
                <p className="mt-1 font-body text-[10px] tracking-[0.15em] text-slate-300">
                  {email.trim().toUpperCase()}
                </p>
                <p className="mt-1 font-body text-[9px] tracking-[0.12em] text-slate-500">
                  ALSO CHECK SPAM / PROMOTIONS
                </p>
              </div>

              {mockOtp && (
                <div className="border border-emerald-500/40 bg-emerald-500/5 px-4 py-3 text-center">
                  <p className="font-body text-[9px] tracking-[0.25em] text-emerald-400">DEMO MODE — YOUR OTP</p>
                  <p className="mt-1 font-display text-2xl font-black tracking-[0.3em] text-emerald-400">{mockOtp}</p>
                </div>
              )}

              {emailSent && (
                <div className="border border-cyan-500/40 bg-cyan-500/5 px-4 py-3 text-center">
                  <p className="font-body text-[9px] tracking-[0.25em] text-cyan-400">OTP SENT TO YOUR EMAIL</p>
                  <p className="mt-1 font-body text-[10px] tracking-[0.15em] text-slate-300">
                    CHECK INBOX FOR {email.trim().toUpperCase()}
                  </p>
                </div>
              )}

              <div>
                <label className="mb-2 block font-body text-[10px] font-semibold tracking-[0.25em] text-slate-400">
                  ENTER OTP
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className={inputCls}
                />
              </div>

              {error && (
                <p className="border border-red-500/30 bg-red-500/5 px-4 py-2.5 font-body text-xs text-red-400">
                  {error}
                </p>
              )}

              <button type="button" onClick={handleVerifyOtp} disabled={loading} className="btn-primary w-full px-6 py-3.5 font-display text-sm">
                {loading ? "VERIFYING..." : "VERIFY & ENTER ARENA"}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending || loading}
                className="btn-ghost w-full px-4 py-3 font-display text-xs"
              >
                {resending ? "RESENDING OTP..." : "RESEND OTP TO EMAIL"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError("");
                  setOtp("");
                }}
                className="font-body text-xs text-slate-500 hover:text-slate-300"
              >
                ← EDIT DETAILS
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="mt-6 border-t border-[#1a2134] pt-5 text-center">
              <p className="font-body text-xs text-slate-500">
                ALREADY REGISTERED?{" "}
                <a href="/login" className="font-semibold text-cyan-400 hover:text-cyan-300">
                  SIGN IN
                </a>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
