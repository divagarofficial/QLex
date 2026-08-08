"use client";

import { motion } from "framer-motion";

export default function Spotlight() {
  return (
    <motion.div
      animate={{
        opacity: [.55,.75,.55],
        scale:[1,1.06,1]
      }}
      transition={{
        duration:10,
        repeat:Infinity,
        ease:"easeInOut"
      }}
      className="
      pointer-events-none
      fixed
      left-1/2
      top-[-250px]
      h-[900px]
      w-[900px]
      -translate-x-1/2
      rounded-full
      blur-[180px]
      "
      style={{
        background:
          "radial-gradient(circle, rgba(231,200,115,.22), transparent 72%)",
      }}
    />
  );
}