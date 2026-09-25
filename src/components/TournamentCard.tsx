"use client";

import { motion } from "framer-motion";
import type { Tournament } from "@/lib/store";
import { isFreeTournament, isInviteOnly } from "@/lib/arena";

const statusColor: Record<Tournament["status"], string> = {
  LIVE: "text-red-400 border-red-500/50 bg-red-500/15",
  "REGISTRATION OPEN": "text-cyan-400 border-cyan-400/50 bg-cyan-400/10",
  UPCOMING: "text-blue-400 border-blue-500/50 bg-blue-500/10",
  COMPLETED: "text-slate-400 border-slate-600/50 bg-slate-600/10",
};

const statusShort: Record<Tournament["status"], string> = {
  LIVE: "LIVE",
  "REGISTRATION OPEN": "OPEN",
  UPCOMING: "SOON",
  COMPLETED: "DONE",
};

export function TournamentCard({
  t,
  featured = false,
  cta,
}: {
  t: Tournament;
  featured?: boolean;
  cta?: string;
}) {
  const pct = t.teams > 0 ? Math.min(100, Math.round((t.teamsJoined / t.teams) * 100)) : 0;
  const action =
    cta || (t.status === "COMPLETED" ? "VIEW RESULTS" : pct >= 100 ? "VIEW EVENT" : "JOIN TOURNAMENT");

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -6 }}
      data-cursor="ENTER"
      className={`holo-panel scanline clip-corner group relative flex min-w-0 flex-col overflow-hidden ${featured ? "sm:col-span-2" : ""}`}
    >
      <div className={`relative overflow-hidden ${featured ? "h-44 sm:h-56" : "h-36 sm:h-40"}`}>
        <img
          src={t.image}
          alt={t.short}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d16] via-[#0a0d16]/35 to-black/10" />

        <div className="absolute inset-x-3 top-3 flex flex-wrap items-center gap-1.5">
          {t.status === "LIVE" ? (
            <span className="flex items-center gap-1 rounded-sm border border-red-500/50 bg-red-500/20 px-2 py-0.5 font-body text-[9px] font-bold tracking-[0.15em] text-red-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> LIVE
            </span>
          ) : (
            <span className={`rounded-sm border px-2 py-0.5 font-body text-[9px] font-semibold tracking-[0.12em] ${statusColor[t.status]}`}>
              <span className="sm:hidden">{statusShort[t.status]}</span>
              <span className="hidden sm:inline">{t.status}</span>
            </span>
          )}
          {t.tag === "HACKER" && (
            <span className="rounded-sm border border-red-500/50 bg-red-500/15 px-2 py-0.5 font-body text-[9px] font-bold tracking-[0.12em] text-red-400">
              HACKER
            </span>
          )}
          {isFreeTournament(t) ? (
            <span className="rounded-sm border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 font-body text-[9px] font-bold tracking-[0.12em] text-emerald-400">
              FREE
            </span>
          ) : isInviteOnly(t) ? (
            <span className="rounded-sm border border-purple-500/40 bg-purple-500/15 px-2 py-0.5 font-body text-[9px] font-bold tracking-[0.12em] text-purple-400">
              INVITE
            </span>
          ) : (
            <span className="rounded-sm border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 font-body text-[9px] font-bold tracking-[0.12em] text-amber-400">
              {t.entryFee}
            </span>
          )}
        </div>

        <span className="absolute bottom-3 left-3 font-body text-[9px] font-semibold tracking-[0.22em] text-slate-300">
          {t.game} · {t.mode}
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col p-4 sm:p-5">
        <h3 className={`font-display font-black tracking-wide text-white ${featured ? "text-lg sm:text-2xl" : "text-base sm:text-xl"}`}>
          {t.short}
        </h3>
        <p className="mt-1 truncate font-body text-[11px] tracking-[0.12em] text-slate-500">
          {t.format} · {t.map}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-[#1a2134] pt-4">
          <div className="min-w-0">
            <p className="font-display text-xl font-black text-cyan-400 text-glow sm:text-2xl">{t.prizePool}</p>
            <p className="font-body text-[9px] tracking-[0.22em] text-slate-500">PRIZE POOL</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-sm font-bold text-white">
              {t.teamsJoined}/{t.teams}
            </p>
            <p className="font-body text-[9px] tracking-[0.22em] text-slate-500">TEAMS</p>
          </div>
        </div>

        <div className="mt-3 h-1 w-full overflow-hidden bg-[#1a2134]">
          <div
            className={`h-full transition-all duration-700 ${pct >= 100 ? "bg-red-500" : "bg-gradient-to-r from-cyan-400 to-blue-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 font-body text-[11px] tracking-[0.12em] text-slate-400">
          <span className="min-w-0 truncate">
            {t.date} · {t.time}
          </span>
          <span className={`shrink-0 ${isFreeTournament(t) ? "text-emerald-400" : ""}`}>
            {isFreeTournament(t) ? "FREE ENTRY" : `${t.entryFee} / PLAYER`}
          </span>
        </div>

        <a
          href={`/tournaments/${t.id}`}
          data-cursor="ENTER"
          className="btn-ghost mt-5 flex min-h-11 w-full items-center justify-center gap-2 px-4 py-3 font-display text-[11px]"
        >
          {action}
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </a>
      </div>
    </motion.article>
  );
}
