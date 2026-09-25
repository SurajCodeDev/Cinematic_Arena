"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`NEXT LEVEL ARENA support — ${name.trim()}`);
    const body = encodeURIComponent(`Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`);
    window.location.href = `mailto:ksuraj138@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  const inputCls =
    "w-full border border-[#1a2134] bg-[#0a0d16] px-4 py-3 font-body text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60";

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-24">
      <div className="grid-bg absolute inset-0 opacity-25" />
      <div className="relative z-10 mx-auto max-w-[900px]">
        <div className="mb-14 text-center">
          <span className="section-label mb-3">COMMUNICATION CHANNEL</span>
          <h1 className="font-display text-3xl font-black tracking-wide text-white sm:text-5xl">
            CONTACT <span className="text-cyan-400">SUPPORT</span>
          </h1>
          <p className="mt-3 font-body text-sm text-slate-400">Questions, disputes or partnership inquiries — we respond within 24 hours.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="holo-panel scanline clip-corner p-6">
            <h2 className="mb-6 font-display text-sm font-bold tracking-[0.3em] text-white">SEND A MESSAGE</h2>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-2 block font-body text-[10px] font-semibold tracking-[0.25em] text-slate-400">NAME</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your IGN" className={inputCls} />
              </div>
              <div>
                <label className="mb-2 block font-body text-[10px] font-semibold tracking-[0.25em] text-slate-400">EMAIL</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@arena.in" className={inputCls} />
              </div>
              <div>
                <label className="mb-2 block font-body text-[10px] font-semibold tracking-[0.25em] text-slate-400">MESSAGE</label>
                <textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue or inquiry..." className={`${inputCls} resize-none`} />
              </div>
              <button type="submit" className="btn-primary px-6 py-3.5 font-display text-sm">TRANSMIT MESSAGE</button>
              {sent && <p className="border border-cyan-400/40 bg-cyan-400/5 px-4 py-2.5 font-body text-xs text-cyan-400">MESSAGE RECEIVED. WE WILL CONTACT YOU SOON.</p>}
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="flex flex-col gap-4">
            {[
              { label: "EMAIL", value: "ksuraj138@gmail.com", href: "mailto:ksuraj138@gmail.com" },
              { label: "TELEGRAM", value: "@BESTCHEAT_VIP", href: "https://t.me/BESTCHEAT_VIP" },
              { label: "WHATSAPP", value: "7015742792", href: "https://wa.me/917015742792" },
              { label: "DISCORD", value: "predator_dark_devil", href: "https://discord.com/users/predator_dark_devil" },
              { label: "YOUTUBE", value: "youtube.com/@nextlevelarena", href: "https://youtube.com/@nextlevelarena" },
              { label: "INSTAGRAM", value: "@nextlevelarena.esports", href: "https://instagram.com/nextlevelarena.esports" },
            ].map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={c.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                className="holo-panel clip-corner-sm flex items-center justify-between p-5 transition-colors hover:border-cyan-400/40"
              >
                <span className="font-body text-[10px] tracking-[0.3em] text-slate-500">{c.label}</span>
                <span className="font-body text-sm font-semibold text-cyan-400">{c.value}</span>
              </a>
            ))}
            <div className="holo-panel clip-corner-sm p-5">
              <p className="mb-2 font-body text-[10px] tracking-[0.3em] text-slate-500">DISPUTE REVIEW</p>
              <p className="font-body text-sm leading-relaxed text-slate-400">
                Incorrect score, cheating or result issues? Open a dispute ticket with screenshots and video evidence through the support channel.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
