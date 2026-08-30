"use client";

import { motion } from "framer-motion";
import { Sparkles, Heart, Quote, Mail, Code } from "lucide-react";
import GlassCard from "@/components/glass/GlassCard";
import { CORE_TEAM_MEMBERS } from "./creditsData";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z" />
    </svg>
  );
}

export default function CoreTeamSection() {
  return (
    <section
      id="team"
      aria-label="Core Team - Heart & Soul"
      className="w-full flex flex-col items-center text-center space-y-8"
    >
      {/* Emotional Centerpiece Header */}
      <div className="flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-semibold tracking-wider uppercase mb-3 shadow-lg shadow-rose-500/5">
          <Heart className="w-3.5 h-3.5 fill-rose-400/80 text-rose-400 animate-pulse" />
          <span>The Minds Behind QLex</span>
        </div>

        <h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
          <span className="bg-gradient-to-r from-white via-zinc-100 to-amber-200 bg-clip-text text-transparent">
            Heart & Soul
          </span>
        </h3>
        <p className="text-sm sm:text-base text-zinc-400 max-w-md font-light leading-relaxed">
          Crafted with passion, engineering precision, and relentless attention to detail.
        </p>
      </div>

      {/* Profile Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {CORE_TEAM_MEMBERS.map((member) => (
          <motion.div
            key={member.id}
            whileHover={{ y: -8, scale: 1.015 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <GlassCard>
              <div className="flex flex-col items-center justify-between text-center p-7 sm:p-8 h-full relative group">
                {/* Monogram Avatar Badge */}
                <div className="relative mb-5">
                  <div className="absolute inset-0 rounded-2xl bg-amber-400/25 blur-lg transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
                  <div className="relative flex items-center justify-center w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-white/12 via-white/8 to-white/4 border border-white/20 backdrop-blur-2xl shadow-xl group-hover:border-amber-400/50 transition-colors">
                    <span className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wider">
                      {member.initials}
                    </span>
                  </div>
                </div>

                {/* Person Name */}
                <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1.5">
                  {member.name}
                </h4>

                {/* Role Badge */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-4 shadow-md">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{member.role}</span>
                </div>

                {/* Specialization Tags */}
                {member.contributions && (
                  <div className="flex flex-wrap items-center justify-center gap-1.5 mb-5 max-w-xs">
                    {member.contributions.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-zinc-300"
                      >
                        <Code className="w-2.5 h-2.5 text-amber-400/80" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Inspirational Quote Card */}
                {member.quote && (
                  <div className="relative mb-5 p-3.5 rounded-2xl bg-white/[0.025] border border-white/[0.06] text-zinc-300 text-xs sm:text-sm font-normal italic leading-relaxed w-full flex items-start gap-2.5 text-left group-hover:border-white/12 transition-colors">
                    <Quote className="w-4 h-4 text-amber-400/70 shrink-0 mt-0.5" />
                    <span>{member.quote}</span>
                  </div>
                )}

                {/* Social Links Bar */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06] w-full justify-center">
                  {member.githubUrl && (
                    <a
                      href={member.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.08] hover:border-amber-400/40 transition-all duration-200 group/icon"
                      aria-label={`${member.name}'s GitHub Profile`}
                    >
                      <GithubIcon className="w-4 h-4 group-hover/icon:scale-110 transition-transform" />
                    </a>
                  )}
                  {member.linkedinUrl && (
                    <a
                      href={member.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-cyan-300 hover:bg-white/[0.08] hover:border-cyan-400/40 transition-all duration-200 group/icon"
                      aria-label={`${member.name}'s LinkedIn Profile`}
                    >
                      <LinkedinIcon className="w-4 h-4 group-hover/icon:scale-110 transition-transform" />
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-amber-300 hover:bg-white/[0.08] hover:border-amber-400/40 transition-all duration-200 group/icon"
                      aria-label={`Email ${member.name}`}
                    >
                      <Mail className="w-4 h-4 group-hover/icon:scale-110 transition-transform" />
                    </a>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}


