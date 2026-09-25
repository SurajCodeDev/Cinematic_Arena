"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks } from "@/data/arena";
import { useAuth } from "@/context/AuthContext";

const extraLinks = [
  { label: "MATCHES", href: "/matches" },
  { label: "BRACKET", href: "/bracket" },
  { label: "NEWS", href: "/news" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#arena");
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      if (window.location.pathname !== "/") return;
      const ids = navLinks.map((l) => l.href.slice(1));
      let current = "#arena";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) {
          current = `#${id}`;
        }
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  const goTo = (href: string) => {
    closeMenu();
    const run = () => {
      if (href.startsWith("#")) {
        if (window.location.pathname !== "/") {
          window.location.assign(`/${href}`);
          return;
        }
        const el = document.getElementById(href.slice(1));
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          window.history.replaceState(null, "", href);
          return;
        }
        window.location.hash = href;
        return;
      }
      window.location.assign(href);
    };
    window.setTimeout(run, 60);
  };

  const linkClass = (href: string) =>
    `relative font-body text-xs font-semibold tracking-[0.2em] transition-colors ${
      active === href ? "text-cyan-400" : "text-slate-400 hover:text-white"
    }`;

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-[900] transition-all duration-300 ${
        scrolled || open ? "bg-[#05060a]/90 backdrop-blur-xl border-b border-[#1a2134]" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4">
        <a href="/" className="flex items-center gap-2.5" data-cursor="HOME">
          <div className="flex h-7 w-7 rotate-45 items-center justify-center border-2 border-cyan-400">
            <div className="h-1.5 w-1.5 -rotate-45 bg-cyan-400" />
          </div>
          <span className="font-display text-sm font-black tracking-[0.25em] text-white">
            NEXT LEVEL <span className="text-cyan-400">ARENA</span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                goTo(link.href);
              }}
              data-cursor={link.label}
              className={linkClass(link.href)}
            >
              {active === link.href && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-1.5 left-0 right-0 h-px bg-cyan-400 shadow-glow"
                />
              )}
              {link.label}
            </a>
          ))}
          {extraLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              data-cursor={link.label}
              className="relative font-body text-xs font-semibold tracking-[0.2em] text-slate-400 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              {user.role === "admin" && (
                <a href="/admin" data-cursor="ADMIN" className="btn-ghost px-4 py-2 font-body text-xs">
                  ADMIN
                </a>
              )}
              <a href={user.role === "admin" ? "/admin" : "/dashboard"} data-cursor="PLAYER" className="btn-ghost flex items-center gap-2 px-4 py-2 font-body text-xs">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />
                ) : null}
                {user.name}
              </a>
              <button
                onClick={logout}
                data-cursor="EXIT"
                className="border border-[#1a2134] px-4 py-2 font-body text-xs text-slate-400 transition-colors hover:border-red-500/50 hover:text-red-400"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <a href="/login" data-cursor="LOGIN" className="btn-ghost px-4 py-2 font-body text-xs">
                LOGIN
              </a>
              <a href="/register" data-cursor="JOIN" className="btn-primary px-4 py-2 font-body text-xs">
                SIGN UP
              </a>
            </>
          )}
        </div>

        <button
          type="button"
          className="relative z-[910] flex h-11 w-11 flex-col items-center justify-center gap-[5px] lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span className={`h-0.5 w-6 bg-cyan-400 transition-all ${open ? "translate-y-[7px] rotate-45" : ""}`} />
          <span className={`h-0.5 w-6 bg-cyan-400 transition-all ${open ? "scale-0 opacity-0" : ""}`} />
          <span className={`h-0.5 w-6 bg-cyan-400 transition-all ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-b border-[#1a2134] bg-[#05060a] lg:hidden"
          >
            <div className="flex max-h-[calc(100dvh-72px)] flex-col gap-0.5 overflow-y-auto px-4 py-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(link.href);
                  }}
                  className="flex min-h-12 items-center px-2 font-body text-sm font-semibold tracking-[0.2em] text-slate-200 active:text-cyan-400"
                >
                  {link.label}
                </a>
              ))}
              {extraLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(link.href);
                  }}
                  className="flex min-h-12 items-center px-2 font-body text-sm font-semibold tracking-[0.2em] text-slate-200 active:text-cyan-400"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/rules"
                onClick={(e) => {
                  e.preventDefault();
                  goTo("/rules");
                }}
                className="flex min-h-12 items-center px-2 font-body text-sm font-semibold tracking-[0.2em] text-slate-200 active:text-cyan-400"
              >
                RULES
              </a>
              <div className="my-2 h-px bg-[#1a2134]" />
              {user ? (
                <>
                  {user.role === "admin" && (
                    <a
                      href="/admin"
                      onClick={(e) => {
                        e.preventDefault();
                        goTo("/admin");
                      }}
                      className="flex min-h-12 items-center px-2 font-body text-sm tracking-[0.2em] text-cyan-400"
                    >
                      ADMIN PANEL
                    </a>
                  )}
                  <a
                    href="/dashboard"
                    onClick={(e) => {
                      e.preventDefault();
                      goTo("/dashboard");
                    }}
                    className="flex min-h-12 items-center px-2 font-body text-sm tracking-[0.2em] text-cyan-400"
                  >
                    DASHBOARD
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      logout();
                    }}
                    className="flex min-h-12 items-center px-2 text-left font-body text-sm tracking-[0.2em] text-red-400"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="/login"
                    onClick={(e) => {
                      e.preventDefault();
                      goTo("/login");
                    }}
                    className="flex min-h-12 items-center px-2 font-body text-sm tracking-[0.2em] text-slate-200"
                  >
                    LOGIN
                  </a>
                  <a
                    href="/register"
                    onClick={(e) => {
                      e.preventDefault();
                      goTo("/register");
                    }}
                    className="btn-primary mt-2 px-5 py-3 text-center font-body text-sm"
                  >
                    SIGN UP
                  </a>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
