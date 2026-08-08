import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.04] bg-transparent py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-6 text-center">
        {/* Tiny logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/mindura-logo.svg"
            width={18}
            height={18}
            alt="M"
            className="h-[18px] w-[18px] opacity-40"
          />
          <span className="text-[9px] tracking-[0.4em] text-white/30 uppercase font-medium">
            Mindura Technologies
          </span>
        </div>

        {/* Hairline divider */}
        <div className="h-px w-20 bg-gradient-to-r from-transparent via-[#E7C873]/30 to-transparent" />

        <p className="text-[11px] tracking-wide text-white/30 sm:text-xs">
          &copy; 2026{" "}
          <span className="font-semibold tracking-wider text-white/40">
            MINDURA TECHNOLOGIES
          </span>
          . All rights reserved.
        </p>

        <p className="text-[10px] tracking-widest text-[#E7C873]/60 uppercase font-medium">
          QLex • Rajalakshmi Institute of Technology
        </p>
      </div>
    </footer>
  );
}

