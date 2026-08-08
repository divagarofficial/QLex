"use client";

import GlassCard from "@/components/glass/GlassCard";
import {
  Clock3,
  FileText,
  Printer,
  Users,
} from "lucide-react";

export default function FloatingCards() {
  return (
    <>
      {/* Queue */}
      <div className="floating-card left-[6%] top-[22%] hidden lg:block">
        <GlassCard>
          <div className="p-5">
            <Clock3 className="mb-3 text-yellow-400" size={30} />

            <p className="text-sm text-zinc-400">
              Queue Time
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              2 min
            </h2>
          </div>
        </GlassCard>
      </div>

      {/* Orders */}
      <div className="floating-card right-[8%] top-[18%] hidden lg:block">
        <GlassCard>
          <div className="p-5">
            <Printer className="mb-3 text-blue-400" size={30} />

            <p className="text-sm text-zinc-400">
              Orders Today
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              128
            </h2>
          </div>
        </GlassCard>
      </div>

      {/* Documents */}
      <div className="floating-card left-[12%] bottom-[12%] hidden lg:block">
        <GlassCard>
          <div className="p-5">
            <FileText className="mb-3 text-violet-400" size={30} />

            <p className="text-sm text-zinc-400">
              Uploaded Files
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              530+
            </h2>
          </div>
        </GlassCard>
      </div>

      {/* Students */}
      <div className="floating-card right-[12%] bottom-[15%] hidden lg:block">
        <GlassCard>
          <div className="p-5">
            <Users className="mb-3 text-cyan-400" size={30} />

            <p className="text-sm text-zinc-400">
              Students
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              4.8K
            </h2>
          </div>
        </GlassCard>
      </div>
    </>
  );
}

