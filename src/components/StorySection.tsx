"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { modes, bracketStages } from "@/data/arena";

function SceneHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-8 flex flex-col items-center">
      <span className="section-label mb-3">{kicker}</span>
      <h2 className="font-display text-3xl font-black tracking-wide text-white sm:text-4xl lg:text-5xl">{title}</h2>
    </div>
  );
}

function Scene01() {
  return (
    <section id="scene01" className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-50" />
      <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/20 sm:h-[420px] sm:w-[420px]" />
      <div className="absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/30 sm:h-[260px] sm:w-[260px]" />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1 }}
        className="relative z-10 px-6 text-center"
      >
        <p className="font-display text-3xl font-black tracking-[0.15em] text-white text-glow sm:text-5xl">
          THE BATTLEFIELD IS READY.
        </p>
      </motion.div>
    </section>
  );
}

function Scene02() {
  return (
    <section id="scene02" className="relative flex min-h-screen items-center justify-center overflow-hidden py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#05060a]/40" />
      <div className="relative z-10 mx-auto max-w-[1200px] px-6">
        <SceneHeading kicker="SCENE 02" title="CHOOSE YOUR BATTLE" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {modes.map((mode, i) => (
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 40, rotateX: -12 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              whileHover={{ rotateX: 8, rotateY: -6, scale: 1.05, borderColor: "rgba(34,211,238,0.8)" }}
              data-cursor={mode}
              className="holo-panel clip-corner flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-3"
            >
              <span className="font-display text-xs tracking-[0.2em] text-cyan-400">MODE</span>
              <span className="font-display text-lg font-black text-white">{mode}</span>
              <span className="h-px w-8 bg-cyan-400/60" />
              <span className="font-body text-[10px] tracking-[0.2em] text-slate-500">SELECT</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const squadPlayers = [
  { name: "PLAYER 01", role: "IGL", tag: "VIPER" },
  { name: "PLAYER 02", role: "ASSAULT", tag: "BLITZ" },
  { name: "PLAYER 03", role: "SNIPER", tag: "CIPHER" },
  { name: "PLAYER 04", role: "SUPPORT", tag: "FROST" },
];

function Scene03() {
  return (
    <section id="scene03" className="relative flex min-h-screen items-center justify-center overflow-hidden py-24">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative z-10 mx-auto max-w-[1000px] px-6">
        <SceneHeading kicker="SCENE 03" title="BUILD YOUR SQUAD" />
        <p className="mb-12 text-center font-display text-sm font-semibold tracking-[0.25em] text-cyan-400">
          FOUR PLAYERS. ONE OBJECTIVE.
        </p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {squadPlayers.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.15, duration: 0.7 }}
              data-cursor="VIEW"
              className="holo-panel scanline clip-corner relative flex flex-col items-center gap-2 px-4 py-10"
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10 font-display text-xl font-black text-cyan-400 shadow-glow">
                {String(i + 1).padStart(2, "0")}
              </div>
              <span className="font-display text-sm font-bold text-white">{p.name}</span>
              <span className="font-body text-[10px] tracking-[0.2em] text-slate-500">{p.role}</span>
              <span className="mt-1 rounded-sm border border-[#1a2134] px-2 py-0.5 font-body text-[9px] tracking-[0.2em] text-cyan-400">
                {p.tag}
              </span>
              {i < 3 && (
                <div className="absolute -right-2 top-1/2 hidden h-px w-4 bg-cyan-400/50 lg:block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Scene04() {
  return (
    <section id="scene04" className="relative flex min-h-screen items-center justify-center overflow-hidden py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-[#05060a]/60 to-transparent" />
      <div className="relative z-10 mx-auto max-w-[900px] px-6">
        <SceneHeading kicker="SCENE 04" title="ENTER THE TOURNAMENT" />
        <div className="flex flex-col items-center gap-0">
          {bracketStages.map((stage, i) => (
            <motion.div key={stage} className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: i * 0.25, duration: 0.6 }}
                data-cursor={stage}
                className={`clip-corner-sm w-[240px] px-6 py-3 text-center font-display text-xs font-bold tracking-[0.3em] sm:w-[320px] ${
                  i === bracketStages.length - 1
                    ? "border border-cyan-400/60 bg-cyan-400/10 text-cyan-400 shadow-glow"
                    : "border border-[#1a2134] bg-[#0a0d16] text-slate-300"
                }`}
              >
                {stage}
              </motion.div>
              {i < bracketStages.length - 1 && (
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.25 + 0.3, duration: 0.4 }}
                  className="h-10 w-px origin-top bg-gradient-to-b from-cyan-400/70 to-cyan-400/10"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Scene05() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], [80, -80]);

  const liveTeams = [
    { name: "TEAM NOVA", points: 0 },
    { name: "TEAM TITANS", points: 0 },
    { name: "TEAM PHOENIX", points: 0 },
    { name: "TEAM LEGACY", points: 0 },
  ];

  return (
    <section id="scene05" ref={ref} className="relative flex min-h-screen items-center justify-center overflow-hidden py-24">
      <div className="relative z-10 mx-auto w-full max-w-[800px] px-6">
        <SceneHeading kicker="SCENE 05" title="LIVE BATTLE" />
        <motion.div style={{ x }} className="holo-panel scanline clip-corner p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 items-center justify-center">
                <span className="absolute h-2 w-2 animate-ping rounded-full bg-red-500" />
                <span className="h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="font-display text-xs font-bold tracking-[0.3em] text-cyan-400">UPCOMING</span>
            </div>
            <span className="font-display text-xs font-bold tracking-[0.3em] text-white">MATCH 01</span>
          </div>
          <div className="mb-6 flex items-center justify-between border-y border-[#1a2134] py-3">
            <span className="font-body text-sm font-semibold tracking-[0.2em] text-cyan-400">ERANGEL</span>
            <span className="font-body text-xs text-slate-500">12 OCT · 08:30 PM</span>
          </div>
          <div className="space-y-3">
            {liveTeams.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between border-l-2 border-cyan-400/40 bg-[#0a0d16]/60 px-4 py-3"
              >
                <span className="font-body text-sm font-semibold tracking-[0.15em] text-slate-200">
                  {String(i + 1).padStart(2, "0")} {t.name}
                </span>
                <span className="font-display text-lg font-black text-white">{t.points}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function StorySection() {
  return (
    <>
      <Scene01 />
      <Scene02 />
      <Scene03 />
      <Scene04 />
      <Scene05 />
    </>
  );
}
