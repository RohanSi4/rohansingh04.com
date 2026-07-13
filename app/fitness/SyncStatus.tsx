import { fitnessTimeZone, formatRunDate } from "@/lib/running";
import styles from "./fitness.module.css";

type SyncStatusProps = {
  generatedAt: string;
};

export function SyncStatus({ generatedAt }: SyncStatusProps) {
  const syncedAt = new Date(generatedAt);
  const ageHours = (Date.now() - syncedAt.getTime()) / 3_600_000;
  const valid = Number.isFinite(ageHours);
  const tone = valid && ageHours <= 8 ? "fresh" : valid && ageHours <= 30 ? "recent" : "delayed";
  const label = !valid
    ? "sync unavailable"
    : ageHours <= 8
      ? "synced recently"
      : ageHours <= 30
        ? "synced yesterday"
        : `last synced ${formatRunDate(generatedAt.slice(0, 10))}`;
  const exact = valid
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: fitnessTimeZone(syncedAt),
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(syncedAt)
    : "Sync time unavailable";

  return (
    <span className={`${styles.syncStatus} ${styles[`syncStatus_${tone}`]}`} title={exact}>
      <i aria-hidden="true" />
      {label}
    </span>
  );
}
