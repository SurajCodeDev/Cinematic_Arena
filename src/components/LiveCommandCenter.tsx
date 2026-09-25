"use client";

import { motion } from "framer-motion";
import { liveMatch } from "@/data/arena";

export function LiveCommandCenter() {
  return (
    <section id="live" className="relative py-24">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative z-10 mx-auto max-w-[1200px] px-6">
        <div className="mb-14 flex flex-col items-center text-center">
          <span className="section-label mb-3">LIVE COMMAND CENTER</span>
          <h2 className="font-display text-3xl font-black tracking-wide text-white sm:text-5xl">
            LIVE <span className="text-red-400">BATTLE</span>
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="holo-panel scanline clip-corner p-6 lg:col-span-2"
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 items-center justify-center">
                  {liveMatch.status === "LIVE" ? (
                    <>
                      <span className="absolute h-2 w-2 animate-ping rounded-full bg-red-500" />
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                    </>
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  )}
                </span>
                <span className="font-display text-sm font-bold tracking-[0.3em] text-white">{liveMatch.id}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-body text-xs tracking-[0.2em] text-cyan-400">{liveMatch.map}</span>
                <span className={`font-display text-sm font-black ${liveMatch.status === "LIVE" ? "text-red-400" : "text-cyan-400"}`}>
                  {liveMatch.status === "LIVE" ? liveMatch.timer : "UPCOMING"}
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {liveMatch.teams.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center justify-between border border-[#1a2134] bg-[#0a0d16]/70 px-4 py-3.5 ${
                    i === 0 ? "border-cyan-400/40 shadow-glow" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-display text-lg font-black ${i === 0 ? "text-cyan-400" : "text-slate-600"}`}>
                      #{i + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-sm border border-[#1a2134] font-display text-[9px] font-black text-slate-400">
                        {t.tag}
                      </span>
                      <span className="font-body text-sm font-semibold tracking-[0.15em] text-slate-200">{t.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-body text-[10px] tracking-[0.15em] text-slate-500">{t.kills} KILLS</span>
                    <span className="font-display text-xl font-black text-white">{t.points}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="holo-panel scanline clip-corner p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="font-display text-xs font-bold tracking-[0.3em] text-white">MATCH INTEL</span>
              <span className="font-body text-[9px] tracking-[0.2em] text-slate-500">PRE-MATCH</span>
            </div>
            <div className="space-y-3">
              {liveMatch.status === "LIVE" ? (
                liveMatch.killFeed.map((k, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center justify-between font-body text-xs"
                  >
                    <span className="font-semibold text-cyan-400">{k.killer}</span>
                    <span className="text-slate-600">✕ {k.weapon}</span>
                    <span className="font-semibold text-red-400">{k.victim}</span>
                  </motion.div>
                ))
              ) : (
                <>
                  <p className="font-body text-xs leading-relaxed text-slate-400">No live kill feed yet. Room ID and password drop 30 minutes before match start.</p>
                  <p className="font-body text-xs leading-relaxed text-slate-500">Registered squads get notified in dashboard as soon as the custom room goes live.</p>
                </>
              )}
            </div>

            <div className="mt-8 border-t border-[#1a2134] pt-5">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-body text-[10px] tracking-[0.2em] text-slate-500">NEXT MATCH</span>
                <span className="font-body text-[10px] tracking-[0.2em] text-cyan-400">ROOM RELEASE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-black text-white">{liveMatch.startTime}</span>
                <span className="font-body text-xs text-slate-400">12 OCT · ERANGEL</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
