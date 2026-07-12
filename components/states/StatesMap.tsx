"use client";

import { useEffect, useRef, useState } from "react";
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

type ArrowKey = "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown";

function nextStateCode(code: string, key: ArrowKey): string | null {
  const current = GRID[code];
  if (!current) return null;
  const [col, row] = current;
  const candidates = Object.entries(GRID).filter(([, [candidateCol, candidateRow]]) => {
    if (key === "ArrowLeft") return candidateCol < col;
    if (key === "ArrowRight") return candidateCol > col;
    if (key === "ArrowUp") return candidateRow < row;
    return candidateRow > row;
  });

  candidates.sort(([, [aCol, aRow]], [, [bCol, bRow]]) => {
    const aPrimary = key === "ArrowLeft" || key === "ArrowRight" ? Math.abs(aCol - col) : Math.abs(aRow - row);
    const bPrimary = key === "ArrowLeft" || key === "ArrowRight" ? Math.abs(bCol - col) : Math.abs(bRow - row);
    const aCross = key === "ArrowLeft" || key === "ArrowRight" ? Math.abs(aRow - row) : Math.abs(aCol - col);
    const bCross = key === "ArrowLeft" || key === "ArrowRight" ? Math.abs(bRow - row) : Math.abs(bCol - col);
    return aPrimary - bPrimary || aCross - bCross;
  });

  return candidates[0]?.[0] ?? null;
}

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
  const [focusedCode, setFocusedCode] = useState("ME");
  const [visibleFocus, setVisibleFocus] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const byCode = Object.fromEntries(states.map((s) => [s.code, s]));
  const visitedCount = states.filter((s) => s.visited).length;

  function selectState(state: StateEntry) {
    setSelected(state);
    setEditing(false);
  }

  function closeModal() {
    const code = selected?.code;
    setSelected(null);
    setEditing(false);
    if (code) requestAnimationFrame(() => document.getElementById(`state-tile-${code}`)?.focus());
  }

  function focusTile(code: string) {
    setFocusedCode(code);
    requestAnimationFrame(() => document.getElementById(`state-tile-${code}`)?.focus());
  }

  function handleTileKeyDown(event: React.KeyboardEvent<SVGGElement>, state: StateEntry) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectState(state);
      return;
    }
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const next = nextStateCode(state.code, event.key as ArrowKey);
    if (next) focusTile(next);
  }

  useEffect(() => {
    if (!selected) return;
    closeButtonRef.current?.focus();
  }, [selected?.code]);

  useEffect(() => {
    if (!selected) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (editing) setEditing(false);
      else closeModal();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [editing, selected]);

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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-lg text-fg">{visitedCount} of {states.length}</p>
          <p id="states-map-description" className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
            Select a tile for trip details. Keyboard users can move between states with the arrow keys, then press Enter.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-muted" aria-label="Map legend">
          <span className="inline-flex items-center gap-2"><i className="size-3 rounded-sm bg-accent" aria-hidden="true" />visited</span>
          <span className="inline-flex items-center gap-2"><i className="size-3 rounded-sm border border-border bg-bg" aria-hidden="true" />still to go</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2" role="region" aria-label="Scrollable states map" tabIndex={0}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          className="max-w-none"
          role="group"
          aria-label="Interactive US states tile map"
          aria-describedby="states-map-description"
        >
          {Object.entries(GRID).map(([code, [col, row]]) => {
            const state = byCode[code];
            const visited = state?.visited ?? false;
            const x = cx(col);
            const y = cy(row);

            return (
              <g
                key={code}
                id={`state-tile-${code}`}
                onClick={() => state && selectState(state)}
                onKeyDown={(event) => state && handleTileKeyDown(event, state)}
                onFocus={() => { setFocusedCode(code); setVisibleFocus(code); }}
                onBlur={() => setVisibleFocus(null)}
                className="cursor-pointer"
                role="button"
                tabIndex={focusedCode === code ? 0 : -1}
                aria-haspopup="dialog"
                aria-label={`${state?.name ?? code}: ${visited ? "visited" : "not yet visited"}`}
              >
                <rect
                  x={x} y={y} width={CELL} height={CELL} rx={4}
                  className={
                    visited
                      ? "fill-accent opacity-80 hover:opacity-100 transition-opacity"
                      : "fill-surface hover:fill-border transition-colors"
                  }
                  stroke={visibleFocus === code ? "var(--accent)" : "var(--border)"}
                  strokeWidth={visibleFocus === code ? 3 : 1}
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={(event) => { if (event.currentTarget === event.target) closeModal(); }}
          role="presentation"
        >
          <div
            className="max-h-[90svh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-border bg-bg p-6 shadow-2xl sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="selected-state-title"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 id="selected-state-title" className="font-serif text-2xl font-semibold">{selected.name}</h2>
                <p className="text-xs font-mono text-muted mt-1">{selected.code}</p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeModal}
                className="ml-4 flex size-11 items-center justify-center rounded-full text-lg leading-none text-muted transition-colors hover:bg-surface hover:text-fg"
                aria-label={`Close details for ${selected.name}`}
              >×</button>
            </div>

            {!editing ? (
              <>
                {selected.visited ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-block size-2 rounded-full bg-accent" aria-hidden="true" />
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
                          <img key={url} src={url} alt={`Photo from ${selected.name}`} className="w-full aspect-square object-cover rounded" />
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
                    className="mt-4 min-h-11 w-full rounded border border-border py-1.5 font-mono text-xs text-muted transition-colors hover:border-fg/30 hover:text-fg"
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
                    type="button"
                    role="switch"
                    aria-checked={editForm.visited}
                    aria-label={`${editForm.visited ? "Mark" : "Keep"} ${editForm.name} as ${editForm.visited ? "not visited" : "visited"}`}
                    onClick={() => setField("visited", !editForm.visited)}
                    className={`flex h-7 w-12 items-center rounded-full transition-colors ${editForm.visited ? "bg-accent" : "border border-border bg-surface"}`}
                  >
                    <span className={`block size-5 rounded-full bg-white shadow transition-transform ${editForm.visited ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                <div>
                  <label htmlFor="state-visited-date" className="text-[10px] font-mono text-muted uppercase">visited date</label>
                  <input
                    id="state-visited-date"
                    value={editForm.visitedDate ?? ""}
                    onChange={(e) => setField("visitedDate", e.target.value)}
                    placeholder="YYYY-MM"
                    className="w-full bg-surface border border-border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-accent mt-0.5"
                  />
                </div>

                <div>
                  <label htmlFor="state-cities" className="text-[10px] font-mono text-muted uppercase">cities (comma separated)</label>
                  <input
                    id="state-cities"
                    value={(editForm.cities ?? []).join(", ")}
                    onChange={(e) => setField("cities", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                    className="w-full bg-surface border border-border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-accent mt-0.5"
                  />
                </div>

                <div>
                  <label htmlFor="state-notes" className="text-[10px] font-mono text-muted uppercase">notes</label>
                  <input
                    id="state-notes"
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
                          <img src={url} alt={`Photo from ${editForm.name}`} className="w-full aspect-square object-cover rounded" />
                          <button
                            type="button"
                            onClick={() => removePhoto(url)}
                            aria-label={`Remove photo from ${editForm.name}`}
                            className="absolute inset-0 flex items-center justify-center rounded bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
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
                    className="min-h-11 flex-1 rounded bg-accent py-1.5 font-mono text-xs text-bg hover:opacity-90 disabled:opacity-40"
                  >
                    {saving ? "saving..." : "save"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="min-h-11 rounded border border-border px-3 py-1.5 font-mono text-xs text-muted hover:border-fg/30"
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
