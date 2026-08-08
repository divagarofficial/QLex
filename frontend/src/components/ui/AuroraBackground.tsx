"use client";

import { ReactNode } from "react";

interface AuroraBackgroundProps {
  children: ReactNode;
}

export default function AuroraBackground({
  children,
}: AuroraBackgroundProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-white">

      {/* Blue Glow */}
      <div className="aurora aurora-blue" />

      {/* Violet Glow */}
      <div className="aurora aurora-violet" />

      {/* Golden Glow */}
      <div className="aurora aurora-gold" />

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(rgba(255,255,255,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.15)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Noise */}
      <div className="noise" />

      {/* Content */}

      <div className="relative z-10">

    <div className="shooting-star" />
<div className="shooting-star" />
<div className="shooting-star" />

        {children}

      </div>

    </div>
  );
}
