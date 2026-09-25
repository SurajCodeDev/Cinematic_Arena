"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, sendOtp, verifyOtp, user } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [mockOtp, setMockOtp] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    router.replace(user.role === "admin" ? "/admin" : "/dashboard");
    return null;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (mode === "password") {
      const res = await login(identifier, password);
      if (!res.ok) setError(res.error || "Login failed.");
    }
    setLoading(false);
  };

  const handleSendOtp = async () => {
    setError("");
    if (!identifier.trim()) {
      setError("Enter your email or mobile number.");
      return;
    }
    setLoading(true);
    const res = await sendOtp(identifier.trim(), "login");
    setLoading(false);
    if (!res.ok) {
      setError(res.error || "Failed to send OTP.");
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
    setLoading(true);
    const res = await verifyOtp(identifier.trim(), otp);
    setLoading(false);
    if (!res.ok) setError(res.error || "OTP verification failed.");
  };

  const inputCls =
    "w-full border border-[#1a2134] bg-[#05060a]/80 px-4 py-3.5 font-body text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-cyan-400/70 focus:shadow-[0_0_25px_-6px_rgba(34,211,238,0.6)]";

  const labelCls = "mb-2 block font-body text-[10px] font-semibold tracking-[0.25em] text-slate-400";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-24">
      {/* Cinematic esports background with slow ken-burns drift */}
      <motion.div
        aria-hidden
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 14, ease: "easeOut" }}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/bgmi-hero.jpg')" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_20%,rgba(8,12,24,0.35),rgba(5,6,10,0.92)_75%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#05060a]/80 via-[#05060a]/60 to-[#05060a]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#05060a] via-transparent to-[#05060a]/80" />
      <div className="grid-bg absolute inset-0 opacity-30" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Brand / value panel */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden flex-col lg:flex"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 rotate-45 items-center justify-center border-2 border-cyan-400 shadow-glow">
              <div className="h-2.5 w-2.5 -rotate-45 bg-cyan-400" />
            </div>
            <div>
              <p className="font-display text-sm font-black tracking-[0.35em] text-white">NEXT LEVEL</p>
              <p className="font-body text-[10px] tracking-[0.4em] text-cyan-400">ARENA</p>
            </div>
          </div>

          <span className="section-label mb-3">SECURE ARENA ACCESS</span>
          <h1 className="font-display text-4xl font-black leading-tight tracking-wide text-white xl:text-5xl">
            ENTER THE <span className="text-cyan-400 text-glow">BATTLEFIELD</span>
          </h1>
          <p className="mt-4 max-w-md font-body text-sm leading-relaxed text-slate-400">
            The operating system for competitive BGMI. Track live matches, dominate leaderboards and claim
            your share of the prize pool.
          </p>

          <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
            {[
              { label: "LIVE MATCHES", value: "00" },
              { label: "PRIZE POOL", value: "₹2,500" },
              { label: "VERIFIED PLAYERS", value: "512" },
              { label: "ACTIVE TEAMS", value: "128" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="holo-panel clip-corner-sm border border-[#1a2134] px-4 py-3 backdrop-blur-md"
              >
                <p className="font-display text-lg font-black text-white">{s.value}</p>
                <p className="mt-0.5 font-body text-[9px] font-semibold tracking-[0.25em] text-cyan-400">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3 border-l-2 border-cyan-400/60 pl-4">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <p className="font-body text-[10px] tracking-[0.25em] text-slate-400">
              LIVE NOW · BGMI CHAMPIONSHIP SERIES · ERANGEL
            </p>
          </div>
        </motion.div>

        {/* Auth card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="pointer-events-none absolute -left-px -top-px h-6 w-6 border-l-2 border-t-2 border-cyan-400" />
          <div className="pointer-events-none absolute -right-px -top-px h-6 w-6 border-r-2 border-t-2 border-cyan-400" />
          <div className="pointer-events-none absolute -bottom-px -left-px h-6 w-6 border-b-2 border-l-2 border-cyan-400" />
          <div className="pointer-events-none absolute -bottom-px -right-px h-6 w-6 border-b-2 border-r-2 border-cyan-400" />

          <div className="holo-panel scanline clip-corner border border-[#1a2134] bg-[#05060a]/85 p-8 backdrop-blur-xl">
            <div className="mb-8 flex flex-col items-center lg:hidden">
              <div className="mb-3 flex h-12 w-12 rotate-45 items-center justify-center border-2 border-cyan-400 shadow-glow">
                <div className="h-2.5 w-2.5 -rotate-45 bg-cyan-400" />
              </div>
              <h1 className="font-display text-xl font-black tracking-[0.25em] text-white">NEXT LEVEL ARENA</h1>
            </div>

            <div className="mb-1 text-center">
              <h2 className="font-display text-2xl font-black tracking-[0.2em] text-white">ARENA ACCESS</h2>
              <p className="mt-1.5 font-body text-[10px] tracking-[0.3em] text-slate-500">SIGN IN TO CONTINUE</p>
            </div>

            <div className="mb-6 mt-7 flex gap-1 border-b border-[#1a2134]">
              {(["password", "otp"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setError("");
                    setMockOtp(null);
                    setEmailSent(false);
                  }}
                  className={`relative flex-1 py-3 font-body text-[10px] font-semibold tracking-[0.2em] transition-colors ${
                    mode === m ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {m === "password" ? "PASSWORD" : "OTP LOGIN"}
                  {mode === m && (
                    <motion.span
                      layoutId="login-tab-underline"
                      className="absolute inset-x-0 -bottom-px h-0.5 bg-cyan-400 shadow-glow"
                    />
                  )}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-5">
              <div>
                <label className={labelCls}>USERNAME / EMAIL / MOBILE</label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="username, you@arena.in or 7XXXXXXXXX"
                  autoComplete="username"
                  className={inputCls}
                />
              </div>

              {mode === "password" ? (
                <div>
                  <label className={labelCls}>PASSWORD</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className={`${inputCls} pr-16`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 font-body text-[9px] font-semibold tracking-[0.2em] text-slate-500 transition-colors hover:text-cyan-400"
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button type="button" onClick={handleSendOtp} disabled={loading} className="btn-ghost w-full px-4 py-3 font-display text-xs">
                    {loading ? "SENDING OTP..." : "SEND OTP"}
                  </button>

                  {mockOtp && (
                    <div className="border border-emerald-500/40 bg-emerald-500/5 px-4 py-3 text-center">
                      <p className="font-body text-[9px] tracking-[0.25em] text-emerald-400">DEMO MODE — YOUR OTP</p>
                      <p className="mt-1 font-display text-2xl font-black tracking-[0.3em] text-emerald-400">{mockOtp}</p>
                      <p className="mt-1 font-body text-[9px] tracking-[0.15em] text-slate-500">
                        SENT TO {identifier.toUpperCase()}
                      </p>
                    </div>
                  )}

                  {emailSent && (
                    <div className="border border-cyan-500/40 bg-cyan-500/5 px-4 py-3 text-center">
                      <p className="font-body text-[9px] tracking-[0.25em] text-cyan-400">OTP SENT TO YOUR EMAIL</p>
                      <p className="mt-1 font-body text-[10px] tracking-[0.15em] text-slate-300">
                        CHECK INBOX FOR {identifier.toUpperCase()}
                      </p>
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

                  <button type="button" onClick={handleVerifyOtp} disabled={loading} className="btn-primary w-full px-6 py-3.5 font-display text-sm">
                    {loading ? "VERIFYING..." : "VERIFY & ENTER ARENA"}
                  </button>
                </>
              )}

              {mode === "password" && (
                <>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary group flex w-full items-center justify-center gap-2 px-6 py-3.5 font-display text-sm"
                  >
                    {loading ? "AUTHENTICATING..." : "ENTER ARENA"}
                    {!loading && <span className="transition-transform group-hover:translate-x-1">→</span>}
                  </button>
                  <a
                    href="/forgot-password"
                    className="text-center font-body text-[10px] tracking-[0.2em] text-slate-500 hover:text-cyan-400"
                  >
                    FORGOT PASSWORD?
                  </a>
                </>
              )}

              {error && (
                <p className="border border-red-500/30 bg-red-500/5 px-4 py-2.5 font-body text-xs text-red-400">
                  {error}
                </p>
              )}
            </form>

            <div className="mt-6 border-t border-[#1a2134] pt-5 text-center">
              <p className="font-body text-xs text-slate-500">
                NEW PLAYER?{" "}
                <a href="/register" className="font-semibold text-cyan-400 hover:text-cyan-300">
                  CREATE ACCOUNT
                </a>
              </p>
            </div>
          </div>

          <p className="mt-4 text-center font-body text-[9px] tracking-[0.25em] text-slate-600">
            SECURED SESSION · ENCRYPTED ACCESS · FAIR PLAY VERIFIED
          </p>
        </motion.div>
      </div>
    </main>
  );
}
