"use client";

import { motion } from "framer-motion";
import { newsItems } from "@/data/arena";

export default function NewsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-24">
      <div className="grid-bg absolute inset-0 opacity-25" />
      <div className="relative z-10 mx-auto max-w-[1100px]">
        <div className="mb-14 text-center">
          <span className="section-label mb-3">ARENA BULLETIN</span>
          <h1 className="font-display text-3xl font-black tracking-wide text-white sm:text-5xl">
            NEWS & <span className="text-cyan-400">UPDATES</span>
          </h1>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {newsItems.map((n, i) => (
            <motion.article
              key={n.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.08 }}
              data-cursor="READ"
              className="holo-panel scanline clip-corner group relative overflow-hidden"
            >
              <div className="relative h-44 w-full overflow-hidden">
                <img src={n.image} alt={n.title} className="h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d16] to-transparent" />
                <span className="absolute left-4 top-4 rounded-sm border border-cyan-400/50 bg-[#05060a]/80 px-2 py-0.5 font-body text-[9px] font-semibold tracking-[0.2em] text-cyan-400">
                  {n.category}
                </span>
              </div>
              <div className="p-6">
                <p className="mb-2 font-body text-[10px] tracking-[0.2em] text-slate-500">{n.date}</p>
                <h2 className="font-display text-lg font-bold leading-snug text-white">{n.title}</h2>
                <p className="mt-2 font-body text-sm leading-relaxed text-slate-400">{n.excerpt}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </main>
  );
}
