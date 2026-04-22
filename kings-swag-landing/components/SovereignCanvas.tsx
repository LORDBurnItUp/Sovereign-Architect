"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Float } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";

function SovereignCore() {
  const meshRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      meshRef.current.rotation.z += delta * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x -= delta * 0.5;
      ringRef.current.rotation.y += delta * 0.3;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.x += delta * 0.4;
      ringRef2.current.rotation.z -= delta * 0.6;
    }
  });

  return (
    <group ref={meshRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        {/* Wireframe outer shell */}
        <mesh>
          <icosahedronGeometry args={[1.5, 1]} />
          <meshStandardMaterial 
            color="#FFD700" 
            wireframe 
            emissive="#FFD700" 
            emissiveIntensity={0.6} 
            transparent
            opacity={0.3}
          />
        </mesh>
        
        {/* Inner solid core */}
        <mesh scale={0.8}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial 
            color="#111111" 
            metalness={1} 
            roughness={0.1}
            emissive="#FFD700"
            emissiveIntensity={0.1}
          />
        </mesh>

        {/* Orbiting rings */}
        <mesh ref={ringRef}>
          <torusGeometry args={[2, 0.02, 16, 100]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
        </mesh>
        
        <mesh ref={ringRef2}>
          <torusGeometry args={[2.5, 0.01, 16, 100]} />
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.4} opacity={0.5} transparent />
        </mesh>
      </Float>
    </group>
  );
}

export default function SovereignCanvas() {
  return (
    <div className="fixed inset-0 w-full h-full z-0 bg-[#030303] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ antialias: true, alpha: false }}>
        <color attach="background" args={["#030303"]} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#FFD700" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />
        
        <Suspense fallback={null}>
          {/* Main central core positioned slightly right so it doesn't clash with main UI elements */}
          <group position={[2, 0, -2]}>
            <SovereignCore />
          </group>
          {/* Deeper background stars */}
          <Stars radius={50} depth={50} count={3000} factor={3} saturation={0.5} fade speed={1.5} />
        </Suspense>
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          enableRotate={false}
          autoRotate 
          autoRotateSpeed={0.5} 
        />
      </Canvas>
    </div>
  );
}
