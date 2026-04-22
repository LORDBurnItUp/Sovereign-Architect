"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useSpring } from "framer-motion";

const FRAME_COUNT = 120;

export default function SequenceCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(0);
  const [fallbackImage, setFallbackImage] = useState<HTMLImageElement | null>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [hasSequence, setHasSequence] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    let loadedCount = 0;
    
    // Fallback loading
    const fallback = new Image();
    fallback.src = "/hero_bg.png";
    fallback.onload = () => {
      setFallbackImage(fallback);
    };

    const loadedImages: HTMLImageElement[] = [];

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `/sequence/${i}.webp`;
      img.onload = () => {
        loadedCount++;
        setLoaded(Math.floor((loadedCount / FRAME_COUNT) * 100));
        setHasSequence(true);
      };
      img.onerror = () => {
        loadedCount++;
        setLoaded(Math.floor((loadedCount / FRAME_COUNT) * 100));
      };
      loadedImages.push(img);
    }
    setImages(loadedImages);

    // Safety timeout: force entry after 5s
    const timer = setTimeout(() => {
      setLoaded(100);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // 2. Framer Motion Scroll Tracking (window-based to avoid hydration race)
  const { scrollYProgress } = useScroll();

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // 3. Canvas Drawing & Resizing
  useEffect(() => {
    if (!isMounted || loaded < 100 || (images.length === 0 && !fallbackImage)) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;

      const progress = smoothProgress.get();
      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.max(0, Math.floor(progress * FRAME_COUNT))
      );
      
      const img = images[frameIndex];
      // Use sequence frame if available and loaded, otherwise fallback
      const targetImg = (img && img.complete && img.naturalWidth !== 0) ? img : fallbackImage;

      if (targetImg && targetImg.complete && targetImg.naturalWidth !== 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const scale = Math.max(canvas.width / targetImg.width, canvas.height / targetImg.height);
        const x = (canvas.width / 2) - (targetImg.width / 2) * scale;
        const y = (canvas.height / 2) - (targetImg.height / 2) * scale;
        
        ctx.drawImage(targetImg, x, y, targetImg.width * scale, targetImg.height * scale);
        
        // Add subtle scanline effect if playing fallback
        if (targetImg === fallbackImage) {
           ctx.fillStyle = "rgba(0,0,0,0.15)";
           for(let j = 0; j < canvas.height; j+=4) {
             ctx.fillRect(0, j, canvas.width, 1);
           }
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMounted, loaded, images, smoothProgress, fallbackImage]);

  // Loading State
  if (!isMounted || loaded < 100) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050505]">
        <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]" 
            style={{ width: `${loaded}%`, transition: 'width 0.2s ease-out' }}
          />
        </div>
        <p className="mt-4 text-white/50 font-mono tracking-widest text-[10px] uppercase text-center animate-pulse">
          Initializing 4D Core :: {loaded}%<br/>
          <span className="opacity-30">{hasSequence ? 'Neural Stream Active' : 'Loading Static Backbone'}</span>
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-[400vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden pointer-events-none">
        <canvas ref={canvasRef} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
