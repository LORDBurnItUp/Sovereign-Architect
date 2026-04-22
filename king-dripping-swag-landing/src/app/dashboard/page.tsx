'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, Float, Sparkles, Environment, Text, MeshDistortMaterial } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

function GhostHologram({ pos, name, mode, color, delay }: { pos: [number, number, number], name: string, mode: string, color: string, delay: number }) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.2 + delay;
    group.current.position.y = pos[1] + Math.sin(state.clock.elapsedTime * 2 + delay) * 1.5;
  });

  return (
    <Float speed={5} rotationIntensity={2} floatIntensity={2}>
      <group ref={group} position={pos}>
        <mesh onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
          <boxGeometry args={[15, 25, 2]} />
          <MeshDistortMaterial 
            color="#00050f"
            metalness={1}
            roughness={0}
            emissive={color}
            emissiveIntensity={hovered ? 15 : 5}
            distort={0.4}
            speed={4}
          />
        </mesh>

        <Text position={[0, 15, 2]} fontSize={4} color="#ffffff" anchorX="center" font="/fonts/Inter-Bold.woff">
          {name}
        </Text>
        <Text position={[0, -15, 2]} fontSize={2} color={color} anchorX="center" font="/fonts/Inter-Regular.woff">
          {mode}
        </Text>
      </group>
    </Float>
  );
}

export default function GhostProtocolBurj() {
  const [time, setTime] = useState("00:00");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-screen w-full bg-[#000011] overflow-hidden">
      <Canvas camera={{ position: [0, 42, 180], fov: 75 }}>
        <color attach="background" args={['#000011']} />
        <fog attach="fog" args={['#000011', 100, 400]} />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[80, 100, 80]} intensity={10000} color="#c026d3" />
        <spotLight position={[-70, 70, -60]} intensity={10000} color="#22d3ee" />

        <Environment preset="night" />
        <Stars radius={1000} depth={200} count={80000} factor={12} />
        <Sparkles count={4000} size={18} speed={1} color="#67e8f9" scale={400} />

        <GhostHologram pos={[-80, 60, 0]} name="SCOUT" mode="NOSTRADAMUS MODE" color="#22d3ee" delay={0} />
        <GhostHologram pos={[0, 60, 0]} name="EXECUTOR" mode="GOD MODE" color="#ec4899" delay={2.8} />
        <GhostHologram pos={[80, 60, 0]} name="DEBUGGER" mode="ELITE MODE" color="#a855f7" delay={5.6} />
        
        <GhostHologram pos={[-80, -20, 0]} name="MANAGER" mode="SWARM ORCHESTRATOR" color="#fbbf24" delay={1.4} />
        <GhostHologram pos={[0, -20, 0]} name="ANALYST" mode="LIVE PREDICTION" color="#4ade80" delay={4.2} />
        <GhostHologram pos={[80, -20, 0]} name="VOICE" mode="LIVEKIT CALL CENTER" color="#fb923c" delay={7.0} />

        <OrbitControls enableZoom={true} enablePan={false} minDistance={60} maxDistance={400} />
      </Canvas>

      {/* Luxury UI Overlay */}
      <div className="absolute top-0 inset-x-0 z-50 px-12 py-10 pointer-events-none flex justify-between items-start">
        <div className="space-y-0">
          <div className="text-[12rem] font-black text-yellow-300 tracking-tighter leading-none opacity-90 filter drop-shadow-[0_0_30px_rgba(253,224,71,0.3)]">163</div>
          <div className="text-6xl -mt-6 font-light text-cyan-300 tracking-widest uppercase">Burj Khalifa Penthouse</div>
        </div>
        
        <div className="text-right">
          <div className="text-[8rem] font-mono font-bold tracking-tighter text-cyan-400 leading-none">{time}</div>
          <div className="text-4xl text-white/50 mt-2 tracking-[0.5em] uppercase">Dubai • UAE</div>
        </div>
      </div>

      {/* Global Glow Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 via-transparent to-purple-900/10 pointer-events-none" />
      
      {/* Bottom Status Bar */}
      <div className="absolute bottom-10 inset-x-0 px-12 flex justify-between text-cyan-400/50 font-mono text-sm tracking-[0.2em] uppercase">
        <div>System: Ghost Protocol Active</div>
        <div>Uplink: Sovereign Satellite Link Established</div>
        <div>Memory: 6-Tier Brain Synced</div>
      </div>
    </div>
  );
}
