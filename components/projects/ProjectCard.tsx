import Link from "next/link";
import type { ProjectMeta } from "@/lib/types";
import { formatDateRange } from "@/lib/dates";

interface Props {
  project: ProjectMeta;
}

const STATUS_LABEL: Record<ProjectMeta["status"], string> = {
  shipped: "finished",
  "in-progress": "still working on it",
  archived: "older project",
};

export default function ProjectCard({ project }: Props) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group surface-card flex min-h-56 flex-col p-6 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-serif text-xl font-semibold text-fg transition-colors group-hover:text-accent-dim">
          {project.title}
        </h3>
        <span className="text-xs text-muted shrink-0">
          {STATUS_LABEL[project.status]}
        </span>
      </div>

      <p className="mb-5 text-sm leading-relaxed text-muted">{project.summary}</p>

      <div className="mt-auto flex items-end justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-muted border border-border rounded px-1.5 py-0.5 font-mono"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted font-mono shrink-0 whitespace-nowrap">
          {formatDateRange(project.startDate, project.endDate)}
        </p>
      </div>
    </Link>
  );
}
