"use client";

import { leaderboard } from "@/data/arena";
import { getMatches, getTeams } from "@/lib/store";
import { useStoreRefresh } from "@/lib/useStoreRefresh";

const rankStyle = (i: number) => {
  if (i === 0) return "text-cyan-400 border-cyan-400/40 shadow-glow bg-cyan-400/5";
  if (i === 1) return "text-blue-400 border-blue-400/40 bg-blue-400/5";
  if (i === 2) return "text-fuchsia-400 border-fuchsia-400/40 bg-fuchsia-400/5";
  return "text-slate-500 border-[#1a2134]";
};

function computeLeaderboard() {
  const matches = getMatches();
  const scored = matches.filter((m) => m.status === "COMPLETED" || m.status === "LIVE");
  if (!scored.length || !scored.some((m) => m.teams?.length)) return leaderboard;

  const agg = new Map<string, { name: string; tag: string; points: number; kills: number; wins: number; matches: number }>();
  for (const m of scored) {
    const teams = m.teams || [];
    if (!teams.length) continue;
    const topPoints = Math.max(...teams.map((t) => t.points || 0));
    for (const t of teams) {
      const entry = agg.get(t.name) || { name: t.name, tag: t.tag, points: 0, kills: 0, wins: 0, matches: 0 };
      entry.points += t.points || 0;
      entry.kills += t.kills || 0;
      entry.matches += 1;
      if (m.status === "COMPLETED" && (t.points || 0) >= topPoints) entry.wins += 1;
      agg.set(t.name, entry);
    }
  }
  return [...agg.values()].sort((a, b) => b.points - a.points || b.kills - a.kills);
}

export function LeaderboardSection() {
  useStoreRefresh();
  const rows = computeLeaderboard();
  const teams = getTeams();
  return (
    <section id="leaderboard" className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070a12] to-transparent" />
      <div className="relative z-10 mx-auto max-w-[1100px] px-6">
        <div className="mb-14 flex flex-col items-center text-center">
          <span className="section-label mb-3">LEADERBOARD</span>
          <h2 className="font-display text-3xl font-black tracking-wide text-white sm:text-5xl">
            HALL OF <span className="text-cyan-400">FAME</span>
          </h2>
        </div>

        <div className="overflow-hidden">
          <div className="mb-3 grid grid-cols-[40px_1fr_60px_60px_80px] items-center gap-2 px-4 font-body text-[9px] tracking-[0.25em] text-slate-600 sm:grid-cols-[50px_1fr_90px_90px_120px]">
            <span>RANK</span>
            <span>TEAM</span>
            <span className="text-right">KILLS</span>
            <span className="text-right">WINS</span>
            <span className="text-right">POINTS</span>
          </div>

          <div className="space-y-2">
            {rows.map((t, i) => {
              const teamId = teams.find((x) => x.name === t.name)?.id;
              return (
              <a
                key={t.name}
                href={teamId ? `/teams/${teamId}` : "/tournaments"}
                data-cursor="VIEW"
                className={`grid grid-cols-[40px_1fr_60px_60px_80px] items-center gap-2 border bg-[#0a0d16]/70 px-4 py-4 transition-colors hover:border-cyan-400/40 sm:grid-cols-[50px_1fr_90px_90px_120px] ${
                  i < 3 ? `border ${rankStyle(i)}` : "border-[#1a2134]"
                }`}
              >
                <span className={`font-display text-lg font-black ${i < 3 ? rankStyle(i).split(" ")[0] : "text-slate-600"}`}>
                  #{String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#1a2134] bg-[#0e1220] font-display text-[10px] font-black text-slate-300">
                    {t.tag}
                  </span>
                  <span className="truncate font-body text-sm font-semibold tracking-[0.12em] text-slate-200">
                    {t.name}
                  </span>
                  {i === 0 && <span className="hidden font-body text-[8px] tracking-[0.2em] text-cyan-400 sm:block">LEADER</span>}
                </div>
                <span className="text-right font-body text-xs text-slate-400">{t.kills}</span>
                <span className="text-right font-body text-xs text-slate-400">{t.wins}</span>
                <span className="text-right font-display text-base font-black text-white">{t.points}</span>
              </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
