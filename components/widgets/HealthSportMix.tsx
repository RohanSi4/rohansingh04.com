"use client";

import type { HealthSummary } from "@/lib/types";

interface Props {
  data: HealthSummary;
}

function WeeklyMinutesBars({ bars }: { bars: number[] }) {
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
        {bars.map((mins, i) => {
          const barH = Math.max(2, (mins / maxVal) * (CHART_H - 18));
          const x = i * (BAR_W + BAR_GAP);
          const y = CHART_H - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={BAR_W} height={barH} rx={3} fill="var(--accent)" opacity={0.85} />
              <text x={x + BAR_W / 2} y={y - 4} textAnchor="middle" fontSize={9} fill="var(--muted)" fontFamily="var(--font-geist-sans)">
                {mins > 0 ? `${mins}m` : ""}
              </text>
              <text x={x + BAR_W / 2} y={CHART_H + LABEL_H - 2} textAnchor="middle" fontSize={9} fill="var(--muted)" fontFamily="var(--font-geist-sans)">
                {`w${i + 1}`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function HealthSportMix({ data }: Props) {
  const { thisMonth } = data;
  return (
    <div className="mb-8">
      <WeeklyMinutesBars bars={thisMonth.weeklyMinutes} />
    </div>
  );
}
