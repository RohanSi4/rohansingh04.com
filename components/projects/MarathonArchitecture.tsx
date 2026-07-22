interface MarathonArchitectureProps {
  totalActivities: number;
  runMiles: number;
  trackedSince: string;
}

const steps = [
  {
    label: "record",
    title: "Watch and heart-rate strap",
    text: "Capture the workout and the full sensor stream.",
    scope: "private",
  },
  {
    label: "log",
    title: "Today on iPhone",
    text: "Captures weight, exercises, sets, reps, and load without slowing down the workout.",
    scope: "private",
  },
  {
    label: "export",
    title: "HealthFit",
    text: "Moves each workout into a FIT file in iCloud.",
    scope: "private",
  },
  {
    label: "understand",
    title: "TypeScript pipeline",
    text: "Decrypts Today, cleans HealthFit duplicates, and joins the two histories.",
    scope: "private",
  },
  {
    label: "plan",
    title: "Private coach",
    text: "Uses the full archive to shape and check the week.",
    scope: "private",
  },
  {
    label: "share",
    title: "Fitness page",
    text: "Publishes only the progress that is safe to show.",
    scope: "public",
  },
] as const;

export default function MarathonArchitecture({
  totalActivities,
  runMiles,
  trackedSince,
}: MarathonArchitectureProps) {
  const activityFloor = Math.floor(totalActivities / 100) * 100;
  const mileFloor = Math.floor(runMiles / 50) * 50;
  const firstYear = trackedSince.slice(0, 4);

  return (
    <section className="site-container pt-10 sm:pt-14" aria-labelledby="marathon-flow-title">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface/45">
        <header className="grid gap-5 border-b border-border p-6 sm:p-8 lg:grid-cols-[1fr_.72fr] lg:items-end">
          <div>
            <p className="eyebrow mb-3">how it moves</p>
            <h2 id="marathon-flow-title" className="font-serif text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
              From a workout to a useful week.
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-muted sm:text-base">
            Today encrypts its private snapshot before upload. The public page gets a
            smaller version with the progress I actually want to share.
          </p>
        </header>

        <ol className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-6" aria-label="Marathon Prep Bot data flow">
          {steps.map((step, index) => (
            <li key={step.title} className="relative bg-bg p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-dim">
                  {String(index + 1).padStart(2, "0")} · {step.label}
                </span>
                <span className={`rounded-full px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] ${
                  step.scope === "public"
                    ? "bg-accent/15 text-accent-dim"
                    : "bg-surface text-muted"
                }`}>
                  {step.scope}
                </span>
              </div>
              <h3 className="mt-5 text-sm font-semibold leading-snug text-fg">{step.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">{step.text}</p>
              {index < steps.length - 1 && (
                <span className="mt-4 block text-sm text-border-strong md:absolute md:-right-1.5 md:top-1/2 md:z-10 md:mt-0 md:-translate-y-1/2" aria-hidden="true">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>

        <div className="grid border-t border-border lg:grid-cols-[1fr_.72fr]">
          <dl className="grid grid-cols-3 divide-x divide-border border-b border-border lg:border-b-0">
            <div className="p-5 sm:p-6">
              <dt className="text-[11px] leading-snug text-muted">workouts processed</dt>
              <dd className="mt-2 font-mono text-xl font-medium text-fg sm:text-2xl">
                {activityFloor.toLocaleString()}+
              </dd>
            </div>
            <div className="p-5 sm:p-6">
              <dt className="text-[11px] leading-snug text-muted">running miles</dt>
              <dd className="mt-2 font-mono text-xl font-medium text-fg sm:text-2xl">
                {mileFloor}+
              </dd>
            </div>
            <div className="p-5 sm:p-6">
              <dt className="text-[11px] leading-snug text-muted">history since</dt>
              <dd className="mt-2 font-mono text-xl font-medium text-fg sm:text-2xl">
                {firstYear}
              </dd>
            </div>
          </dl>
          <aside className="bg-[#173c2b] p-6 text-white sm:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/65">the privacy line</p>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              AES-256-GCM protects weight and lifting detail in transit and storage.
              GPS coordinates, source files, and health notes never reach the public snapshot.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
