"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const SpaceFall = dynamic(() => import("@/components/SpaceFall"), { ssr: false });

export default function Home() {
  const router = useRouter();
  const [done, setDone] = useState(false);

  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => router.push("/dashboard"), 250);
    return () => clearTimeout(t);
  }, [done, router]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      {!done && <SpaceFall onComplete={() => setDone(true)} />}
      {done && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="font-mono text-[11px] text-amber-300 tracking-[0.4em] uppercase animate-pulse">
            ◈ CONTACT · LOADING SOVEREIGN DASHBOARD ◈
          </div>
        </div>
      )}
    </main>
  );
}
