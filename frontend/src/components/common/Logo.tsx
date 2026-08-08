export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-blue-500/40 blur-xl" />

        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-2xl font-black text-transparent">
            Q
          </span>
        </div>
      </div>

      <div>
        <h1 className="bg-gradient-to-r from-white via-blue-200 to-violet-300 bg-clip-text text-3xl font-black tracking-tight text-transparent">
          QLex
        </h1>

        <p className="text-xs text-zinc-400">
          Upload to Pickup
        </p>
      </div>
    </div>
  );
}