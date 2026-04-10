"use client";

import { useState } from "react";
import type { StateEntry } from "@/lib/types";

// tile grid layout: [col, row] (0-indexed, 12 cols × 9 rows)
// West coast on left, East coast on right. AK/HI bottom-left.
const GRID: Record<string, [number, number]> = {
  // row 0
  ME: [11, 0],
  // row 1
  VT: [9,  1],  NH: [10, 1],
  // row 2
  WA: [0,  2],  MT: [1,  2],  ND: [2,  2],  MN: [3,  2],
  WI: [4,  2],  MI: [5,  2],
  NY: [8,  2],  MA: [9,  2],  RI: [10, 2],
  // row 3 — WY slots in here (same latitude band as OR/ID/SD)
  OR: [0,  3],  ID: [1,  3],  WY: [2,  3],  SD: [3,  3],
  IA: [4,  3],  IL: [5,  3],  IN: [6,  3],  OH: [7,  3],
  PA: [8,  3],  NJ: [9,  3],  CT: [10, 3],
  // row 4 — UT takes WY's old col; whole east block shifts right so VA is inland
  CA: [0,  4],  NV: [1,  4],  UT: [2,  4],  CO: [3,  4],
  NE: [4,  4],  MO: [5,  4],  KY: [6,  4],  WV: [7,  4],
  VA: [8,  4],  MD: [9,  4],  DE: [10, 4],
  // row 5 — NC directly below VA, SC directly right of NC
  AZ: [1,  5],  NM: [2,  5],  KS: [3,  5],  OK: [4,  5],
  AR: [5,  5],  TN: [6,  5],  NC: [7,  5],  SC: [8,  5],  DC: [9, 5],
  // row 6
  TX: [3,  6],  LA: [4,  6],  MS: [5,  6],  AL: [6,  6],  GA: [8,  6],
  // row 7
  FL: [8,  7],
  // row 8
  AK: [0,  8],  HI: [2,  8],
};

const CELL = 44;
const GAP = 4;
const COLS = 12;
const ROWS = 9;

const W = COLS * CELL + (COLS - 1) * GAP;
const H = ROWS * CELL + (ROWS - 1) * GAP;

function cx(col: number) {
  return col * (CELL + GAP);
}
function cy(row: number) {
  return row * (CELL + GAP);
}

interface Props {
  states: StateEntry[];
}

export default function StatesMap({ states }: Props) {
  const [selected, setSelected] = useState<StateEntry | null>(null);

  const byCode = Object.fromEntries(states.map((s) => [s.code, s]));
  const visitedCount = states.filter((s) => s.visited).length;

  return (
    <div>
      <p className="text-sm text-muted mb-6 font-mono">
        {visitedCount} / {states.length} states + dc
      </p>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          className="max-w-full"
          aria-label="US states map"
        >
          {Object.entries(GRID).map(([code, [col, row]]) => {
            const state = byCode[code];
            const visited = state?.visited ?? false;
            const x = cx(col);
            const y = cy(row);

            return (
              <g
                key={code}
                onClick={() => state && setSelected(state)}
                className="cursor-pointer"
                role="button"
                aria-label={state?.name ?? code}
              >
                <rect
                  x={x}
                  y={y}
                  width={CELL}
                  height={CELL}
                  rx={4}
                  className={
                    visited
                      ? "fill-accent opacity-80 hover:opacity-100 transition-opacity"
                      : "fill-surface hover:fill-border transition-colors"
                  }
                  stroke="var(--border)"
                  strokeWidth={1}
                />
                <text
                  x={x + CELL / 2}
                  y={y + CELL / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-mono select-none pointer-events-none"
                  fontSize={10}
                  fill={visited ? "var(--bg)" : "var(--muted)"}
                >
                  {code}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-bg border border-border rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-serif text-xl">{selected.name}</h2>
                <p className="text-xs font-mono text-muted mt-1">
                  {selected.code}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-muted hover:text-fg transition-colors text-lg leading-none ml-4"
                aria-label="close"
              >
                ×
              </button>
            </div>

            {selected.visited ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent inline-block" />
                  <span className="text-sm text-accent">visited</span>
                </div>
                {selected.visitedDate && (
                  <p className="text-sm text-muted">{selected.visitedDate}</p>
                )}
                {selected.cities && selected.cities.length > 0 && (
                  <p className="text-sm text-muted">
                    {selected.cities.join(", ")}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted">not yet visited</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
