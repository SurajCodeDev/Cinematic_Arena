"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { faqs, scoringRules } from "@/data/arena";

const generalRules = [
  { title: "FAIR PLAY", desc: "Any form of cheating, hacking or exploiting results in an instant permanent ban and reporting to BGMI." },
  { title: "VERIFICATION", desc: "Players must use their registered BGMI UID. In-game names must match your registered profile." },
  { title: "EVIDENCE", desc: "Team captains must provide screenshots and optional video evidence for every match." },
  { title: "ROOM ACCESS", desc: "Custom room ID and password are shared 30 minutes before match start via notifications." },
  { title: "REFUND POLICY", desc: "Entry fees are refundable only if a tournament is cancelled before it begins." },
  { title: "RESULTS", desc: "All results are reviewed by referees before being published. Disputes open a review ticket." },
];

export default function RulesPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-24">
      <div className="grid-bg absolute inset-0 opacity-25" />
      <div className="relative z-10 mx-auto max-w-[900px]">
        <div className="mb-14 text-center">
          <span className="section-label mb-3">COMMAND PROTOCOL</span>
          <h1 className="font-display text-3xl font-black tracking-wide text-white sm:text-5xl">
            RULES & <span className="text-cyan-400">GUIDELINES</span>
          </h1>
        </div>

        <div className="mb-12 grid gap-4 sm:grid-cols-2">
          {generalRules.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="holo-panel clip-corner-sm p-5"
            >
              <p className="mb-1.5 font-display text-xs font-bold tracking-[0.25em] text-cyan-400">{r.title}</p>
              <p className="font-body text-sm leading-relaxed text-slate-400">{r.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mb-12">
          <h2 className="mb-5 text-center font-display text-xl font-black tracking-wide text-white">SCORING SYSTEM</h2>
          <div className="grid grid-cols-4 gap-3">
            {scoringRules.map((s) => (
              <div key={s.placement} className="holo-panel clip-corner-sm px-2 py-4 text-center">
                <p className="font-display text-base font-black text-white">
                  {s.placement}
                  <sup>{["st", "nd", "rd"][s.placement - 1] || "th"}</sup>
                </p>
                <p className="font-body text-[10px] text-cyan-400">+{s.points} PTS</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center font-body text-xs text-slate-500">KILL = +1 POINT · BONUS POINTS AS PER TOURNAMENT RULES</p>
        </div>

        <h2 className="mb-5 text-center font-display text-xl font-black tracking-wide text-white">FREQUENTLY ASKED</h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="border border-[#1a2134] bg-[#0a0d16]/70">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
                data-cursor="OPEN"
              >
                <span className="font-body text-sm font-semibold text-slate-200">{f.q}</span>
                <span className={`ml-4 font-display text-lg text-cyan-400 transition-transform ${open === i ? "rotate-45" : ""}`}>+</span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="border-t border-[#1a2134] px-5 py-4 font-body text-sm leading-relaxed text-slate-400">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
