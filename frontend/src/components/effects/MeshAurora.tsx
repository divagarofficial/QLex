"use client";

import { motion } from "framer-motion";

export default function MeshAurora() {
  return (
    <>
      {/* Left Blue */}
      <motion.div
        animate={{
          x: [-80, 50, -80],
          y: [-40, 20, -40],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none fixed -left-[20%] top-[5%] h-[900px] w-[900px] rounded-full blur-[180px]"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,.22), transparent 70%)",
        }}
      />

      {/* Right Purple */}
      <motion.div
        animate={{
          x: [50, -50, 50],
          y: [40, -30, 40],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 55,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none fixed -right-[15%] top-[10%] h-[850px] w-[850px] rounded-full blur-[190px]"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,.18), transparent 72%)",
        }}
      />

      {/* Bottom Ambient */}
      <motion.div
        animate={{
          opacity: [.35,.5,.35],
        }}
        transition={{
          duration:12,
          repeat:Infinity,
        }}
        className="pointer-events-none fixed bottom-[-400px] left-1/2 h-[900px] w-[1500px] -translate-x-1/2 blur-[220px]"
        style={{
          background:
            "radial-gradient(circle, rgba(20,40,120,.18), transparent 75%)",
        }}
      />
    </>
  );
}