"use client";

import { useEffect, useState } from "react";
import WidgetCard, { type WidgetState } from "./WidgetCard";

type SpotifyData = {
  isPlaying: boolean;
  title: string;
  artist: string;
  albumArt: string | null;
  trackUrl: string | null;
};

export default function SpotifyNowPlaying() {
  const [state, setState] = useState<WidgetState>("loading");
  const [data, setData] = useState<SpotifyData | null>(null);

  useEffect(() => {
    let active = true;

    async function refresh() {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/spotify");
        if (!active) return;
        if (!res.ok) {
          setState("error");
          return;
        }
        const json = await res.json() as SpotifyData;
        if (!active) return;
        setData(json);
        setState(json.isPlaying || json.title ? "ready" : "empty");
      } catch {
        if (active) setState("error");
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") void refresh();
    }

    void refresh();
    const id = window.setInterval(() => void refresh(), 30_000);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      active = false;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <WidgetCard
      title="now playing"
      state={state}
      errorMessage="spotify's taking a nap"
      emptyMessage="not listening to anything right now"
    >
      {data && (
        <div className="flex items-center gap-3">
          {data.albumArt && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.albumArt}
              alt={`${data.title} album art`}
              className="w-10 h-10 rounded object-cover shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-fg truncate">
              {data.trackUrl ? (
                <a
                  href={data.trackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  {data.title}
                </a>
              ) : (
                data.title
              )}
            </p>
            <p className="text-xs text-muted truncate">{data.artist}</p>
          </div>
          {data.isPlaying && (
            <span className="shrink-0 text-accent text-xs font-mono">live</span>
          )}
        </div>
      )}
    </WidgetCard>
  );
}
