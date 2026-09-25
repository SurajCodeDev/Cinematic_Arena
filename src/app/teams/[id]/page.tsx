"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { getTeam, getPlayers } from "@/lib/store";

export default function TeamProfilePage() {
  const params = useParams<{ id: string }>();
  const team = getTeam(params.id);

  if (!team) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <p className="font-display text-2xl font-black text-white">TEAM NOT FOUND</p>
          <a href="/" className="btn-primary mt-6 inline-block px-8 py-3 font-display text-sm">BACK TO ARENA</a>
        </div>
      </main>
    );
  }

  const rosterPlayers = getPlayers().filter((p) => p.teamId === team.id);
  const stats = [
    { label: "MATCHES", value: team.matches },
    { label: "WINS", value: team.wins },
    { label: "KILLS", value: team.kills },
    { label: "AVG PLACEMENT", value: team.placement.toFixed(1) },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="relative h-[52vh] min-h-[340px] w-full overflow-hidden">
        <img src={team.image} alt={team.name} className="h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05060a]/50 via-[#05060a]/30 to-[#05060a]" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-[1200px] px-6 pb-8">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-sm border border-cyan-400/50 bg-[#0a0d16]/80 font-display text-2xl font-black text-cyan-400 shadow-glow">
                  {team.tag}
                </div>
                <div>
                  <h1 className="font-display text-3xl font-black tracking-wide text-white text-glow sm:text-5xl">{team.name}</h1>
                  <p className="mt-1 font-body text-xs tracking-[0.25em] text-slate-400">CAPTAIN · {team.captain.toUpperCase()}</p>
                </div>
              </div>
              <div className="flex flex-col items-center rounded-sm border border-[#1a2134] bg-[#0a0d16]/70 px-6 py-3">
                <span className="font-display text-xl font-black text-cyan-400">{team.earnings}</span>
                <span className="font-body text-[9px] tracking-[0.3em] text-slate-500">TOTAL EARNINGS</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 pb-24">
        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="holo-panel clip-corner-sm flex flex-col items-center py-5">
              <span className="font-display text-2xl font-black text-white sm:text-3xl">{s.value}</span>
              <span className="mt-1 font-body text-[9px] font-semibold tracking-[0.3em] text-cyan-400">{s.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="holo-panel scanline clip-corner p-6 lg:col-span-2">
            <h2 className="mb-6 font-display text-sm font-bold tracking-[0.3em] text-white">ROSTER</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {team.roster.map((member, i) => {
                const pl = rosterPlayers.find((p) => p.name.toLowerCase() === member.toLowerCase());
                return (
                  <a
                    key={member}
                    href={pl ? `/players/${pl.id}` : "#"}
                    data-cursor="VIEW"
                    className="group flex items-center gap-3 border border-[#1a2134] bg-[#0a0d16]/60 p-3 transition-colors hover:border-cyan-400/40"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-sm border border-[#1a2134] bg-[#0e1220] font-display text-sm font-black text-slate-300">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <p className="font-body text-sm font-semibold text-slate-200">{member}</p>
                      <p className="font-body text-[9px] tracking-[0.2em] text-slate-500">{i === 0 ? "CAPTAIN" : pl?.role || "PLAYER"}</p>
                    </div>
                    {pl && <span className="ml-auto font-display text-[9px] tracking-[0.2em] text-cyan-400 group-hover:translate-x-1 transition-transform">→</span>}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="holo-panel clip-corner p-6">
            <h2 className="mb-6 font-display text-sm font-bold tracking-[0.3em] text-white">TEAM INFO</h2>
            <div className="space-y-4 font-body text-sm">
              <div className="flex justify-between border-b border-[#1a2134] pb-3">
                <span className="text-slate-500">POINTS</span>
                <span className="font-semibold text-white">{team.points}</span>
              </div>
              <div className="flex justify-between border-b border-[#1a2134] pb-3">
                <span className="text-slate-500">WINS</span>
                <span className="font-semibold text-white">{team.wins}</span>
              </div>
              <div className="flex justify-between border-b border-[#1a2134] pb-3">
                <span className="text-slate-500">KILLS</span>
                <span className="font-semibold text-white">{team.kills}</span>
              </div>
              <div className="flex justify-between border-b border-[#1a2134] pb-3">
                <span className="text-slate-500">AVG PLACEMENT</span>
                <span className="font-semibold text-white">{team.placement.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">EARNINGS</span>
                <span className="font-semibold text-cyan-400">{team.earnings}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
