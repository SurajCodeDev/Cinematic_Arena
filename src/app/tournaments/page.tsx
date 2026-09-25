"use client";

import { useState } from "react";
import { getTournaments } from "@/lib/store";
import { useStoreRefresh } from "@/lib/useStoreRefresh";
import { TournamentCard } from "@/components/TournamentCard";

type ModeFilter = "ALL" | "SOLO" | "DUO" | "SQUAD";
const MODE_FILTERS: ModeFilter[] = ["ALL", "SOLO", "DUO", "SQUAD"];

export default function TournamentsPage() {
  useStoreRefresh();
  const tournaments = getTournaments();
  const [mode, setMode] = useState<ModeFilter>("ALL");
  const filtered = mode === "ALL" ? tournaments : tournaments.filter((t) => t.mode === mode);

  return (
    <main className="relative min-h-screen overflow-x-hidden px-4 py-20 sm:px-6 sm:py-24">
      <div className="grid-bg absolute inset-0 opacity-25" />
      <div className="relative z-10 mx-auto max-w-[1400px]">
        <div className="mb-8 text-center sm:mb-10">
          <span className="section-label mb-3">TOURNAMENTS</span>
          <h1 className="font-display text-2xl font-black tracking-wide text-white sm:text-5xl">
            ALL <span className="text-cyan-400">EVENTS</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl font-body text-sm leading-relaxed text-slate-400 sm:mt-4">
            Browse every NEXT LEVEL ARENA tournament — free and paid entry, solo to squad.
          </p>
        </div>

        <div className="-mx-4 mb-8 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex min-w-max items-center justify-start gap-2 sm:min-w-0 sm:flex-wrap sm:justify-center">
            {MODE_FILTERS.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-sm border px-5 py-2.5 font-body text-xs font-semibold tracking-[0.2em] transition-colors ${
                  mode === m
                    ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-400"
                    : "border-[#1a2134] text-slate-500 hover:text-slate-300"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center font-body text-sm tracking-[0.15em] text-slate-500">NO TOURNAMENTS FOUND.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {filtered.map((t) => (
              <TournamentCard
                key={t.id}
                t={t}
                cta={t.status === "COMPLETED" ? "VIEW RESULTS" : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
