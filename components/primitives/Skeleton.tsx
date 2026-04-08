interface SkeletonProps {
  className?: string;
}

/** Single skeleton line. Compose multiples for block layouts. */
export function SkeletonLine({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`h-4 rounded bg-surface animate-pulse ${className}`}
      aria-hidden
    />
  );
}

/** Skeleton block -- fills its container. Use for card-shaped placeholders. */
export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`} aria-hidden>
      <SkeletonLine className="w-2/3" />
      <SkeletonLine className="w-full" />
      <SkeletonLine className="w-5/6" />
    </div>
  );
}
