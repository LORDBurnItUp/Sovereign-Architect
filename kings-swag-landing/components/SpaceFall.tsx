"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Stars } from "@react-three/drei";
import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import gsap from "gsap";

type Phase = "space" | "warp" | "approach" | "impact" | "done";

const PHASE_TIMES: Record<Phase, number> = {
  space: 0,
  warp: 1.6,
  approach: 4.2,
  impact: 6.6,
  done: 8.2,
};

function StreakingStars({ phaseRef }: { phaseRef: React.MutableRefObject<Phase> }) {
  const count = 2200;
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, seeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 2 + Math.random() * 28;
      pos[i * 3 + 0] = Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.sin(theta) * r;
      pos[i * 3 + 2] = -Math.random() * 260;
      s[i] = Math.random();
    }
    return { positions: pos, seeds: s };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;

    const phase = phaseRef.current;
    const warpMult =
      phase === "warp" ? 80 :
      phase === "approach" ? 60 :
      phase === "impact" ? 120 :
      phase === "space" ? 6 : 2;

    for (let i = 0; i < count; i++) {
      arr[i * 3 + 2] += delta * (warpMult + seeds[i] * 20);
      if (arr[i * 3 + 2] > 6) {
        const theta = Math.random() * Math.PI * 2;
        const r = 2 + Math.random() * 28;
        arr[i * 3 + 0] = Math.cos(theta) * r;
        arr[i * 3 + 1] = Math.sin(theta) * r;
        arr[i * 3 + 2] = -260 + Math.random() * 10;
      }
    }
    pos.needsUpdate = true;

    const mat = pointsRef.current.material as THREE.PointsMaterial;
    const targetSize = phase === "warp" || phase === "impact" ? 0.18 : 0.06;
    mat.size = THREE.MathUtils.lerp(mat.size, targetSize, 0.05);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#ffffff"
        sizeAttenuation
        transparent
        opacity={0.95}
        depthWrite={false}
      />
    </points>
  );
}

