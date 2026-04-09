import type { Metadata } from "next";
import { healthMock } from "@/lib/health-mock";
import { getFeaturedProjects } from "@/lib/content";
import HealthStatusLine from "@/components/widgets/HealthStatusLine";
import HealthHeroCards from "@/components/widgets/HealthHeroCards";
import HealthHeatmap from "@/components/widgets/HealthHeatmap";
import HealthSportMix from "@/components/widgets/HealthSportMix";
import HealthRecentWorkouts from "@/components/widgets/HealthRecentWorkouts";
import SpotifyNowPlaying from "@/components/widgets/SpotifyNowPlaying";
import GithubLatestCommit from "@/components/widgets/GithubLatestCommit";
import ProjectCard from "@/components/projects/ProjectCard";

export const metadata: Metadata = {
  title: "rohan singh",
  description: "cs student at uva. building things.",
};

export default function HomePage() {
  // phase 5: replace healthMock with a fetch to /api/health/summary
  const health = healthMock;
  const featured = getFeaturedProjects().slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

      {/* ── health ─────────────────────────────────────────────── */}
      <section aria-label="health">
        <HealthStatusLine data={health} />
        <HealthHeroCards data={health} />
        <HealthHeatmap heatmap={health.heatmap} />
        <HealthSportMix data={health} />
        <HealthRecentWorkouts workouts={health.recentWorkouts} />
      </section>

      {/* ── live widgets ───────────────────────────────────────── */}
      <section
        aria-label="live widgets"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-border"
      >
        <SpotifyNowPlaying />
        <GithubLatestCommit />
      </section>

      {/* ── featured projects ──────────────────────────────────── */}
      <section aria-label="projects" className="pt-10 border-t border-border mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted">
            projects
          </h2>
          <a
            href="/projects"
            className="text-xs text-muted hover:text-fg transition-colors"
          >
            all projects →
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {featured.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>

    </div>
  );
}
