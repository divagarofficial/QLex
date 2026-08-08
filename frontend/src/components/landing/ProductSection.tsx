"use client";

import { motion } from "framer-motion";
import RoleCards from "./RoleCards";

export default function ProductSection() {
  return (
    <section className="relative flex flex-1 flex-col items-center justify-center px-6">

      <motion.div
        initial={{ opacity:0, scale:.9 }}
        animate={{ opacity:1, scale:1 }}
        transition={{ delay:.5, duration:.8 }}
      >

        {/* Temporary Logo */}

        <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-[32px] border border-blue-500/20 bg-white/5 backdrop-blur-xl">

          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-6xl font-black text-transparent">

            Q

          </span>

        </div>

      </motion.div>

      <motion.h1
        initial={{ opacity:0 }}
        animate={{ opacity:1 }}
        transition={{ delay:.7 }}
        className="hero-title mt-8"
      >

        QLex

      </motion.h1>

      <motion.p
        initial={{ opacity:0 }}
        animate={{ opacity:1 }}
        transition={{ delay:.9 }}
        className="mt-4 text-lg text-yellow-300"
      >

        Upload to Pickup

      </motion.p>

      <motion.h3
        initial={{ opacity:0 }}
        animate={{ opacity:1 }}
        transition={{ delay:1.2 }}
        className="mt-16 text-3xl font-bold"
      >

        Choose Your Experience

      </motion.h3>

      <motion.p
        initial={{ opacity:0 }}
        animate={{ opacity:1 }}
        transition={{ delay:1.3 }}
        className="mt-3 text-zinc-400"
      >

        Select how you'd like to access QLex.

      </motion.p>

      <RoleCards />

    </section>
  );
}