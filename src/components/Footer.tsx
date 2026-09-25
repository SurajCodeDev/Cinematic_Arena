import { navLinks } from "@/data/arena";

export function Footer() {
  return (
    <footer className="relative border-t border-[#1a2134] py-14">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rotate-45 border-2 border-cyan-400 flex items-center justify-center">
                <div className="h-1.5 w-1.5 -rotate-45 bg-cyan-400" />
              </div>
              <span className="font-display text-sm font-black tracking-[0.25em] text-white">
                NEXT LEVEL <span className="text-cyan-400">ARENA</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs font-body text-xs leading-relaxed text-slate-500">
              NEXT LEVEL ARENA — the next generation of BGMI mobile esports. Live tournaments, real-time leaderboards,
              verified players and competitive events.
            </p>
          </div>

          <div>
            <p className="mb-4 font-body text-[10px] font-semibold tracking-[0.3em] text-slate-600">NAVIGATION</p>
            <div className="flex flex-col gap-2.5">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href.startsWith("#") ? `/${l.href}` : l.href} className="font-body text-xs tracking-[0.15em] text-slate-400 transition-colors hover:text-cyan-400">
                  {l.label}
                </a>
              ))}
              <a href="/tournaments" className="font-body text-xs tracking-[0.15em] text-slate-400 transition-colors hover:text-cyan-400">Tournaments</a>
              <a href="/matches" className="font-body text-xs tracking-[0.15em] text-slate-400 transition-colors hover:text-cyan-400">Matches</a>
              <a href="/bracket" className="font-body text-xs tracking-[0.15em] text-slate-400 transition-colors hover:text-cyan-400">Bracket</a>
              <a href="/news" className="font-body text-xs tracking-[0.15em] text-slate-400 transition-colors hover:text-cyan-400">News</a>
              <a href="/rules" className="font-body text-xs tracking-[0.15em] text-slate-400 transition-colors hover:text-cyan-400">Rules & FAQ</a>
            </div>
          </div>

          <div>
            <p className="mb-4 font-body text-[10px] font-semibold tracking-[0.3em] text-slate-600">PLATFORM</p>
            <div className="flex flex-col gap-2.5">
              <a href="/register" className="font-body text-xs tracking-[0.15em] text-slate-400 transition-colors hover:text-cyan-400">Sign Up</a>
              <a href="/login" className="font-body text-xs tracking-[0.15em] text-slate-400 transition-colors hover:text-cyan-400">Player Login</a>
              <a href="/admin" className="font-body text-xs tracking-[0.15em] text-slate-400 transition-colors hover:text-cyan-400">Admin</a>
              <a href="/contact" className="font-body text-xs tracking-[0.15em] text-slate-400 transition-colors hover:text-cyan-400">Contact Support</a>
            </div>
          </div>

          <div>
            <p className="mb-4 font-body text-[10px] font-semibold tracking-[0.3em] text-slate-600">COMMUNITY</p>
            <div className="flex flex-col gap-2.5">
              <a href="mailto:ksuraj138@gmail.com" className="font-body text-xs tracking-[0.15em] text-slate-400 transition-colors hover:text-cyan-400">Email</a>
              <a href="https://t.me/BESTCHEAT_VIP" target="_blank" rel="noopener noreferrer" className="font-body text-xs tracking-[0.15em] text-slate-400 transition-colors hover:text-cyan-400">Telegram</a>
              <a href="https://wa.me/917015742792" target="_blank" rel="noopener noreferrer" className="font-body text-xs tracking-[0.15em] text-slate-400 transition-colors hover:text-cyan-400">WhatsApp</a>
              <a href="https://discord.com/users/predator_dark_devil" target="_blank" rel="noopener noreferrer" className="font-body text-xs tracking-[0.15em] text-slate-400 transition-colors hover:text-cyan-400">Discord</a>
              <a href="https://youtube.com/@nextlevelarena" target="_blank" rel="noopener noreferrer" className="font-body text-xs tracking-[0.15em] text-slate-400 transition-colors hover:text-cyan-400">YouTube</a>
              <a href="https://instagram.com/nextlevelarena.esports" target="_blank" rel="noopener noreferrer" className="font-body text-xs tracking-[0.15em] text-slate-400 transition-colors hover:text-cyan-400">Instagram</a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#1a2134] pt-6 sm:flex-row">
          <p className="font-body text-[10px] tracking-[0.2em] text-slate-600">
            © 2024 NEXT LEVEL ARENA · ALL RIGHTS RESERVED
          </p>
          <p className="font-body text-[10px] tracking-[0.2em] text-slate-600">
            BUILT FOR THE NEXT GENERATION OF <span className="text-cyan-400">MOBILE ESPORTS</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
