"use client";

import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      const el = e.target as HTMLElement;
      const interactive = el.closest("[data-cursor]");
      if (interactive) {
        const label = interactive.getAttribute("data-cursor");
        setLabel(label || "");
        setActive(true);
      } else {
        setLabel("");
        setActive(false);
      }
    };

    let raf: number;
    const loop = () => {
      current.x += (target.x - current.x) * 0.16;
      current.y += (target.y - current.y) * 0.16;
      if (ref.current) {
        ref.current.style.transform = `translate(${current.x}px, ${current.y}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      className="cursor-dot fixed left-0 top-0 z-[9999] pointer-events-none"
      style={{
        width: active ? 56 : 24,
        height: active ? 56 : 24,
        background: active ? "rgba(34,211,238,0.1)" : "transparent",
        borderColor: active ? "rgba(34,211,238,0.9)" : "rgba(34,211,238,0.5)",
      }}
    >
      <span className="font-display font-bold select-none">{active ? label : "+"}</span>
    </div>
  );
}
