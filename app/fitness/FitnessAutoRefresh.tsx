"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function FitnessAutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => router.refresh();
    const interval = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    // Returning to a backgrounded tab fires visibilitychange, not focus, and the
    // 60s timer is throttled while hidden — so refresh the moment the tab is shown
    // again. Without this, a tab left open overnight renders a stale "today".
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  return null;
}
