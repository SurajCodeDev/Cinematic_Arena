"use client";

import { motion } from "framer-motion";
import { heroStats } from "@/data/arena";
import { ArenaCanvas } from "./ArenaCanvas";
import { useCountUp } from "@/hooks/useCountUp";

function StatItem({ value, label, currency, pad }: { value: number; label: string; currency?: boolean; pad?: boolean }) {
  const { ref, value: display } = useCountUp(value, 1800);
  return (
    <div className="holo-panel clip-corner-sm flex flex-col items-center px-5 py-4 text-center">
      <span ref={ref as React.RefObject<HTMLSpanElement>} className="font-display text-2xl font-black text-white sm:text-3xl">
        {pad ? display.toString().padStart(2, "0") : currency ? `₹${display.toLocaleString("en-IN")}` : display}
      </span>
      <span className="mt-1 font-body text-[10px] font-semibold tracking-[0.3em] text-cyan-400">{label}</span>
    </div>
  );
}

export function Hero() {
  return (
    <section id="arena" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/images/esports-hero.jpg"
          alt="Esports arena under neon lights"
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05060a]/70 via-[#05060a]/40 to-[#05060a]" />
      </div>
      <ArenaCanvas />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#05060a]" />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="mb-6 flex items-center gap-3"
        >
          <span className="flex h-2 w-2 items-center justify-center">
            <span className="absolute h-2 w-2 animate-ping rounded-full bg-red-500" />
            <span className="h-2 w-2 rounded-full bg-red-500" />
          </span>
          <span className="section-label">UPCOMING TOURNAMENTS · REAL PRIZE POOLS</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.9 }}
          className="font-display text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl"
        >
          <span className="text-glow">ENTER</span> THE <span className="text-cyan-400 text-glow">ARENA</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.9 }}
          className="mt-4 font-display text-sm font-semibold tracking-[0.3em] text-slate-400 sm:text-base"
        >
          THE NEXT GENERATION OF <span className="text-cyan-400">MOBILE ESPORTS</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.8 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <a href="#tournaments" data-cursor="ENTER" className="btn-primary px-10 py-4 font-display text-sm">
            ENTER TOURNAMENT
          </a>
          <a href="#live" data-cursor="WATCH" className="btn-ghost px-10 py-4 font-display text-sm">
            WATCH LIVE
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.8 }}
          className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {heroStats.map((s) => (
            <StatItem key={s.label} {...s} />
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-[#1a2134] p-1.5">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="h-2 w-1 rounded-full bg-cyan-400"
          />
        </div>
      </motion.div>
    </section>
  );
}
