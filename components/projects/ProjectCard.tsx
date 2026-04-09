import Link from "next/link";
import type { ProjectMeta } from "@/lib/types";
import { formatDateRange } from "@/lib/dates";

interface Props {
  project: ProjectMeta;
}

const STATUS_LABEL: Record<ProjectMeta["status"], string> = {
  shipped: "shipped",
  "in-progress": "in progress",
  archived: "archived",
};

export default function ProjectCard({ project }: Props) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block border border-border rounded-lg p-4 bg-surface
                 hover:border-accent transition-colors duration-150"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-medium text-fg group-hover:text-accent transition-colors">
          {project.title}
        </h3>
        <span className="text-xs text-muted shrink-0">
          {STATUS_LABEL[project.status]}
        </span>
      </div>

      <p className="text-xs text-muted mb-3 leading-relaxed">{project.tagline}</p>

      <div className="flex items-end justify-between gap-2">
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
