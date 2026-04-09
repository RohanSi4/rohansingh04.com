"use client";

import { useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { latLngToXyz } from "@/lib/geo";
import type { Place } from "@/lib/types";

const GLOBE_R = 1.5;
const PIN_R = 0.022;
const PIN_OFFSET = 0.04;

// --- Earth sphere ---
function Earth() {
  const texture = useTexture("/textures/earth.jpg");
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

// --- Cloud layer ---
function CloudLayer() {
  const texture = useTexture("/textures/clouds.png");
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (mesh.current) {
      // clouds drift slightly faster than earth rotation
      mesh.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[GLOBE_R * 1.008, 64, 64]} />
      <meshStandardMaterial
        alphaMap={texture}
        color="white"
        transparent
        opacity={0.6}
        depthWrite={false}
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

  // orient pin to point outward from globe center
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
function AutoRotate({
  children,
  paused,
}: {
  children: React.ReactNode;
  paused: boolean;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!paused && group.current) {
      group.current.rotation.y += delta * 0.12;
    }
  });

  return <group ref={group}>{children}</group>;
}

// --- Cursor style effect ---
function CursorStyle({ hovered }: { hovered: boolean }) {
  const { gl } = useThree();
  gl.domElement.style.cursor = hovered ? "pointer" : "grab";
  return null;
}

// --- Main scene ---
interface Props {
  places: Place[];
}

export default function GlobeScene({ places }: Props) {
  const [hovered, setHovered] = useState<Place | null>(null);
  const [selected, setSelected] = useState<Place | null>(null);
  const [interacting, setInteracting] = useState(false);

  const handleHover = useCallback((p: Place | null) => setHovered(p), []);
  const handleClick = useCallback((p: Place) => {
    setSelected((prev) => (prev?.id === p.id ? null : p));
  }, []);

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ antialias: true }}
        onPointerDown={() => setInteracting(true)}
        onPointerUp={() => setInteracting(false)}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 3, 5]} intensity={1.8} />
        <directionalLight position={[-5, -2, -3]} intensity={0.4} />
        <Stars radius={100} depth={50} count={3000} factor={4} fade />

        <AutoRotate paused={interacting || selected !== null}>
          <Earth />
          <CloudLayer />
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

        <OrbitControls
          enablePan={false}
          minDistance={2.5}
          maxDistance={7}
          rotateSpeed={0.5}
        />
        <CursorStyle hovered={hovered !== null} />
      </Canvas>

      {/* hover label */}
      {hovered && !selected && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs font-mono px-3 py-1.5 rounded pointer-events-none">
          {hovered.name}, {hovered.country}
        </div>
      )}

      {/* selected panel */}
      {selected && (
        <div className="absolute top-4 right-4 bg-black/80 border border-white/10 rounded-lg p-4 w-52 text-white">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-semibold text-sm">{selected.name}</p>
              <p className="text-xs text-white/50">{selected.country}</p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-white/40 hover:text-white transition-colors text-lg leading-none ml-2"
              aria-label="close"
            >
              ×
            </button>
          </div>
          {selected.visitedDate && (
            <p className="text-xs text-white/60 font-mono mb-1">
              {selected.visitedDate}
              {selected._needsDate && " (approx)"}
            </p>
          )}
          {selected.notes && (
            <p className="text-xs text-white/50">{selected.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}
