"use client";

import { useState } from "react";
import type { StateEntry } from "@/lib/types";
import PhotoUpload from "@/components/admin/PhotoUpload";

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

function cx(col: number) { return col * (CELL + GAP); }
function cy(row: number) { return row * (CELL + GAP); }

interface Props {
  states: StateEntry[];
  isAdmin: boolean;
}

export default function StatesMap({ states: initialStates, isAdmin }: Props) {
  const [states, setStates] = useState<StateEntry[]>(initialStates);
  const [selected, setSelected] = useState<StateEntry | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<StateEntry | null>(null);
  const [saving, setSaving] = useState(false);

  const byCode = Object.fromEntries(states.map((s) => [s.code, s]));
  const visitedCount = states.filter((s) => s.visited).length;

  function openEdit(state: StateEntry) {
    setEditForm({ ...state });
    setEditing(true);
  }

  function setField(field: string, value: unknown) {
    setEditForm((f) => f ? { ...f, [field]: value } : f);
  }

  async function saveEdit() {
    if (!editForm) return;
    setSaving(true);
    const res = await fetch(`/api/admin/states/${editForm.code}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      const updated: StateEntry = await res.json();
      setStates((ss) => ss.map((s) => s.code === updated.code ? updated : s));
      setSelected(updated);
      setEditing(false);
    }
    setSaving(false);
  }

  function removePhoto(url: string) {
    setEditForm((f) => f ? { ...f, photos: (f.photos ?? []).filter((p) => p !== url) } : f);
  }

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
                  x={x} y={y} width={CELL} height={CELL} rx={4}
                  className={
                    visited
                      ? "fill-accent opacity-80 hover:opacity-100 transition-opacity"
                      : "fill-surface hover:fill-border transition-colors"
                  }
                  stroke="var(--border)"
                  strokeWidth={1}
                />
                <text
                  x={x + CELL / 2} y={y + CELL / 2 + 1}
                  textAnchor="middle" dominantBaseline="middle"
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
          onClick={() => { setSelected(null); setEditing(false); }}
        >
          <div
            className="bg-bg border border-border rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-serif text-xl">{selected.name}</h2>
                <p className="text-xs font-mono text-muted mt-1">{selected.code}</p>
              </div>
              <button
                onClick={() => { setSelected(null); setEditing(false); }}
                className="text-muted hover:text-fg transition-colors text-lg leading-none ml-4"
                aria-label="close"
              >×</button>
            </div>

            {!editing ? (
              <>
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
                      <p className="text-sm text-muted">{selected.cities.join(", ")}</p>
                    )}
                    {selected.notes && (
                      <p className="text-sm text-muted">{selected.notes}</p>
                    )}
                    {selected.photos && selected.photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-1 mt-2">
                        {selected.photos.map((url) => (
                          <img key={url} src={url} alt="" className="w-full aspect-square object-cover rounded" />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted">not yet visited</p>
                )}
                {isAdmin && (
                  <button
                    onClick={() => openEdit(selected)}
                    className="mt-4 w-full text-xs font-mono text-muted hover:text-fg border border-border hover:border-fg/30 rounded py-1.5 transition-colors"
                  >
                    edit
                  </button>
                )}
              </>
            ) : editForm && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-mono text-muted">visited</label>
                  <button
                    onClick={() => setField("visited", !editForm.visited)}
                    className={`w-10 h-5 rounded-full transition-colors ${editForm.visited ? "bg-accent" : "bg-surface border border-border"}`}
                  >
                    <span className={`block w-4 h-4 rounded-full bg-white mx-auto transition-transform ${editForm.visited ? "translate-x-2.5" : "-translate-x-2.5"}`} />
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-muted uppercase">visited date</label>
                  <input
                    value={editForm.visitedDate ?? ""}
                    onChange={(e) => setField("visitedDate", e.target.value)}
                    placeholder="YYYY-MM"
                    className="w-full bg-surface border border-border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-accent mt-0.5"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-muted uppercase">cities (comma separated)</label>
                  <input
                    value={(editForm.cities ?? []).join(", ")}
                    onChange={(e) => setField("cities", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                    className="w-full bg-surface border border-border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-accent mt-0.5"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-muted uppercase">notes</label>
                  <input
                    value={editForm.notes ?? ""}
                    onChange={(e) => setField("notes", e.target.value)}
                    className="w-full bg-surface border border-border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-accent mt-0.5"
                  />
                </div>

                {(editForm.photos ?? []).length > 0 && (
                  <div>
                    <label className="text-[10px] font-mono text-muted uppercase">photos</label>
                    <div className="grid grid-cols-3 gap-1 mt-1">
                      {(editForm.photos ?? []).map((url) => (
                        <div key={url} className="relative group">
                          <img src={url} alt="" className="w-full aspect-square object-cover rounded" />
                          <button
                            onClick={() => removePhoto(url)}
                            className="absolute inset-0 bg-black/60 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center"
                          >×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <PhotoUpload
                  folder={`states/${editForm.code.toLowerCase()}`}
                  onUploaded={(url) => setField("photos", [...(editForm.photos ?? []), url])}
                />

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="flex-1 bg-accent text-bg text-xs font-mono py-1.5 rounded hover:opacity-90 disabled:opacity-40"
                  >
                    {saving ? "saving..." : "save"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-3 text-muted border border-border text-xs font-mono py-1.5 rounded hover:border-fg/30"
                  >
                    cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
