"use client";

import { useEffect, useState } from "react";
import WidgetCard, { type WidgetState } from "./WidgetCard";
import { relativeTime } from "@/lib/dates";

type CommitData = {
  repo: string;
  message: string;
  url: string;
  timestamp: string;
};

export default function GithubLatestCommit() {
  const [state, setState] = useState<WidgetState>("loading");
  const [data, setData] = useState<CommitData | null>(null);

  useEffect(() => {
    fetch("/api/github")
      .then((res) => {
        if (!res.ok) { setState("error"); return null; }
        return res.json() as Promise<CommitData>;
      })
      .then((json) => {
        if (!json) return;
        setData(json);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);

  return (
    <WidgetCard
      title="latest commit"
      state={state}
      errorMessage="github is being shy"
      emptyMessage="no recent commits"
    >
      {data && (
        <div className="min-w-0">
          <p className="text-xs text-muted font-mono mb-1">{data.repo}</p>
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-fg hover:text-accent transition-colors line-clamp-2"
          >
            {data.message}
          </a>
          <p className="text-xs text-muted font-mono mt-1">
            {relativeTime(data.timestamp)}
          </p>
        </div>
      )}
    </WidgetCard>
  );
}
