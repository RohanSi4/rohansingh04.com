import Link from "next/link";
import Image from "next/image";
import type { ProjectMeta } from "@/lib/types";

function FitnessVisual() {
  const bars = [22, 36, 28, 54, 48, 72, 64, 92];
  return (
    <div className="flex h-full flex-col justify-between p-6 sm:p-8" aria-hidden="true">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
        <span>weekly miles</span><span>live</span>
      </div>
      <div className="flex h-28 items-end gap-2">
        {bars.map((height, index) => (
          <span
            key={`${height}-${index}`}
            className="flex-1 rounded-t-sm bg-[#f27655]"
            style={{ height: `${height}%`, opacity: 0.55 + index * 0.055 }}
          />
        ))}
      </div>
      <div className="flex items-end justify-between border-t border-white/15 pt-4">
        <div><strong className="font-mono text-3xl font-medium text-white">26.2</strong><p className="text-xs text-white/50">current goal</p></div>
        <div className="text-right"><strong className="font-mono text-lg font-medium text-white">250 mi</strong><p className="text-xs text-white/50">in the archive</p></div>
      </div>
    </div>
  );
}

function RankingVisual() {
  return (
    <div className="relative h-full min-h-64" aria-hidden="true">
      <Image
        src="/projects/movie-recommender-results.jpg"
        alt=""
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover object-top"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-6 pb-5 pt-16 font-mono text-[10px] uppercase tracking-[0.16em] text-white/75">
        actual recommendations from the app
      </div>
    </div>
  );
}

function SiteVisual() {
  return (
    <div className="grid h-full grid-cols-5 grid-rows-4 gap-2 p-6 sm:p-8" aria-hidden="true">
      <div className="col-span-5 flex items-center justify-between rounded-lg border border-white/[0.12] bg-white/[0.07] px-4 text-[10px] uppercase tracking-[0.15em] text-white/55">
        <span>rohan singh</span><span className="size-1.5 rounded-full bg-[#8dd4a0]" />
      </div>
      <div className="col-span-3 row-span-2 rounded-lg border border-white/[0.12] bg-white/[0.07] p-4">
        <div className="h-2 w-16 rounded bg-white/20" /><div className="mt-3 h-2 w-28 rounded bg-white/10" />
        <div className="mt-6 flex items-end gap-1.5">
          {[35, 58, 45, 78, 68, 90].map((height, index) => <span key={index} className="w-3 rounded-t-sm bg-[#8dd4a0]/70" style={{ height }} />)}
        </div>
      </div>
      <div className="col-span-2 row-span-2 rounded-lg border border-white/[0.12] bg-[#f27655]/75 p-4 text-[#10251b]">
        <span className="font-mono text-3xl font-medium">26.2</span><p className="mt-1 text-xs opacity-65">fitness</p>
      </div>
      <div className="col-span-2 rounded-lg border border-white/[0.12] bg-white/[0.07] p-3"><div className="h-2 w-14 rounded bg-white/15" /><div className="mt-2 h-2 w-20 rounded bg-white/[0.08]" /></div>
      <div className="col-span-3 rounded-lg border border-white/[0.12] bg-white/[0.07] p-3"><div className="h-2 w-20 rounded bg-white/15" /><div className="mt-2 h-2 w-32 rounded bg-white/[0.08]" /></div>
    </div>
  );
}

function MusicVisual() {
  const levels = [28, 52, 76, 45, 88, 62, 38, 70, 48, 82, 55, 34];
  return (
    <div className="flex h-full flex-col justify-between p-6 sm:p-8" aria-hidden="true">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
        <span>listening patterns</span><span>collaborative filtering</span>
      </div>
      <div className="flex h-28 items-center gap-2">
        {levels.map((height, index) => (
          <span key={index} className="flex-1 rounded-full bg-[#d6a5e8]" style={{ height: `${height}%`, opacity: 0.45 + (index % 4) * 0.12 }} />
        ))}
      </div>
      <div className="flex items-center gap-3 border-t border-white/15 pt-4 text-white">
        <span className="grid size-10 place-items-center rounded-full border border-white/20"><span className="size-2 rounded-full bg-[#d6a5e8]" /></span>
        <div><p className="text-sm">patterns over playlists</p><p className="text-xs text-white/45">Python · ML</p></div>
      </div>
    </div>
  );
}

function HealthVisual() {
  return (
    <div className="grid h-full place-items-center p-6 sm:p-8" aria-hidden="true">
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.12] bg-white/[0.07] p-5 text-white">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-white/50"><span>daily movement</span><span>iOS</span></div>
        <div className="my-7 flex items-end justify-between"><strong className="font-mono text-5xl font-medium text-[#f59a80]">42</strong><span className="pb-1 text-xs text-white/45">active min</span></div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10"><span className="block h-full w-3/4 rounded-full bg-[#f59a80]" /></div>
      </div>
    </div>
  );
}

export function ProjectVisual({ visual }: { visual: ProjectMeta["visual"] }) {
  const base = "relative min-h-64 overflow-hidden";
  if (visual === "fitness") return <div className={`${base} bg-[#173c2b]`}><FitnessVisual /></div>;
  if (visual === "ranking") return <div className={`${base} bg-[#17243a]`}><RankingVisual /></div>;
  if (visual === "site") return <div className={`${base} bg-[#261d1a]`}><SiteVisual /></div>;
  if (visual === "music") return <div className={`${base} bg-[#27212f]`}><MusicVisual /></div>;
  return <div className={`${base} bg-[#39251f]`}><HealthVisual /></div>;
}

export default function ProjectFeatureCard({
  project,
  lead = false,
}: {
  project: ProjectMeta;
  lead?: boolean;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`group surface-card grid overflow-hidden transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-lg ${
        lead ? "lg:grid-cols-[1.05fr_.95fr]" : "grid-rows-[auto_1fr]"
      }`}
    >
      <ProjectVisual visual={project.visual} />
      <div className={`flex flex-col ${lead ? "p-7 sm:p-10" : "p-6"}`}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <span className="eyebrow">{project.status === "in-progress" ? "still working on it" : "finished project"}</span>
          <span className="font-mono text-[10px] text-muted">{project.startDate.slice(0, 4)}</span>
        </div>
        <h3 className={`${lead ? "text-3xl sm:text-4xl" : "text-2xl"} font-serif font-semibold leading-tight tracking-tight text-fg transition-colors group-hover:text-accent-dim`}>
          {project.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{project.summary}</p>
        <p className="mt-5 border-l-2 border-warm pl-3 text-sm font-medium leading-relaxed text-fg">
          {project.outcome}
        </p>
        <div className="mt-auto flex items-end justify-between gap-4 pt-7">
          <div className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, lead ? 4 : 3).map((tag) => (
              <span key={tag} className="rounded-full border border-border px-2 py-1 font-mono text-[10px] text-muted">{tag}</span>
            ))}
          </div>
          <span className="shrink-0 text-sm text-accent-dim transition-transform group-hover:translate-x-1">take a look →</span>
        </div>
      </div>
    </Link>
  );
}
