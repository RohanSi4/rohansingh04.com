"use client";

import { useState } from "react";
import type { HealthSummary } from "@/lib/types";

interface Props {
  heatmap: HealthSummary["heatmap"];
}

const CELL = 12;
const GAP = 2;
const UNIT = CELL + GAP;
const LEFT = 28;  // width reserved for day-of-week labels
const TOP = 20;   // height reserved for month labels

const DOW_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const MONTH_NAMES = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

type TooltipState = {
  svgX: number;
  svgY: number;
  entry: HealthSummary["heatmap"][number];
};

export default function HealthHeatmap({ heatmap }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  if (!heatmap || heatmap.length === 0) return null;

  // heatmap[0] = oldest day. figure out which day-of-week it starts on
  // so we can offset the grid correctly (same layout as GitHub's heatmap)
  const firstDate = new Date(heatmap[0].date + "T12:00:00Z");
  const startDow = firstDate.getUTCDay(); // 0=Sun

  const totalSlots = startDow + heatmap.length;
  const numCols = Math.ceil(totalSlots / 7);

  // month label: first column where a new month starts
  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;
  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < 7; row++) {
      const di = col * 7 + row - startDow;
      if (di >= 0 && di < heatmap.length) {
        const m = new Date(heatmap[di].date + "T12:00:00Z").getUTCMonth();
        if (m !== lastMonth) {
          lastMonth = m;
          monthLabels.push({ col, label: MONTH_NAMES[m] });
        }
        break;
      }
    }
  }

  const svgW = LEFT + numCols * UNIT;
  const svgH = TOP + 7 * UNIT;

  return (
    <div className="mb-8">
      <h2 className="text-xs font-medium uppercase tracking-widest text-muted mb-3">
        activity
      </h2>
      {/* overflow-x-auto so it scrolls on mobile without breaking layout */}
      <div className="relative overflow-x-auto">
        <svg
          width={svgW}
          height={svgH}
          style={{ display: "block" }}
          onMouseLeave={() => setTooltip(null)}
        >
          {/* day-of-week labels */}
          {DOW_LABELS.map((label, row) =>
            label ? (
              <text
                key={row}
                x={0}
                y={TOP + row * UNIT + CELL * 0.8}
                fontSize={9}
                fill="var(--muted)"
                fontFamily="var(--font-geist-sans)"
              >
                {label}
              </text>
            ) : null
          )}

          {/* month labels */}
          {monthLabels.map(({ col, label }) => (
            <text
              key={`m${col}`}
              x={LEFT + col * UNIT}
              y={TOP - 5}
              fontSize={9}
              fill="var(--muted)"
              fontFamily="var(--font-geist-sans)"
            >
              {label}
            </text>
          ))}

          {/* cells */}
          {heatmap.map((entry, di) => {
            const slot = startDow + di;
            const col = Math.floor(slot / 7);
            const row = slot % 7;
            const x = LEFT + col * UNIT;
            const y = TOP + row * UNIT;

            return (
              <rect
                key={entry.date}
                x={x}
                y={y}
                width={CELL}
                height={CELL}
                rx={2}
                fill={`var(--heat-${entry.intensity})`}
                onMouseEnter={() =>
                  setTooltip({ svgX: x, svgY: y, entry })
                }
                style={{ cursor: "default" }}
              />
            );
          })}
        </svg>

        {/* tooltip -- positioned relative to the scrollable container */}
        {tooltip && (
          <div
            className="absolute pointer-events-none z-20 px-2 py-1.5 rounded text-xs
                        bg-surface border border-border text-fg shadow-sm"
            style={{
              left: tooltip.svgX + CELL + 4,
              top: tooltip.svgY - 4,
              whiteSpace: "nowrap",
            }}
          >
            <p className="font-mono">{tooltip.entry.date}</p>
            <p className="text-muted">
              {tooltip.entry.intensity === 0
                ? "rest"
                : `${tooltip.entry.exerciseMinutes} min active`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
