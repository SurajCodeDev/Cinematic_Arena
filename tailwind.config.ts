import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          bg: "#05060a",
          surface: "#0a0d16",
          panel: "#0e1220",
          line: "#1a2134",
          cyan: "#22d3ee",
          blue: "#3b82f6",
          danger: "#f97316",
          red: "#ef4444",
          text: "#e2e8f0",
          dim: "#64748b",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(34,211,238,0.35)",
        "glow-blue": "0 0 40px -8px rgba(59,130,246,0.4)",
      },
    },
  },
  plugins: [],
} satisfies Config;
