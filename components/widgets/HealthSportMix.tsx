"use client";

import { useState } from "react";
import type { HealthSummary } from "@/lib/types";

interface Props {
  data: HealthSummary;
}

// muted palette -- works on both light and dark backgrounds
const SPORT_COLORS = [
  "#4f7c5a", // sage (matches accent)
  "#c4723e", // amber
  "#8a7040", // dark gold
  "#6b8e8e", // teal-gray
  "#8b6b8b", // muted purple
  "#7b8b6b", // olive
];

// ─── donut helpers ────────────────────────────────────────────────────────────

function toRad(deg: number) {
  return (deg - 90) * (Math.PI / 180);
}

function donutArcPath(
  cx: number, cy: number,
  outerR: number, innerR: number,
  startDeg: number, endDeg: number
): string {
  const cosS = Math.cos(toRad(startDeg)), sinS = Math.sin(toRad(startDeg));
  const cosE = Math.cos(toRad(endDeg)),   sinE = Math.sin(toRad(endDeg));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${cx + outerR * cosS} ${cy + outerR * sinS}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${cx + outerR * cosE} ${cy + outerR * sinE}`,
    `L ${cx + innerR * cosE} ${cy + innerR * sinE}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${cx + innerR * cosS} ${cy + innerR * sinS}`,
    "Z",
  ].join(" ");
}

// ─── SportDonut ───────────────────────────────────────────────────────────────

function SportDonut({ sportMix }: { sportMix: Record<string, number> }) {
  const [hovered, setHovered] = useState<string | null>(null);

  const entries = Object.entries(sportMix).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, n]) => s + n, 0);

  const CX = 70, CY = 70, OR = 58, IR = 36;

  let cursor = 0;
  const segments = entries.map(([sport, count], i) => {
    const deg = (count / total) * 360;
    const startDeg = cursor;
    cursor += deg;
    return { sport, count, startDeg, endDeg: cursor, color: SPORT_COLORS[i % SPORT_COLORS.length] };
  });

  const hoveredEntry = hovered ? entries.find(([s]) => s === hovered) : null;

  return (
    <div>
      <h2 className="text-xs font-medium uppercase tracking-widest text-muted mb-3">
        sport mix · last 90 days
      </h2>
      <div className="flex items-start gap-4 flex-wrap">
        {/* donut */}
        <svg
          width={140}
          height={140}
          className="shrink-0"
          onMouseLeave={() => setHovered(null)}
        >
          {segments.map((seg) => (
            <path
              key={seg.sport}
              d={donutArcPath(CX, CY, OR, IR, seg.startDeg, seg.endDeg)}
              fill={seg.color}
              opacity={hovered && hovered !== seg.sport ? 0.35 : 1}
              onMouseEnter={() => setHovered(seg.sport)}
              style={{ cursor: "default", transition: "opacity 0.1s" }}
            />
          ))}
          {/* center label */}
          <text x={CX} y={CY - 6} textAnchor="middle" fontSize={18}
            fontFamily="var(--font-geist-sans)" fontWeight={600} fill="var(--fg)">
            {hoveredEntry ? hoveredEntry[1] : total}
          </text>
          <text x={CX} y={CY + 10} textAnchor="middle" fontSize={9}
            fontFamily="var(--font-geist-sans)" fill="var(--muted)">
            {hoveredEntry ? "workouts" : "total"}
          </text>
        </svg>

        {/* legend */}
        <ul className="space-y-1.5 pt-1">
          {segments.map((seg) => (
            <li
              key={seg.sport}
              className="flex items-center gap-2 cursor-default"
              onMouseEnter={() => setHovered(seg.sport)}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: seg.color,
                  opacity: hovered && hovered !== seg.sport ? 0.35 : 1 }}
              />
              <span className={`text-xs ${hovered === seg.sport ? "text-fg" : "text-muted"}`}>
                {seg.sport.toLowerCase()}
              </span>
              <span className="text-xs font-mono text-muted">{seg.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── WeeklyBars ───────────────────────────────────────────────────────────────

function WeeklyBars({ bars }: { bars: number[] }) {
  const BAR_W = 28;
  const BAR_GAP = 10;
  const CHART_H = 72;
  const LABEL_H = 16;
  const SVG_H = CHART_H + LABEL_H;
  const SVG_W = bars.length * (BAR_W + BAR_GAP) - BAR_GAP;
  const maxVal = Math.max(...bars, 1);

  return (
    <div>
      <h2 className="text-xs font-medium uppercase tracking-widest text-muted mb-3">
        this month by week
      </h2>
      <svg width={SVG_W} height={SVG_H} style={{ display: "block" }}>
        {bars.map((count, i) => {
          const barH = Math.max(2, (count / maxVal) * (CHART_H - 18));
          const x = i * (BAR_W + BAR_GAP);
          const y = CHART_H - barH;
          return (
            <g key={i}>
              <rect
                x={x} y={y}
                width={BAR_W} height={barH}
                rx={3}
                fill="var(--accent)"
                opacity={0.85}
              />
              {/* count above bar */}
              <text
                x={x + BAR_W / 2} y={y - 4}
                textAnchor="middle"
                fontSize={9}
                fill="var(--muted)"
                fontFamily="var(--font-geist-sans)"
              >
                {count}
              </text>
              {/* week label below */}
              <text
                x={x + BAR_W / 2} y={CHART_H + LABEL_H - 2}
                textAnchor="middle"
                fontSize={9}
                fill="var(--muted)"
                fontFamily="var(--font-geist-sans)"
              >
                {`w${i + 1}`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── HealthSportMix ───────────────────────────────────────────────────────────

export default function HealthSportMix({ data }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
      <SportDonut sportMix={data.sportMix90d} />
      <WeeklyBars bars={data.thisMonth.weeklyBars} />
    </div>
  );
}
