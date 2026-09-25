"use client";

import { getTournaments } from "@/lib/store";
import { useStoreRefresh } from "@/lib/useStoreRefresh";
import { TournamentCard } from "./TournamentCard";

export function HackerSection() {
  useStoreRefresh();
  const tournaments = getTournaments();
  const hacker = tournaments.filter((t) => t.tag === "HACKER" && t.status !== "COMPLETED");

  if (hacker.length === 0) return null;

  return (
    <section id="hacker" className="relative overflow-x-hidden py-16 sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(239,68,68,0.06),transparent_70%)]" />
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="mb-8 flex flex-col items-center text-center sm:mb-14">
          <span className="section-label mb-3 text-red-400">EXPERIMENTAL ZONE</span>
          <h2 className="font-display text-2xl font-black tracking-wide text-white sm:text-5xl">
            HACKER <span className="text-red-400">vs</span> HACKER
          </h2>
          <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-slate-400 sm:mt-4">
            No anti-cheat. No bans. No rules. The underground arena where every tool is legal —
            aimbots, ESP, speed hacks, teleports. Only the most dangerous survive.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {hacker.map((t) => (
            <TournamentCard key={t.id} t={t} cta="ENTER HACK-OFF" />
          ))}
        </div>
      </div>
    </section>
  );
}