function WormholeTunnel({ phaseRef }: { phaseRef: React.MutableRefObject<Phase> }) {
  const groupRef = useRef<THREE.Group>(null);
  const rings = 48;

  const ringsGeom = useMemo(() => {
    return new Array(rings).fill(0).map((_, i) => ({
      z: -i * 4,
      hue: (i / rings) * 360,
    }));
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const phase = phaseRef.current;
    const active = phase === "warp" || phase === "approach";
    const speed = active ? 40 : 8;

    groupRef.current.children.forEach((child) => {
      child.position.z += delta * speed;
      if (child.position.z > 4) child.position.z -= rings * 4;
      child.rotation.z += delta * 0.6;
    });

    const targetOpacity = active ? 1 : 0.15;
    groupRef.current.children.forEach((child) => {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      if (mat.opacity !== undefined) {
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.04);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {ringsGeom.map((r, i) => (
        <mesh key={i} position={[0, 0, r.z]} rotation={[0, 0, (i / rings) * Math.PI]}>
          <torusGeometry args={[6 + (i % 3) * 0.3, 0.04, 8, 64]} />
          <meshBasicMaterial
            color={`hsl(${r.hue}, 100%, 65%)`}
            transparent
            opacity={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

function Earth({ phaseRef }: { phaseRef: React.MutableRefObject<Phase> }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const atmoRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!groupRef.current || !coreRef.current || !atmoRef.current) return;
    const phase = phaseRef.current;
    coreRef.current.rotation.y += delta * 0.2;

    const targetScale =
      phase === "approach" ? 1 :
      phase === "impact" ? 8 :
      phase === "done" ? 0 : 0.2;
    const currentScale = groupRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.08);
    groupRef.current.scale.setScalar(newScale);

    const targetOpacity =
      phase === "approach" || phase === "impact" ? 1 :
      phase === "warp" ? 0.4 : 0;
    const coreMat = coreRef.current.material as THREE.MeshStandardMaterial;
    const atmoMat = atmoRef.current.material as THREE.MeshBasicMaterial;
    coreMat.opacity = THREE.MathUtils.lerp(coreMat.opacity, targetOpacity, 0.08);
    atmoMat.opacity = THREE.MathUtils.lerp(atmoMat.opacity, targetOpacity * 0.6, 0.08);
  });

  return (
    <group ref={groupRef} position={[0, 0, -180]} scale={0.2}>
      <mesh ref={coreRef}>
        <sphereGeometry args={[4, 96, 96]} />
        <meshStandardMaterial
          color="#0d3b6b"
          emissive="#1a5fa3"
          emissiveIntensity={0.4}
          roughness={0.6}
          metalness={0.1}
          transparent
          opacity={0}
        />
      </mesh>
      <mesh ref={atmoRef}>
        <sphereGeometry args={[4.6, 64, 64]} />
        <meshBasicMaterial
          color="#66c3ff"
          transparent
          opacity={0}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[4.1, 48, 48]} />
        <meshBasicMaterial
          color="#FFD700"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>
    </group>
  );
}

function CameraRig({
  phaseRef,
  onComplete,
}: {
  phaseRef: React.MutableRefObject<Phase>;
  onComplete: () => void;
}) {
  const { camera } = useThree();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    camera.position.set(0, 0, 0);
    camera.rotation.set(0, 0, 0);

    const tl = gsap.timeline({
      onComplete: () => {
        phaseRef.current = "done";
        onComplete();
      },
    });

    tl.to(camera.position, {
      z: -20,
      duration: PHASE_TIMES.warp,
      ease: "power1.in",
      onStart: () => (phaseRef.current = "space"),
    });

    tl.to(camera.position, {
      z: -100,
      duration: PHASE_TIMES.approach - PHASE_TIMES.warp,
      ease: "power3.in",
      onStart: () => (phaseRef.current = "warp"),
    });

    tl.to(camera.rotation, { z: Math.PI * 2, duration: 2.2, ease: "power2.inOut" }, "<");

    tl.to(camera.position, {
      z: -170,
      duration: PHASE_TIMES.impact - PHASE_TIMES.approach,
      ease: "power2.in",
      onStart: () => (phaseRef.current = "approach"),
    });

    tl.to(camera.position, {
      z: -178,
      duration: PHASE_TIMES.done - PHASE_TIMES.impact,
      ease: "expo.in",
      onStart: () => (phaseRef.current = "impact"),
    });
  }, [camera, phaseRef, onComplete]);

  return null;
}

function Flash({ phaseRef }: { phaseRef: React.MutableRefObject<Phase> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    const phase = phaseRef.current;
    const target = phase === "impact" ? 1 : phase === "done" ? 1 : 0;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, target, phase === "done" ? 0.2 : 0.12);
  });
  return (
    <mesh ref={meshRef} position={[0, 0, -0.1]}>
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

export default function SpaceFall({ onComplete }: { onComplete: () => void }) {
  const phaseRef = useRef<Phase>("space");
  const [phase, setPhase] = useState<Phase>("space");
  const [skipVisible, setSkipVisible] = useState(false);
  const [aberration, setAberration] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhase(phaseRef.current), 120);
    const st = setTimeout(() => setSkipVisible(true), 800);
    return () => {
      clearInterval(t);
      clearTimeout(st);
    };
  }, []);

  useEffect(() => {
    const base =
      phase === "space" ? 1 :
      phase === "warp" ? 5 :
      phase === "approach" ? 4 :
      phase === "impact" ? 14 : 0;
    setAberration(base);
  }, [phase]);

  const skip = useCallback(() => {
    phaseRef.current = "done";
    onComplete();
  }, [onComplete]);

  const phaseLabel =
    phase === "space" ? "// DEEP SPACE // NODE_DXB TARGETING" :
    phase === "warp" ? "// WARP ACTIVE // WORMHOLE INGRESS" :
    phase === "approach" ? "// TARGET ACQUIRED // EARTH" :
    phase === "impact" ? "// ATMOSPHERIC ENTRY // BRACE" :
    "// CONTACT";

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden">
      <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden>
        <defs>
          <filter id="chromatic-aberration">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="red"
            />
            <feOffset in="red" dx={aberration} dy="0" result="redOffset" />
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="green"
            />
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="blue"
            />
            <feOffset in="blue" dx={-aberration} dy="0" result="blueOffset" />
            <feBlend in="redOffset" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blueOffset" mode="screen" />
          </filter>
        </defs>
      </svg>

      <div
        className="absolute inset-0"
        style={{
          filter: `url(#chromatic-aberration) contrast(1.08) saturate(${1 + aberration * 0.05})`,
          transition: "filter 0.4s ease",
        }}
      >
        <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
          <PerspectiveCamera makeDefault position={[0, 0, 0]} fov={75} near={0.1} far={400} />
          <color attach="background" args={["#02010a"]} />
          <fog attach="fog" args={["#02010a", 40, 260]} />

          <ambientLight intensity={0.25} />
          <directionalLight position={[10, 8, -20]} intensity={1.1} color="#ffd08a" />
          <pointLight position={[0, 0, -170]} intensity={2.5} color="#6cc5ff" distance={60} />

          <Stars radius={160} depth={80} count={4000} factor={3} fade speed={0.4} />
          <StreakingStars phaseRef={phaseRef} />
          <WormholeTunnel phaseRef={phaseRef} />
          <Earth phaseRef={phaseRef} />
          <Flash phaseRef={phaseRef} />

          <CameraRig phaseRef={phaseRef} onComplete={onComplete} />
        </Canvas>
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 1px, transparent 1px, transparent 3px)",
        }}
      />

      <div className="absolute top-6 left-6 font-mono text-[10px] text-cyan-300 tracking-[0.3em] uppercase mix-blend-screen">
        <div className="opacity-60">SOVEREIGN NEURAL HELMET</div>
        <div className="text-cyan-100 mt-1">{phaseLabel}</div>
        <div className="opacity-40 mt-1">T-MINUS · FIRST CONTACT</div>
      </div>

      <div className="absolute top-6 right-6 font-mono text-[10px] text-amber-300 tracking-[0.3em] uppercase text-right">
        <div className="opacity-60">OPERATOR</div>
        <div className="text-amber-100 mt-1">ANTIGRAVITY</div>
        <div className="opacity-40 mt-1">LEVEL: Ω-5</div>
      </div>

      <div className="absolute bottom-6 left-6 font-mono text-[9px] text-white/40 tracking-widest uppercase">
        <span className="text-amber-300">◆</span> B.L.A.S.T. INGRESS PROTOCOL v4.0
      </div>

      {skipVisible && phase !== "done" && (
        <button
          onClick={skip}
          className="absolute bottom-6 right-6 font-mono text-[10px] tracking-[0.3em] uppercase border border-white/20 text-white/60 hover:text-amber-300 hover:border-amber-300/60 px-4 py-2 transition-all backdrop-blur-sm"
        >
          Skip Ingress →
        </button>
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: "inset 0 0 120px rgba(0,0,0,0.9), inset 0 0 40px rgba(100,180,255,0.15)",
        }}
      />
    </div>
  );
}
