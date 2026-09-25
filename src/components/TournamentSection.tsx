"use client";

import { useState } from "react";
import { getTournaments } from "@/lib/store";
import { useStoreRefresh } from "@/lib/useStoreRefresh";
import { TournamentCard } from "./TournamentCard";

type ModeFilter = "ALL" | "SOLO" | "DUO" | "SQUAD";
const MODE_FILTERS: ModeFilter[] = ["ALL", "SOLO", "DUO", "SQUAD"];

export function TournamentSection() {
  useStoreRefresh();
  const tournaments = getTournaments();
  const [mode, setMode] = useState<ModeFilter>("ALL");
  const active = tournaments.filter((t) => t.status !== "COMPLETED" && t.tag !== "HACKER");
  const filtered = mode === "ALL" ? active : active.filter((t) => t.mode === mode);

  return (
    <section id="tournaments" className="relative overflow-x-hidden py-16 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="mb-8 flex flex-col items-center text-center sm:mb-10">
          <span className="section-label mb-3">TOURNAMENTS</span>
          <h2 className="font-display text-2xl font-black tracking-wide text-white sm:text-5xl">
            UPCOMING <span className="text-cyan-400">EVENTS</span>
          </h2>
          <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-slate-400 sm:mt-4">
            Community BGMI events with verified players, live scoring and real prize pools.
            Free and paid entry tournaments available.
          </p>
        </div>

        <div className="-mx-4 mb-8 overflow-x-auto px-4 sm:mx-0 sm:mb-10 sm:overflow-visible sm:px-0">
          <div className="flex min-w-max items-center justify-start gap-2 sm:min-w-0 sm:flex-wrap sm:justify-center">
            {MODE_FILTERS.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-sm border px-4 py-2.5 font-display text-[11px] tracking-[0.15em] transition-colors ${
                  mode === m
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-400 shadow-glow"
                    : "border-[#1a2134] text-slate-500 hover:border-slate-500 hover:text-slate-300"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {filtered.map((t, i) => (
            <TournamentCard key={t.id} t={t} featured={i === 0 && mode === "ALL"} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-16 text-center font-body text-sm tracking-[0.2em] text-slate-500">
              NO {mode} EVENTS SCHEDULED
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
