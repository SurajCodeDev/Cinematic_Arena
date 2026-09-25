"use client";

import { motion } from "framer-motion";
import { newsItems } from "@/data/arena";

export function NewsSection() {
  const featured = newsItems.slice(0, 3);
  return (
    <section id="news" className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070a12] to-transparent" />
      <div className="relative z-10 mx-auto max-w-[1400px] px-6">
        <div className="mb-14 flex flex-col items-center text-center">
          <span className="section-label mb-3">ARENA BULLETIN</span>
          <h2 className="font-display text-3xl font-black tracking-wide text-white sm:text-5xl">
            NEWS & <span className="text-cyan-400">UPDATES</span>
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((n, i) => (
            <motion.a
              key={n.id}
              href="/news"
              data-cursor="READ"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="holo-panel scanline clip-corner group relative overflow-hidden"
            >
              <div className="relative h-40 w-full overflow-hidden">
                <img src={n.image} alt={n.title} className="h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d16] to-transparent" />
                <span className="absolute left-4 top-4 rounded-sm border border-cyan-400/50 bg-[#05060a]/80 px-2 py-0.5 font-body text-[9px] font-semibold tracking-[0.2em] text-cyan-400">
                  {n.category}
                </span>
              </div>
              <div className="p-5">
                <p className="mb-2 font-body text-[10px] tracking-[0.2em] text-slate-500">{n.date}</p>
                <h3 className="font-display text-base font-bold leading-snug text-white">{n.title}</h3>
                <p className="mt-2 line-clamp-2 font-body text-sm text-slate-400">{n.excerpt}</p>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a href="/news" data-cursor="READ" className="btn-ghost inline-block px-8 py-3 font-display text-xs">
            VIEW ALL UPDATES <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
