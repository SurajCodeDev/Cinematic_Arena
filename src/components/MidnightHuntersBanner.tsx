"use client";

import { motion } from "framer-motion";

const features = [
  { label: "MODE", value: "SUPERNATURAL ERANGEL" },
  { label: "RELEASE", value: "16 SEP 2026" },
  { label: "THEME", value: "VAMPIRES · HUNTERS" },
];

export function MidnightHuntersBanner() {
  return (
    <section id="midnight-hunters" className="relative overflow-x-hidden py-16 sm:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0510] to-transparent" />
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="mb-8 flex flex-col items-center text-center sm:mb-14">
          <span className="section-label mb-3">FEATURED EVENT</span>
          <h2 className="font-display text-2xl font-black tracking-wide text-white sm:text-5xl">
            MIDNIGHT <span className="text-red-500">HUNTERS</span>
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="holo-panel scanline clip-corner relative overflow-hidden lg:col-span-2"
          >
            <div className="relative aspect-video w-full overflow-hidden">
              <img
                src="/images/bgmi-midnight-hunters-wide.jpg"
                alt="BGMI 4.6 Midnight Hunters key art"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d16] via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2 sm:bottom-4 sm:left-4 sm:right-4 sm:gap-3">
                <span className="rounded-sm border border-red-500/60 bg-[#05060a]/80 px-2.5 py-1 font-body text-[9px] font-bold tracking-[0.18em] text-red-400 sm:px-3 sm:py-1.5 sm:text-[10px] sm:tracking-[0.25em]">
                  BGMI 4.6 · OUT NOW
                </span>
                <span className="font-body text-[9px] tracking-[0.18em] text-slate-300 sm:text-[10px] sm:tracking-[0.25em]">HUNT FOR THE #1</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="holo-panel clip-corner overflow-hidden"
          >
            <div className="relative h-40 w-full overflow-hidden">
              <img
                src="/images/bgmi-midnight-hunters.jpg"
                alt="Midnight Hunters theme mode"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d16] to-transparent" />
            </div>
            <div className="p-5">
              <p className="mb-3 font-display text-sm font-black tracking-[0.15em] text-white">
                SUPERNATURAL ERANGEL
              </p>
              <p className="mb-5 font-body text-sm text-slate-400">
                Vampires take over Erangel in BGMI 4.6. Switch sides, hunt the night and claim the arena.
              </p>
              <div className="mb-5 space-y-2">
                {features.map((f) => (
                  <div key={f.label} className="flex items-center justify-between gap-3 border-b border-[#1a2134] pb-2">
                    <span className="shrink-0 font-body text-[10px] tracking-[0.2em] text-slate-500">{f.label}</span>
                    <span className="min-w-0 truncate text-right font-body text-[11px] font-semibold tracking-[0.08em] text-cyan-400">{f.value}</span>
                  </div>
                ))}
              </div>
              <a href="/tournaments" data-cursor="ENTER" className="btn-primary block px-6 py-3 text-center font-display text-xs">
                BROWSE TOURNAMENTS
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
