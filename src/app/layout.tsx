import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const display = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NEXT LEVEL ARENA — BGMI Esports",
  description: "NEXT LEVEL ARENA — the next generation of BGMI mobile esports. Live tournaments, real-time leaderboards, verified players and competitive events.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
