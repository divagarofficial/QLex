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

        {/* Support & Founders Contact Info */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-white/50 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">Mail:</span>
            <a href="mailto:minduratechnologies@gmail.com" className="hover:text-amber-300 transition-colors">
              minduratechnologies@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400 font-bold">Divagar E (Founder):</span>
            <a href="tel:+919360087608" className="hover:text-cyan-300 transition-colors">
              +91 9360087608
            </a>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400 font-bold">Thirumalai D (Founder):</span>
            <a href="tel:+917550231600" className="hover:text-cyan-300 transition-colors">
              +91 7550231600
            </a>
          </div>
        </div>

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

