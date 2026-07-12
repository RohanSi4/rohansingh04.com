"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { latLngToXyz } from "@/lib/geo";
import type { Place } from "@/lib/types";
import PhotoUpload from "@/components/admin/PhotoUpload";

const GLOBE_R = 1.5;
const PIN_R = 0.022;
const PIN_OFFSET = 0.04;

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

function formatVisitedDate(value: string) {
  const [year, month] = value.split("-").map(Number);
  if (!year) return value;
  if (!month) return String(year);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

// --- Earth sphere ---
function Earth() {
  const texture = useTexture("/textures/earth_day.jpg");
  return (
    <mesh>
      <sphereGeometry args={[GLOBE_R, 64, 64]} />
      <meshStandardMaterial map={texture} roughness={0.7} metalness={0.05} />
    </mesh>
  );
}

// --- Atmosphere glow ---
function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[GLOBE_R * 1.03, 64, 64]} />
      <meshStandardMaterial
        color="#4a9eff"
        transparent
        opacity={0.06}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// --- Location pin ---
function Pin({
  place,
  onHover,
  onClick,
  isActive,
}: {
  place: Place;
  onHover: (p: Place | null) => void;
  onClick: (p: Place) => void;
  isActive: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const mesh = useRef<THREE.Mesh>(null);

  const [x, y, z] = latLngToXyz(place.lat, place.lng, GLOBE_R + PIN_OFFSET);

  const normal = new THREE.Vector3(x, y, z).normalize();
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

  const color = isActive ? "#ffffff" : hovered ? "#a8d5b5" : "#6baa7a";

  return (
    <mesh
      ref={mesh}
      position={[x, y, z]}
      quaternion={quaternion}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover(place);
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(place);
      }}
    >
      <sphereGeometry args={[hovered || isActive ? PIN_R * 1.5 : PIN_R, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
    </mesh>
  );
}

// --- Auto-rotating group ---
function AutoRotate({ children, paused }: { children: React.ReactNode; paused: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!paused && group.current) group.current.rotation.y += delta * 0.12;
  });
  return <group ref={group}>{children}</group>;
}

// --- Cursor style effect ---
function CursorStyle({ hovered }: { hovered: boolean }) {
  const { gl } = useThree();
  gl.domElement.style.cursor = hovered ? "pointer" : "grab";
  return null;
}

