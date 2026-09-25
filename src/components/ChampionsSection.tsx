"use client";

import { motion } from "framer-motion";
import { scoringRules } from "@/data/arena";

export function ChampionsSection() {
  return (
    <section id="champions" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_60%,rgba(34,211,238,0.08),transparent_70%)]" />
      <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/20 sm:h-[520px] sm:w-[520px]" />
      <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/30 sm:h-[380px] sm:w-[380px]" />

      <div className="relative z-10 mx-auto max-w-[1100px] px-6 text-center">
        <span className="section-label mb-4">SCENE 07 — CHAMPIONS</span>

        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotateY: 30 }}
          whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative mx-auto mb-10 flex h-40 w-40 items-center justify-center sm:h-52 sm:w-52"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-28 w-14 rounded-t-full bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 shadow-glow sm:h-36 sm:w-16" />
          </div>
          <div className="absolute bottom-0 h-6 w-28 rounded-sm bg-gradient-to-r from-cyan-400 to-blue-500 sm:w-32" />
          <motion.div
            animate={{ rotateY: [0, 360] }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-cyan-400/20"
            style={{ transformStyle: "preserve-3d" }}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="font-display text-3xl font-black leading-snug tracking-[0.1em] text-white sm:text-5xl"
        >
          ONLY ONE TEAM
          <br />
          WILL CLAIM THE <span className="text-cyan-400 text-glow">CROWN</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-10"
        >
          <p className="font-display text-5xl font-black text-amber-400 text-glow sm:text-6xl">₹2,500</p>
          <p className="mt-2 font-body text-xs tracking-[0.35em] text-slate-500">PRIZE POOL</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-14 grid grid-cols-4 gap-2 sm:gap-4"
        >
          {scoringRules.map((r) => (
            <div key={r.placement} className="holo-panel clip-corner-sm px-2 py-3">
              <p className="font-display text-sm font-black text-white sm:text-base">
                {r.placement}
                <sup>{["st", "nd", "rd"][r.placement - 1] || "th"}</sup>
              </p>
              <p className="font-body text-[10px] text-cyan-400">+{r.points} PTS</p>
            </div>
          ))}
        </motion.div>

        <motion.a
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 0.6 }}
          href="/tournaments"
          data-cursor="ENTER"
          className="btn-primary mt-14 inline-block px-14 py-5 font-display text-sm"
        >
          JOIN THE BATTLE
        </motion.a>
      </div>
    </section>
  );
}
