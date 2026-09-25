import { Hero } from "@/components/Hero";
import { MidnightHuntersBanner } from "@/components/MidnightHuntersBanner";
import { StorySection } from "@/components/StorySection";
import { TournamentSection } from "@/components/TournamentSection";
import { HackerSection } from "@/components/HackerSection";
import { LiveStreamSection } from "@/components/LiveStreamSection";
import { LiveCommandCenter } from "@/components/LiveCommandCenter";
import { LeaderboardSection } from "@/components/LeaderboardSection";
import { ChampionsSection } from "@/components/ChampionsSection";
import { NewsSection } from "@/components/NewsSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <MidnightHuntersBanner />
      <StorySection />
      <TournamentSection />
      <HackerSection />
      <LiveStreamSection />
      <LiveCommandCenter />
      <LeaderboardSection />
      <NewsSection />
      <ChampionsSection />
    </main>
  );
}
