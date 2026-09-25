"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { getPlayer, getTeam } from "@/lib/store";

export default function PlayerProfilePage() {
  const params = useParams<{ id: string }>();
  const player = getPlayer(params.id);

  if (!player) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <p className="font-display text-2xl font-black text-white">PLAYER NOT FOUND</p>
          <a href="/" className="btn-primary mt-6 inline-block px-8 py-3 font-display text-sm">BACK TO ARENA</a>
        </div>
      </main>
    );
  }

  const team = getTeam(player.teamId);
  const stats = [
    { label: "MATCHES", value: player.matches },
    { label: "WINS", value: player.wins },
    { label: "KILLS", value: player.kills },
    { label: "KD", value: player.kd.toFixed(2) },
    { label: "WIN RATE", value: `${player.winRate}%` },
    { label: "EARNINGS", value: player.earnings, accent: true },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="relative h-[50vh] min-h-[320px] w-full overflow-hidden">
        <img src={player.image} alt={player.name} className="h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05060a]/50 via-[#05060a]/30 to-[#05060a]" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-[1200px] px-6 pb-8">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-cyan-400/60 bg-[#0a0d16]/80 font-display text-3xl font-black text-cyan-400 shadow-glow">
                  {player.name.charAt(0)}
                </div>
                <div>
                  <h1 className="font-display text-3xl font-black tracking-wide text-white text-glow sm:text-5xl">{player.name}</h1>
                  <p className="mt-1 font-body text-xs tracking-[0.25em] text-slate-400">
                    {player.role.toUpperCase()} ·{" "}
                    {team ? (
                      <a href={`/teams/${team.id}`} className="text-cyan-400 hover:text-cyan-300">{team.name}</a>
                    ) : (
                      player.team
                    )}
                  </p>
                </div>
              </div>
              <div className="rounded-sm border border-[#1a2134] bg-[#0a0d16]/70 px-6 py-3 text-center">
                <span className="font-body text-[9px] tracking-[0.3em] text-slate-500">BGMI UID</span>
                <p className="mt-0.5 font-display text-lg font-black tracking-widest text-white">{player.uid}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 pb-24">
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="holo-panel clip-corner-sm flex flex-col items-center justify-center py-5">
              <span className={`font-display text-xl font-black sm:text-2xl ${s.accent ? "text-cyan-400" : "text-white"}`}>{s.value}</span>
              <span className="mt-1 font-body text-[8px] font-semibold tracking-[0.25em] text-slate-500">{s.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="holo-panel scanline clip-corner p-6">
            <h2 className="mb-5 font-display text-sm font-bold tracking-[0.3em] text-white">MATCH HISTORY</h2>
            <div className="space-y-3">
              {[
                { map: "ERANGEL", event: "Championship Series · M04", result: "WIN", kills: 9, points: 24 },
                { map: "MIRAMAR", event: "Championship Series · M03", result: "2ND", kills: 6, points: 18 },
                { map: "SANHOK", event: "Championship Series · M02", result: "4TH", kills: 5, points: 13 },
                { map: "LIVIK", event: "Championship Series · M01", result: "WIN", kills: 8, points: 23 },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between border border-[#1a2134] bg-[#0a0d16]/60 px-4 py-3">
                  <div>
                    <p className="font-body text-sm font-semibold text-slate-200">{m.map}</p>
                    <p className="font-body text-[9px] tracking-[0.15em] text-slate-500">{m.event}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-display text-xs font-black ${m.result === "WIN" ? "text-cyan-400" : "text-slate-300"}`}>{m.result}</p>
                    <p className="font-body text-[9px] text-slate-500">{m.kills} KILLS · {m.points} PTS</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="holo-panel clip-corner p-6">
            <h2 className="mb-5 font-display text-sm font-bold tracking-[0.3em] text-white">TOURNAMENT HISTORY</h2>
            <div className="space-y-3">
              {[
                { event: "BGMI Championship Series", position: "1ST", prize: "₹1,250" },
                { event: "BGMI Pro League S2", position: "3RD", prize: "₹500" },
                { event: "BGMI Community Clash", position: "1ST", prize: "₹500" },
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between border border-[#1a2134] bg-[#0a0d16]/60 px-4 py-3">
                  <div>
                    <p className="font-body text-sm font-semibold text-slate-200">{t.event}</p>
                    <p className="font-body text-[9px] tracking-[0.15em] text-slate-500">POSITION</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xs font-black text-cyan-400">{t.position}</p>
                    <p className="font-body text-[9px] text-slate-500">{t.prize}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
