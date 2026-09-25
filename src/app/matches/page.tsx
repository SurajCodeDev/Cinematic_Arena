"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getMatches } from "@/lib/store";
import { useStoreRefresh } from "@/lib/useStoreRefresh";
import type { Match, MatchStatus } from "@/data/arena";

const tabs: { key: MatchStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "ALL" },
  { key: "LIVE", label: "LIVE" },
  { key: "UPCOMING", label: "UPCOMING" },
  { key: "COMPLETED", label: "RESULTS" },
];

function MatchCard({ m }: { m: Match }) {
  const isLive = m.status === "LIVE";
  const isDone = m.status === "COMPLETED";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`holo-panel scanline clip-corner p-5 ${isLive ? "border-red-500/30" : ""}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="font-display text-sm font-black tracking-[0.2em] text-white">{m.id}</span>
        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="flex items-center gap-1.5 rounded-sm border border-red-500/50 px-2 py-0.5 font-body text-[9px] font-semibold tracking-[0.2em] text-red-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> LIVE
            </span>
          ) : (
            <span className={`rounded-sm border px-2 py-0.5 font-body text-[9px] font-semibold tracking-[0.2em] ${isDone ? "border-slate-600/50 text-slate-400" : "border-cyan-400/50 text-cyan-400"}`}>
              {isDone ? "COMPLETED" : "UPCOMING"}
            </span>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between font-body text-[10px] tracking-[0.2em] text-slate-500">
        <span>{m.tournament}</span>
        <span>{m.date} · {m.time}</span>
      </div>

      <div className="mb-4 border border-[#1a2134] bg-[#0a0d16]/60">
        {(m.teams || []).map((t, i) => (
          <div key={t.tag} className={`flex items-center justify-between border-b border-[#1a2134] px-4 py-2.5 last:border-b-0 ${i === 0 && isLive ? "bg-red-500/5" : ""}`}>
            <span className="font-body text-sm font-semibold tracking-[0.1em] text-slate-200">{t.name}</span>
            <span className="flex items-center gap-3">
              {typeof t.kills === "number" && (isDone || isLive) && (
                <span className="font-body text-[10px] tracking-[0.15em] text-slate-500">{t.kills} KILLS</span>
              )}
              <span className="font-display text-base font-black text-white">{isDone || isLive ? t.points : "—"}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="font-body text-[10px] tracking-[0.2em] text-slate-500">MAP · {m.map} · {m.mode}</span>
        {isLive && m.roomId && <span className="font-body text-[10px] tracking-[0.2em] text-slate-500">ROOM <span className="text-slate-300">{m.roomId}</span></span>}
        {isLive && <a href="/#live" className="font-display text-[10px] font-bold tracking-[0.2em] text-red-400">WATCH LIVE →</a>}
        {isDone && <span className="font-body text-[10px] tracking-[0.2em] text-slate-500">RESULTS PUBLISHED</span>}
        {!isLive && !isDone && <span className="font-body text-[10px] tracking-[0.2em] text-slate-500">ROOM TBD</span>}
      </div>
    </motion.div>
  );
}

export default function MatchesPage() {
  const [tab, setTab] = useState<MatchStatus | "ALL">("ALL");
  const refresh = useStoreRefresh();
  void refresh;
  const matches = getMatches();
  const filtered = tab === "ALL" ? matches : matches.filter((m) => m.status === tab);

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-24">
      <div className="grid-bg absolute inset-0 opacity-25" />
      <div className="relative z-10 mx-auto max-w-[1000px]">
        <div className="mb-10 text-center">
          <span className="section-label mb-3">MATCH SCHEDULER</span>
          <h1 className="font-display text-3xl font-black tracking-wide text-white sm:text-5xl">
            MATCH <span className="text-cyan-400">CENTER</span>
          </h1>
        </div>

        <div className="mb-8 flex justify-center gap-2">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`px-5 py-2.5 font-body text-xs font-semibold tracking-[0.2em] transition-colors ${
                tab === tb.key
                  ? "border border-cyan-400/60 bg-cyan-400/10 text-cyan-400"
                  : "border border-[#1a2134] text-slate-500 hover:text-slate-300"
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {filtered.map((m) => (
            <MatchCard key={m.id} m={m} />
          ))}
        </div>
      </div>
    </main>
  );
}
