import Image from "next/image";

interface LogoProps {
  className?: string;
  showText?: boolean;
  showSubtitle?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function Logo({
  className = "",
  showText = true,
  showSubtitle = true,
  size = "md",
}: LogoProps) {
  const iconSizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10 sm:h-11 sm:w-11",
    lg: "h-14 w-14",
  };

  const textSizes = {
    sm: "text-xl",
    md: "text-2xl sm:text-3xl",
    lg: "text-4xl",
  };

  const subtitleSizes = {
    sm: "text-[9px]",
    md: "text-[10px] sm:text-xs",
    lg: "text-xs",
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="relative flex items-center justify-center shrink-0">
        {/* Soft golden glow behind logo */}
        <div className="absolute inset-0 rounded-full bg-amber-400/25 blur-md" />

        <Image
          src="/qlex-logo.png"
          alt="QLex Logo"
          width={80}
          height={80}
          className={`relative ${iconSizes[size]} object-contain filter drop-shadow-[0_0_12px_rgba(231,200,115,0.45)] transition-transform duration-300 hover:scale-105`}
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <h1 className={`bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text ${textSizes[size]} font-black tracking-tight text-transparent drop-shadow-sm`}>
            QLex
          </h1>

          {showSubtitle && (
            <p className={`mt-0.5 ${subtitleSizes[size]} font-medium tracking-wide text-amber-200/60`}>
              Upload to Pickup
            </p>
          )}
        </div>
      )}
    </div>
  );
}