// --- Admin edit panel ---
function AdminEditPanel({
  place,
  onClose,
  onSaved,
  onDeleted,
}: {
  place: Place;
  onClose: () => void;
  onSaved: (p: Place) => void;
  onDeleted: (id: string) => void;
}) {
  const [form, setForm] = useState({ ...place });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState("");

  function set(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function save() {
    setSaving(true);
    setSaveError("");
    const res = await fetch(`/api/admin/places/${place.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) onSaved(await res.json());
    else setSaveError(`save failed (${res.status})`);
    setSaving(false);
  }

  async function del() {
    if (!confirm(`delete ${place.name}?`)) return;
    setDeleting(true);
    await fetch(`/api/admin/places/${place.id}`, { method: "DELETE" });
    onDeleted(place.id);
  }

  function removePhoto(url: string) {
    set("photos", form.photos.filter((p) => p !== url));
  }

  return (
    <div className="absolute inset-x-3 bottom-3 z-20 max-h-[85%] overflow-y-auto rounded-xl border border-white/20 bg-black/95 p-4 text-white shadow-2xl sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-4 sm:w-72">
      <div className="flex justify-between items-center mb-3">
        <p className="text-xs font-mono text-white/50 uppercase tracking-widest">edit pin</p>
        <button type="button" onClick={onClose} className="flex size-11 items-center justify-center rounded-full text-lg leading-none text-white/60 hover:bg-white/10 hover:text-white" aria-label={`Close editor for ${place.name}`}>×</button>
      </div>

      <div className="space-y-2">
        {(["name", "country", "notes", "visitedDate"] as const).map((f) => (
          <div key={f}>
            <label className="text-[10px] font-mono text-white/40 uppercase">{f}</label>
            <input
              value={(form[f] as string) ?? ""}
              onChange={(e) => set(f, e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-accent mt-0.5"
            />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-2">
          {(["lat", "lng"] as const).map((f) => (
            <div key={f}>
              <label className="text-[10px] font-mono text-white/40 uppercase">{f}</label>
              <input
                type="number"
                step="0.0001"
                value={form[f]}
                onChange={(e) => set(f, parseFloat(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-accent mt-0.5"
              />
            </div>
          ))}
        </div>

        {/* existing photos */}
        {form.photos.length > 0 && (
          <div>
            <label className="text-[10px] font-mono text-white/40 uppercase">photos</label>
            <div className="grid grid-cols-3 gap-1 mt-1">
              {form.photos.map((url) => (
                <div key={url} className="relative group">
                  <img src={url} alt={`Photo from ${place.name}`} className="w-full aspect-square object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removePhoto(url)}
                    aria-label={`Remove photo from ${place.name}`}
                    className="absolute inset-0 flex items-center justify-center rounded bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <PhotoUpload
          folder={`places/${place.id}`}
          onUploaded={(url) => set("photos", [...form.photos, url])}
        />

        {saveError && <p className="text-xs text-red-400 font-mono">{saveError}</p>}

        <div className="flex gap-2 pt-1">
          <button
            onClick={save}
            disabled={saving}
            className="min-h-11 flex-1 rounded bg-accent px-3 py-1.5 font-mono text-xs text-bg hover:opacity-90 disabled:opacity-40"
          >
            {saving ? "saving..." : "save"}
          </button>
          <button
            onClick={del}
            disabled={deleting}
            className="min-h-11 rounded border border-red-400/30 px-3 py-1.5 font-mono text-xs text-red-400 hover:bg-red-400/10 disabled:opacity-40"
          >
            {deleting ? "..." : "del"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Admin add pin panel ---
function AdminAddPanel({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: (p: Place) => void;
}) {
  const [form, setForm] = useState({ name: "", country: "", lat: 0, lng: 0, visitedDate: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      onAdded(await res.json());
    } else {
      const j = await res.json();
      setError(j.error ?? "failed");
    }
    setSaving(false);
  }

  return (
    <div className="absolute inset-x-3 bottom-3 z-20 max-h-[85%] overflow-y-auto rounded-xl border border-white/20 bg-black/95 p-4 text-white shadow-2xl sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-4 sm:w-72">
      <div className="flex justify-between items-center mb-3">
        <p className="text-xs font-mono text-white/50 uppercase tracking-widest">add pin</p>
        <button type="button" onClick={onClose} className="flex size-11 items-center justify-center rounded-full text-lg leading-none text-white/60 hover:bg-white/10 hover:text-white" aria-label="Close add-place form">×</button>
      </div>

      <div className="space-y-2">
        {(["name", "country", "visitedDate", "notes"] as const).map((f) => (
          <div key={f}>
            <label className="text-[10px] font-mono text-white/40 uppercase">{f}</label>
            <input
              value={form[f]}
              onChange={(e) => set(f, e.target.value)}
              placeholder={f === "visitedDate" ? "YYYY-MM" : ""}
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-accent mt-0.5"
            />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-2">
          {(["lat", "lng"] as const).map((f) => (
            <div key={f}>
              <label className="text-[10px] font-mono text-white/40 uppercase">{f}</label>
              <input
                type="number"
                step="0.0001"
                value={form[f]}
                onChange={(e) => set(f, parseFloat(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-accent mt-0.5"
              />
            </div>
          ))}
        </div>

        {error && <p className="text-xs text-red-400 font-mono">{error}</p>}

        <button
          onClick={save}
          disabled={saving || !form.name || !form.country}
          className="mt-1 min-h-11 w-full rounded bg-accent py-1.5 font-mono text-xs text-bg hover:opacity-90 disabled:opacity-40"
        >
          {saving ? "adding..." : "add pin"}
        </button>
      </div>
    </div>
  );
}

// --- Main scene ---
interface Props {
  places: Place[];
  isAdmin: boolean;
}

export default function GlobeScene({ places: initialPlaces, isAdmin }: Props) {
  const [places, setPlaces] = useState<Place[]>(initialPlaces);
  const [hovered, setHovered] = useState<Place | null>(null);
  const [selected, setSelected] = useState<Place | null>(null);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const rotateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = useReducedMotion();

  const handleHover = useCallback((p: Place | null) => setHovered(p), []);
  const handleClick = useCallback((p: Place) => {
    setAdding(false);
    setEditing(false);
    setSelected((prev) => (prev?.id === p.id ? null : p));
  }, []);

  function handleSaved(updated: Place) {
    setPlaces((ps) => ps.map((p) => (p.id === updated.id ? updated : p)));
    setSelected(updated);
    setEditing(false);
  }

  function handleDeleted(id: string) {
    setPlaces((ps) => ps.filter((p) => p.id !== id));
    setSelected(null);
    setEditing(false);
  }

  function handleAdded(place: Place) {
    setPlaces((ps) => [...ps, place]);
    setAdding(false);
    setSelected(place);
  }

  const panelOpen = editing || adding;

  useEffect(() => {
    return () => {
      if (rotateTimer.current) clearTimeout(rotateTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!selected && !adding) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (editing) setEditing(false);
      else if (adding) setAdding(false);
      else setSelected(null);
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [adding, editing, selected]);

  return (
    <div className="relative h-full w-full">
      <Canvas
        aria-label="Interactive globe showing places Rohan has visited"
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ antialias: true }}
        onPointerDown={() => {
          if (rotateTimer.current) clearTimeout(rotateTimer.current);
          setInteracting(true);
        }}
        onPointerUp={() => {
          rotateTimer.current = setTimeout(() => setInteracting(false), 5000);
        }}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 3, 5]} intensity={1.8} />
        <directionalLight position={[-5, -2, -3]} intensity={0.4} />
        <Stars radius={100} depth={50} count={reducedMotion ? 1200 : 3000} factor={4} fade />

        <AutoRotate paused={reducedMotion || interacting || selected !== null}>
          <Earth />
          <Atmosphere />
          {places.map((p) => (
            <Pin
              key={p.id}
              place={p}
              onHover={handleHover}
              onClick={handleClick}
              isActive={selected?.id === p.id}
            />
          ))}
        </AutoRotate>

        <OrbitControls enablePan={false} minDistance={2.5} maxDistance={7} rotateSpeed={0.5} />
        <CursorStyle hovered={hovered !== null} />
      </Canvas>

      <div className="absolute left-3 top-3 z-10 rounded-lg border border-white/15 bg-black/80 p-2 text-white shadow-lg backdrop-blur-sm sm:left-4 sm:top-4">
        <label htmlFor="travel-place-select" className="sr-only">Jump to a visited place</label>
        <select
          id="travel-place-select"
          value={selected?.id ?? ""}
          onChange={(event) => {
            const place = places.find((candidate) => candidate.id === event.target.value) ?? null;
            setAdding(false);
            setEditing(false);
            setSelected(place);
          }}
          className="min-h-11 max-w-[13rem] rounded-md border border-white/15 bg-black px-3 text-sm text-white outline-none focus:border-white/50 sm:max-w-xs"
        >
          <option value="">Jump to a place…</option>
          {[...places]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((place) => (
              <option key={place.id} value={place.id}>{place.name}, {place.country}</option>
            ))}
        </select>
      </div>

      {/* hover label */}
      {hovered && !selected && (
        <div className="pointer-events-none absolute left-1/2 top-20 -translate-x-1/2 rounded bg-black/80 px-3 py-1.5 font-mono text-xs text-white">
          {hovered.name}, {hovered.country}
        </div>
      )}

      {/* admin add button */}
      {isAdmin && !panelOpen && (
        <button
          onClick={() => { setSelected(null); setAdding(true); }}
          type="button"
          className="absolute left-4 top-20 z-10 min-h-11 rounded bg-accent px-3 py-1.5 font-mono text-xs text-bg transition-opacity hover:opacity-90"
        >
          + add pin
        </button>
      )}

      {/* selected info panel (non-edit) */}
      {selected && !editing && !adding && (
        <section
          className="absolute inset-x-3 bottom-3 z-20 rounded-xl border border-white/15 bg-black/90 p-4 text-white shadow-2xl backdrop-blur-sm sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-4 sm:w-64"
          aria-label={`Selected place: ${selected.name}, ${selected.country}`}
          aria-live="polite"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-semibold text-sm">{selected.name}</p>
              <p className="text-xs text-white/50">{selected.country}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="ml-2 flex size-11 items-center justify-center rounded-full text-lg leading-none text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={`Close details for ${selected.name}`}
            >
              ×
            </button>
          </div>
          {selected.visitedDate && (
            <p className="mb-1 font-mono text-xs text-white/70">
              {formatVisitedDate(selected.visitedDate)}
              {selected._needsDate && " (approx)"}
            </p>
          )}
          {selected.notes && (
            <p className="text-xs text-white/50 mb-2">{selected.notes}</p>
          )}
          {selected.photos && selected.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-1 mb-2">
              {selected.photos.map((url) => (
                <img key={url} src={url} alt={`Photo from ${selected.name}`} className="w-full aspect-square object-cover rounded" />
              ))}
            </div>
          )}
          {isAdmin && (
            <button
              onClick={() => setEditing(true)}
              className="min-h-11 w-full rounded border border-white/10 py-1 font-mono text-xs text-white/60 hover:border-white/30 hover:text-white"
            >
              edit
            </button>
          )}
        </section>
      )}

      {/* admin edit panel */}
      {selected && editing && (
        <AdminEditPanel
          place={selected}
          onClose={() => setEditing(false)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}

      {/* admin add panel */}
      {adding && (
        <AdminAddPanel
          onClose={() => setAdding(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  );
}
