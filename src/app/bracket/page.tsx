"use client";

import { motion } from "framer-motion";
import { bracket } from "@/data/arena";

export default function BracketPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-24">
      <div className="grid-bg absolute inset-0 opacity-25" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_-10%,rgba(34,211,238,0.08),transparent_60%)]" />
      <div className="relative z-10 mx-auto max-w-[1200px]">
        <div className="mb-14 text-center">
          <span className="section-label mb-3">CHAMPIONSHIP SERIES</span>
          <h1 className="font-display text-3xl font-black tracking-wide text-white sm:text-5xl">
            TOURNAMENT <span className="text-cyan-400">BRACKET</span>
          </h1>
          <p className="mt-3 font-body text-sm text-slate-400">Live progression of the BGMI Championship Series</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {bracket.map((round, ri) => (
            <motion.div
              key={round.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: ri * 0.12, duration: 0.6 }}
              className="flex flex-col"
            >
              <div className={`mb-4 text-center font-display text-xs font-bold tracking-[0.25em] ${ri === bracket.length - 1 ? "text-cyan-400" : "text-slate-400"}`}>
                {round.name}
              </div>
              <div className="flex flex-1 flex-col justify-center gap-3">
                {round.matches.map((m, mi) => {
                  const isFinal = ri === bracket.length - 1;
                  return (
                    <div
                      key={mi}
                      className={`border p-3 ${isFinal ? "border-cyan-400/50 bg-cyan-400/5 shadow-glow" : "border-[#1a2134] bg-[#0a0d16]/70"}`}
                    >
                      <div className={`mb-2 font-body text-[9px] tracking-[0.2em] ${isFinal ? "text-cyan-400" : "text-slate-600"}`}>
                        MATCH {mi + 1}
                      </div>
                      {[m.teamA, m.teamB].map((team, i) => {
                        const score = i === 0 ? m.scoreA : m.scoreB;
                        const isWinner = m.winner === team;
                        return (
                          <div key={team} className={`flex items-center justify-between px-2 py-1.5 ${isWinner ? "bg-cyan-400/10" : ""}`}>
                            <span className={`font-body text-xs ${isWinner ? "font-bold text-cyan-400" : "text-slate-400"}`}>
                              {team}
                              {isWinner && <span className="ml-1.5 text-[8px] tracking-[0.1em]">✓</span>}
                            </span>
                            <span className="font-display text-xs font-black text-white">{score || "—"}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a href="/tournaments" className="btn-primary inline-block px-10 py-4 font-display text-sm">VIEW TOURNAMENTS</a>
        </div>
      </div>
    </main>
  );
}
