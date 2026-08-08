"use client";

import { useEffect, useState } from "react";

/**
 * Tiny floating particles — Layer 8
 * Deterministic, no Math.random during render
 */

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function FloatingDust() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const rng = seeded(42);
  const particles = Array.from({ length: 40 }, () => ({
    w: rng() * 1.5 + 0.5,
    h: rng() * 1.5 + 0.5,
    t: rng() * 100,
    l: rng() * 100,
    d: 20 + rng() * 30,
    del: rng() * 25,
  }));

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-40 overflow-hidden">
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white/20"
          style={{
            width: `${p.w}px`,
            height: `${p.h}px`,
            top: `${p.t}%`,
            left: `${p.l}%`,
            animation: `particle-drift ${p.d}s ease-in-out ${p.del}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

