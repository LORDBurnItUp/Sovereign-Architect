"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  PerspectiveCamera,
  Sphere,
  MeshDistortMaterial,
  Environment,
  ContactShadows,
  Float,
  Stars,
} from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function ObsidianCore() {
  const group = useRef<THREE.Group>(null);
  const coreMesh = useRef<THREE.Mesh>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const ringC = useRef<THREE.Mesh>(null);
  const target = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const { mouse } = state;
    target.current.x = THREE.MathUtils.lerp(target.current.x, mouse.x * 0.35, 0.05);
    target.current.y = THREE.MathUtils.lerp(target.current.y, mouse.y * 0.35, 0.05);

    if (group.current) {
      group.current.position.x = target.current.x;
      group.current.position.y = target.current.y;
      group.current.rotation.y += delta * 0.18;
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        mouse.y * 0.25,
        0.05,
      );
    }

    if (coreMesh.current) {
      coreMesh.current.rotation.x += delta * 0.22;
      coreMesh.current.rotation.y += delta * 0.28;
    }
    if (ringA.current) ringA.current.rotation.z += delta * 0.4;
    if (ringB.current) ringB.current.rotation.x += delta * 0.25;
    if (ringC.current) ringC.current.rotation.y += delta * 0.3;
  });

  return (
    <group ref={group}>
      <Sphere ref={coreMesh} args={[1.55, 96, 96]}>
        <MeshDistortMaterial
          color="#050508"
          distort={0.28}
          speed={1.6}
          roughness={0.08}
          metalness={1}
          emissive="#1a0e00"
          emissiveIntensity={0.4}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </Sphere>

      <Sphere args={[1.62, 64, 64]}>
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </Sphere>

      <Sphere args={[1.85, 48, 48]}>
        <meshBasicMaterial color="#FFD700" wireframe transparent opacity={0.08} />
      </Sphere>

      <mesh ref={ringA} rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[2.4, 0.012, 24, 180]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={1.4}
          roughness={0.2}
          metalness={1}
        />
      </mesh>

      <mesh ref={ringB} rotation={[0, Math.PI / 3, Math.PI / 4]}>
        <torusGeometry args={[2.75, 0.008, 24, 180]} />
        <meshStandardMaterial
          color="#00FFFF"
          emissive="#00FFFF"
          emissiveIntensity={1}
          roughness={0.3}
          metalness={1}
        />
      </mesh>

      <mesh ref={ringC} rotation={[Math.PI / 5, Math.PI / 8, 0]}>
        <torusGeometry args={[3.25, 0.006, 16, 220]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.35} />
      </mesh>

      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <Float key={i} speed={2} rotationIntensity={0} floatIntensity={0.4}>
            <mesh position={[Math.cos(angle) * 2.4, Math.sin(angle) * 2.4, 0]}>
              <sphereGeometry args={[0.035, 16, 16]} />
              <meshStandardMaterial
                color="#FFD700"
                emissive="#FFD700"
                emissiveIntensity={3}
              />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

export default function SovereignCanvas3D() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.9,
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 7]} fov={42} />
      <color attach="background" args={["#05050a"]} />
      <fog attach="fog" args={["#05050a", 8, 22]} />

      <Environment preset="studio" background={false} />

      <ambientLight intensity={0.12} />
      <directionalLight position={[6, 4, 5]} intensity={1.6} color="#FFD700" castShadow />
      <directionalLight position={[-6, -3, -4]} intensity={0.7} color="#00FFFF" />
      <pointLight position={[0, 0, 4]} intensity={0.8} color="#FFFFFF" />

      <Stars radius={40} depth={30} count={2200} factor={2.2} saturation={0} fade speed={0.4} />

      <ObsidianCore />

      <ContactShadows
        position={[0, -2.4, 0]}
        opacity={0.45}
        scale={10}
        blur={2.8}
        far={4}
        color="#FFD700"
      />
    </Canvas>
  );
}
