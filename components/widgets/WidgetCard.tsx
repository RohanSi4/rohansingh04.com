import Skeleton from "@/components/primitives/Skeleton";

export type WidgetState = "loading" | "empty" | "error" | "ready";

interface WidgetCardProps {
  /** optional section label above the content */
  title?: string;
  state: WidgetState;
  /** shown when state === "error". keep it playful, not scary */
  errorMessage?: string;
  /** shown when state === "empty" */
  emptyMessage?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Wrapper for every live widget on the site. Handles loading, empty, and
 * error states uniformly so each state looks intentional, not like a bug.
 *
 * Usage:
 *   <WidgetCard
 *     title="now playing"
 *     state={state}
 *     errorMessage="spotify's taking a nap"
 *     emptyMessage="not listening to anything right now"
 *   >
 *     <SpotifyContent />
 *   </WidgetCard>
 */
export default function WidgetCard({
  title,
  state,
  errorMessage = "something went wrong",
  emptyMessage = "nothing here yet",
  children,
  className = "",
}: WidgetCardProps) {
  return (
    <div className={`py-4 ${className}`}>
      {title && (
        <h2 className="text-xs font-medium uppercase tracking-widest text-muted mb-3">
          {title}
        </h2>
      )}

      {state === "loading" && (
        <Skeleton />
      )}

      {state === "empty" && (
        <p className="text-sm text-muted">{emptyMessage}</p>
      )}

      {state === "error" && (
        <p className="text-sm text-muted italic">{errorMessage}</p>
      )}

      {state === "ready" && children}
    </div>
  );
}
