"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import SequenceCanvas from "@/components/SequenceCanvas";
import { useRouter } from "next/navigation";
import useSound from "use-sound";

export default function Home() {
  const router = useRouter();
  const [playClick] = useSound("/sounds/digital-click.wav", { volume: 0.5 });
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll();

  // Story Beat Opacity Mapping: [start, start+0.1, end-0.1, end]
  // BEAT A: 0% - 20%
  const beatAOpacity = useTransform(scrollYProgress, [0, 0.05, 0.15, 0.20], [0, 1, 1, 0]);
  const beatAY =       useTransform(scrollYProgress, [0, 0.05, 0.15, 0.20], [20, 0, 0, -20]);

  // BEAT B: 25% - 45%
  const beatBOpacity = useTransform(scrollYProgress, [0.25, 0.35, 0.40, 0.45], [0, 1, 1, 0]);
  const beatBY =       useTransform(scrollYProgress, [0.25, 0.35, 0.40, 0.45], [20, 0, 0, -20]);

  // BEAT C: 50% - 70%
  const beatCOpacity = useTransform(scrollYProgress, [0.50, 0.60, 0.65, 0.70], [0, 1, 1, 0]);
  const beatCY =       useTransform(scrollYProgress, [0.50, 0.60, 0.65, 0.70], [20, 0, 0, -20]);

  // BEAT D (CTA): 75% - 95%
  const beatDOpacity = useTransform(scrollYProgress, [0.75, 0.85, 0.90, 0.95], [0, 1, 1, 0]);
  const beatDY =       useTransform(scrollYProgress, [0.75, 0.85, 0.90, 0.95], [20, 0, 0, -20]);

  return (
    <main ref={containerRef} className="relative w-full bg-[#050505] selection:bg-cyan-500/30">
      
      {/* 1. The Canvas layer operates on its own sticky height internally */}
      <div className="absolute top-0 left-0 w-full">
        <SequenceCanvas />
      </div>

      {/* 2. The precise Scrollytelling content layer mapped exactly to the 400vh bounds */}
      <div className="relative w-full h-[400vh] pointer-events-none z-10 font-sans">
        
        {/* Beat A (0-20%) */}
        <motion.div 
          style={{ opacity: beatAOpacity, y: beatAY }}
          className="fixed top-0 left-0 w-full h-screen flex flex-col items-center justify-center p-8"
        >
          <h1 className="text-7xl md:text-9xl font-black text-white/90 tracking-tighter uppercase text-center drop-shadow-2xl">
             Kings Dripping Swag
          </h1>
          <p className="mt-6 text-xl md:text-3xl text-white/60 tracking-wide font-light max-w-2xl text-center">
            Deploying the ultimate 4D intelligence architecture. 
          </p>
        </motion.div>

        {/* Beat B (25-45%) */}
        <motion.div 
          style={{ opacity: beatBOpacity, y: beatBY }}
          className="fixed top-0 left-0 w-full h-screen flex flex-col justify-center items-start p-8 md:pl-32"
        >
          <h2 className="text-6xl md:text-8xl font-bold text-white/90 tracking-tight">
            Autonomous Core
          </h2>
          <p className="mt-4 text-xl md:text-2xl text-white/60 font-light max-w-lg leading-relaxed">
            Unstoppable mobile pipelines connected by synthetic nerves. Every action orchestrated with surgical precision.
          </p>
        </motion.div>

        {/* Beat C (50-70%) */}
        <motion.div 
          style={{ opacity: beatCOpacity, y: beatCY }}
          className="fixed top-0 left-0 w-full h-screen flex flex-col justify-center items-end p-8 md:pr-32 text-right"
        >
          <h2 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-tight">
             Hyper-threaded
          </h2>
          <p className="mt-4 text-xl md:text-2xl text-white/60 font-light max-w-lg leading-relaxed">
            Synchronized directly to neural streams. Transforming logic into high-velocity execution.
          </p>
        </motion.div>

        {/* Beat D (75-95%) */}
        <motion.div 
          style={{ opacity: beatDOpacity, y: beatDY }}
          className="fixed top-0 left-0 w-full h-screen flex flex-col items-center justify-center p-8"
        >
          <h2 className="text-6xl md:text-8xl font-bold text-white/90 tracking-tighter uppercase mb-12">
            Engage System
          </h2>
          <button 
            onClick={() => {
              playClick();
              setTimeout(() => { router.push('/dashboard'); }, 200);
            }}
            className="pointer-events-auto px-12 py-5 bg-white text-black font-semibold uppercase tracking-widest rounded-full hover:scale-105 hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_40px_rgba(0,255,255,0.2)]">
            Initialize Sequence
          </button>
        </motion.div>

      </div>
    </main>
  );
}
