"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const bootLines = [
  "INITIALIZING ARENA...",
  "LOADING PLAYER DATABASE",
  "LOADING TOURNAMENT ENGINE",
  "LOADING MATCH SCHEDULER",
  "CALIBRATING HOLOGRAPHIC UI",
  "SYNCING LIVE FEED",
];

const BOOT_FLAG = "nla_booted_v3";
const CREDIT = "Suraj Kumar";

export function BootSequence() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(BOOT_FLAG)) {
      setRemoved(true);
      return;
    }
    setVisible(true);
    const start = Date.now();
    const duration = 3200;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        sessionStorage.setItem(BOOT_FLAG, "1");
        setTimeout(() => setDone(true), 700);
        setTimeout(() => setRemoved(true), 1800);
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const currentLine = bootLines[Math.min(Math.floor((progress / 100) * bootLines.length), bootLines.length - 1)];
  const creditDelay = 0.9;

  return (
    <AnimatePresence>
      {visible && !removed && (
        <motion.div
          className="fixed inset-0 z-[9998] flex flex-col items-center justify-center overflow-hidden bg-[#05060a]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.85 }}
        >
          <div className="grid-bg absolute inset-0 opacity-40" />
          <motion.div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_42%,rgba(34,211,238,0.16),transparent_70%)]"
            animate={{ opacity: [0.35, 0.7, 0.35] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          <motion.div
            className="pointer-events-none absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent"
            animate={{ top: ["-20%", "120%"] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
          />

          <div className="relative flex flex-1 flex-col items-center justify-center gap-8 px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex items-center gap-3"
            >
              <div className="relative h-11 w-11">
                <span className="absolute inset-0 rotate-45 border-2 border-cyan-400/30 shadow-glow" style={{ animation: "boot-ring 2.4s ease-in-out infinite" }} />
                <span className="absolute inset-[5px] rotate-45 border border-cyan-400/70" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="h-2 w-2 bg-cyan-400" style={{ animation: "boot-pulse 1.4s ease-in-out infinite" }} />
                </span>
              </div>
              <h1 className="font-display text-xl font-black tracking-[0.28em] text-white sm:text-2xl" style={{ animation: "boot-flicker 3.6s linear infinite" }}>
                NEXT LEVEL <span className="text-cyan-400 text-glow">ARENA</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="font-body text-[10px] tracking-[0.45em] text-slate-500"
            >
              DROP · FIGHT · CLAIM
            </motion.p>

            <div className="w-[320px] max-w-[82vw]">
              <div className="mb-3 flex items-center justify-between gap-4 font-body text-[11px] tracking-[0.2em] text-slate-400">
                <motion.span
                  key={currentLine}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="truncate"
                >
                  {currentLine}
                </motion.span>
                <span className="shrink-0 text-cyan-400">{progress}%</span>
              </div>
              <div className="relative h-[3px] w-full overflow-hidden bg-[#1a2134]">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
                <span
                  className="absolute top-0 h-full w-16 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  style={{ animation: "boot-sweep 1.6s linear infinite" }}
                />
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.8em" }}
              animate={{
                opacity: progress >= 100 ? 1 : 0,
                letterSpacing: progress >= 100 ? "0.4em" : "0.8em",
              }}
              className="font-display text-sm font-bold tracking-[0.4em] text-white text-glow"
            >
              {done ? "ENTERING ARENA" : "SYSTEM READY"}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7 }}
            className="relative mb-8 flex flex-col items-center gap-2 px-6 sm:mb-10"
          >
            <p className="font-body text-[9px] font-semibold tracking-[0.42em] text-slate-600">POWERED BY</p>
            <p className="font-display text-sm font-black tracking-[0.28em] text-cyan-400 text-glow sm:text-base">
              {CREDIT.split("").map((ch, i) => (
                <motion.span
                  key={`${ch}-${i}`}
                  initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: creditDelay + i * 0.07, duration: 0.35 }}
                  className="inline-block"
                >
                  {ch === " " ? "\u00A0" : ch}
                </motion.span>
              ))}
            </p>
            <motion.span
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: creditDelay + CREDIT.length * 0.07, duration: 0.5 }}
              className="h-px w-28 origin-center bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
