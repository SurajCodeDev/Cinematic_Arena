"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { apiSendOtp, apiResetPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mockOtp, setMockOtp] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    router.replace(user.role === "admin" ? "/admin" : "/dashboard");
    return null;
  }

  const inputCls =
    "w-full border border-[#1a2134] bg-[#0a0d16] px-4 py-3 font-body text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60";
  const labelCls = "mb-2 block font-body text-[10px] font-semibold tracking-[0.25em] text-slate-400";

  const handleSendOtp = async (e?: FormEvent) => {
    e?.preventDefault();
    setError("");
    if (!identifier.trim()) {
      setError("Enter your registered email or mobile number.");
      return;
    }
    setLoading(true);
    const res = await apiSendOtp(identifier.trim(), "reset");
    setLoading(false);
    if (!res.ok) {
      setError(res.error || "Failed to send OTP.");
      return;
    }
    setSentTo(res.sentTo || identifier.trim());
    setMockOtp(res.mockOtp || null);
    setEmailSent(res.delivery === "email");
    setStep(2);
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const res = await apiResetPassword(identifier.trim(), otp, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error || "Password reset failed.");
      return;
    }
    setDone(true);
  };

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
              {done ? "PASSWORD UPDATED" : step === 1 ? "FORGOT PASSWORD" : "VERIFY OTP"}
            </h1>
            <p className="mt-1 font-body text-xs tracking-[0.2em] text-slate-500">
              {done
                ? "SIGN IN WITH YOUR NEW PASSWORD"
                : step === 1
                  ? "WE WILL SEND AN OTP TO YOUR EMAIL"
                  : "ENTER OTP AND SET A NEW PASSWORD"}
            </p>
          </div>

          {done ? (
            <div className="flex flex-col gap-5">
              <div className="border border-emerald-500/40 bg-emerald-500/5 px-4 py-3 text-center">
                <p className="font-body text-[10px] tracking-[0.2em] text-emerald-400">
                  YOUR ARENA PASSWORD HAS BEEN RESET
                </p>
              </div>
              <a href="/login" className="btn-primary w-full px-6 py-3.5 text-center font-display text-sm">
                BACK TO SIGN IN
              </a>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
              <div>
                <label className={labelCls}>EMAIL / MOBILE</label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@gmail.com or 7XXXXXXXXX"
                  autoComplete="username"
                  className={inputCls}
                />
              </div>

              {error && (
                <p className="border border-red-500/30 bg-red-500/5 px-4 py-2.5 font-body text-xs text-red-400">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full px-6 py-3.5 font-display text-sm">
                {loading ? "SENDING OTP..." : "SEND OTP TO EMAIL"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="flex flex-col gap-5">
              <div className="border border-cyan-500/30 bg-cyan-500/5 px-4 py-3 text-center">
                <p className="font-body text-[9px] tracking-[0.25em] text-cyan-400">
                  {emailSent ? "OTP SENT TO YOUR EMAIL" : "CHECK YOUR EMAIL FOR THE OTP"}
                </p>
                <p className="mt-1 font-body text-[10px] tracking-[0.15em] text-slate-300">
                  {(sentTo || identifier).toUpperCase()}
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

              <div>
                <label className={labelCls}>ENTER OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className={`${inputCls} text-center tracking-[0.5em]`}
                />
              </div>

              <div>
                <label className={labelCls}>NEW PASSWORD</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    autoComplete="new-password"
                    className={`${inputCls} pr-16`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 font-body text-[9px] font-semibold tracking-[0.2em] text-slate-500 hover:text-cyan-400"
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              <div>
                <label className={labelCls}>CONFIRM PASSWORD</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                  className={inputCls}
                />
              </div>

              {error && (
                <p className="border border-red-500/30 bg-red-500/5 px-4 py-2.5 font-body text-xs text-red-400">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full px-6 py-3.5 font-display text-sm">
                {loading ? "RESETTING..." : "RESET PASSWORD"}
              </button>

              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={loading}
                className="btn-ghost w-full px-4 py-3 font-display text-xs"
              >
                {loading ? "RESENDING OTP..." : "RESEND OTP TO EMAIL"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError("");
                  setOtp("");
                  setPassword("");
                  setConfirm("");
                }}
                className="font-body text-xs text-slate-500 hover:text-slate-300"
              >
                ← CHANGE EMAIL
              </button>
            </form>
          )}

          {!done && (
            <div className="mt-6 border-t border-[#1a2134] pt-5 text-center">
              <p className="font-body text-xs text-slate-500">
                REMEMBERED IT?{" "}
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
