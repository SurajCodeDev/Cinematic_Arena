"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiSendContactOtp, apiUpdateProfile, apiVerifyContactOtp } from "@/lib/api";

const inputCls =
  "w-full border border-[#1a2134] bg-[#05060a] px-3 py-2.5 font-body text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60";
const labelCls = "mb-1.5 block font-body text-[9px] font-semibold tracking-[0.25em] text-slate-500";

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Choose an image file."));
      return;
    }
    if (file.size > 900000) {
      reject(new Error("Use a photo under 900KB."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

export function ProfileEditor() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [team, setTeam] = useState(user?.team || "");
  const [uid, setUid] = useState(user?.uid || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const [emailValue, setEmailValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [emailSent, setEmailSent] = useState("");
  const [phoneSent, setPhoneSent] = useState("");
  const [emailMock, setEmailMock] = useState("");
  const [phoneMock, setPhoneMock] = useState("");
  const [busy, setBusy] = useState("");

  if (!user) return null;

  const show = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const saveProfile = async () => {
    setError("");
    setSaving(true);
    const res = await apiUpdateProfile({ name, username, team, uid, avatar });
    setSaving(false);
    if (!res.ok || !res.user) {
      setError(res.error || "Could not save profile.");
      return;
    }
    setUser(res.user);
    show("PROFILE UPDATED");
  };

  const sendChange = async (type: "email" | "phone") => {
    setError("");
    const value = type === "email" ? emailValue.trim() : phoneValue.trim();
    setBusy(type);
    const res = await apiSendContactOtp(type, value);
    setBusy("");
    if (!res.ok) {
      setError(res.error || "Failed to send OTP.");
      return;
    }
    if (type === "email") {
      setEmailSent(res.sentTo || value);
      setEmailMock(res.mockOtp || "");
    } else {
      setPhoneSent(res.sentTo || value);
      setPhoneMock(res.mockOtp || "");
    }
    show("OTP SENT");
  };

  const verifyChange = async (type: "email" | "phone") => {
    setError("");
    const value = type === "email" ? emailValue.trim() : phoneValue.trim();
    const otp = type === "email" ? emailOtp : phoneOtp;
    setBusy(`${type}-verify`);
    const res = await apiVerifyContactOtp(type, value, otp);
    setBusy("");
    if (!res.ok || !res.user) {
      setError(res.error || "OTP verification failed.");
      return;
    }
    setUser(res.user);
    if (type === "email") {
      setEmailValue("");
      setEmailOtp("");
      setEmailSent("");
      setEmailMock("");
    } else {
      setPhoneValue("");
      setPhoneOtp("");
      setPhoneSent("");
      setPhoneMock("");
    }
    show(type === "email" ? "EMAIL UPDATED" : "MOBILE UPDATED");
  };

  return (
    <div className="holo-panel scanline clip-corner p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-sm font-bold tracking-[0.3em] text-white">EDIT PROFILE</h2>
        <span className="font-body text-[9px] tracking-[0.2em] text-slate-500">OTP FOR EMAIL / MOBILE</span>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <label className="relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-full border border-cyan-400/50 bg-cyan-400/10">
          {avatar ? (
            <img src={avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-display text-2xl font-black text-cyan-400">
              {name.charAt(0).toUpperCase() || "P"}
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                setAvatar(await readImage(file));
              } catch (err) {
                setError((err as Error).message);
              }
            }}
          />
        </label>
        <div>
          <p className="font-body text-xs text-slate-300">Tap photo to change</p>
          <p className="mt-1 font-body text-[10px] tracking-[0.15em] text-slate-500">JPG / PNG · UNDER 900KB</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>NAME</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>USERNAME</label>
          <input className={inputCls} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="adminsk" />
        </div>
        <div>
          <label className={labelCls}>TEAM</label>
          <input className={inputCls} value={team} onChange={(e) => setTeam(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>BGMI UID</label>
          <input className={inputCls} value={uid} onChange={(e) => setUid(e.target.value.replace(/\D/g, "").slice(0, 10))} />
        </div>
      </div>

      <button onClick={saveProfile} disabled={saving} className="btn-primary mt-5 px-6 py-2.5 font-display text-xs">
        {saving ? "SAVING..." : "SAVE PROFILE"}
      </button>

      <div className="mt-8 grid gap-5 border-t border-[#1a2134] pt-6 lg:grid-cols-2">
        <div>
          <p className={labelCls}>CURRENT EMAIL</p>
          <p className="mb-3 break-all font-body text-sm text-slate-200">
            {user.email || "—"} {user.emailVerified ? "· VERIFIED" : "· NOT VERIFIED"}
          </p>
          <label className={labelCls}>NEW EMAIL</label>
          <input className={inputCls} value={emailValue} onChange={(e) => setEmailValue(e.target.value)} placeholder="new@gmail.com" />
          <button onClick={() => sendChange("email")} disabled={busy === "email"} className="btn-ghost mt-3 w-full px-4 py-2 font-display text-[10px]">
            {busy === "email" ? "SENDING..." : "SEND OTP TO NEW EMAIL"}
          </button>
          {emailSent && (
            <div className="mt-3">
              <p className="mb-2 font-body text-[9px] tracking-[0.2em] text-cyan-400">OTP SENT TO {emailSent.toUpperCase()}</p>
              {emailMock && <p className="mb-2 font-display text-lg font-black tracking-[0.3em] text-emerald-400">{emailMock}</p>}
              <input className={inputCls} value={emailOtp} onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" />
              <button onClick={() => verifyChange("email")} disabled={busy === "email-verify"} className="btn-primary mt-3 w-full px-4 py-2 font-display text-[10px]">
                {busy === "email-verify" ? "VERIFYING..." : "VERIFY EMAIL"}
              </button>
            </div>
          )}
        </div>

        <div>
          <p className={labelCls}>CURRENT MOBILE</p>
          <p className="mb-3 font-body text-sm text-slate-200">
            {user.phone || "—"} {user.phoneVerified ? "· VERIFIED" : "· NOT VERIFIED"}
          </p>
          <label className={labelCls}>NEW MOBILE</label>
          <input className={inputCls} value={phoneValue} onChange={(e) => setPhoneValue(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="7XXXXXXXXX" />
          <button onClick={() => sendChange("phone")} disabled={busy === "phone"} className="btn-ghost mt-3 w-full px-4 py-2 font-display text-[10px]">
            {busy === "phone" ? "SENDING..." : "SEND OTP TO CURRENT EMAIL"}
          </button>
          {phoneSent && (
            <div className="mt-3">
              <p className="mb-2 font-body text-[9px] tracking-[0.2em] text-cyan-400">OTP SENT TO {phoneSent.toUpperCase()}</p>
              {phoneMock && <p className="mb-2 font-display text-lg font-black tracking-[0.3em] text-emerald-400">{phoneMock}</p>}
              <input className={inputCls} value={phoneOtp} onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" />
              <button onClick={() => verifyChange("phone")} disabled={busy === "phone-verify"} className="btn-primary mt-3 w-full px-4 py-2 font-display text-[10px]">
                {busy === "phone-verify" ? "VERIFYING..." : "VERIFY MOBILE"}
              </button>
            </div>
          )}
        </div>
      </div>

      {error && <p className="mt-4 border border-red-500/30 bg-red-500/5 px-4 py-2.5 font-body text-xs text-red-400">{error}</p>}
      {toast && <p className="mt-4 border border-emerald-500/30 bg-emerald-500/5 px-4 py-2.5 font-body text-xs text-emerald-400">{toast}</p>}
    </div>
  );
}
