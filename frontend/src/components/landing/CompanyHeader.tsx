"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function CompanyHeader() {
  return (
    <section className="pt-20">

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .8 }}
        className="flex flex-col items-center"
      >

        {/* Replace later */}

        <div className="relative mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-yellow-400/20 bg-white/5 backdrop-blur-xl">

          <span className="text-5xl font-black text-yellow-400">
            M
          </span>

        </div>

        <h2 className="text-center text-4xl font-black tracking-[6px] text-white">

          MINDURA TECHNOLOGIES

        </h2>

        <p className="mt-4 text-center text-zinc-400">

          Elegance In Intelligent Innovation

        </p>

        <div className="mt-12 flex items-center gap-6">

          <div className="h-px w-20 bg-gradient-to-r from-transparent to-yellow-500/40" />

          <span className="tracking-[12px] text-yellow-400">

            PRESENTS

          </span>

          <div className="h-px w-20 bg-gradient-to-l from-transparent to-yellow-500/40" />

        </div>

      </motion.div>

    </section>
  );
}