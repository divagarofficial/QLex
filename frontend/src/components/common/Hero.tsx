import GlassButton from "../glass/GlassButton";
import FloatingCards from "./FloatingCards";


export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center px-6">

      <div className="mx-auto max-w-6xl text-center">

        <div className="inline-flex rounded-full border border-yellow-500/20 bg-yellow-500/10 px-5 py-2 backdrop-blur-xl">

          <span className="text-sm font-medium text-yellow-300">

            ✨ AI Powered Printing

          </span>

        </div>
        <div className="hero-orb" />

        <h1 className="mt-8 hero-title">

          QLex

        </h1>

        <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-zinc-300">

          The next generation campus printing platform.

          Upload your documents, skip the queue,

          pay online and collect your prints effortlessly.

        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-6">

          <GlassButton>

            Get Started

          </GlassButton>

          <button
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-white backdrop-blur-xl transition duration-300 hover:border-yellow-400/30 hover:bg-white/10"
          >
            Watch Demo
          </button>

        </div>

      </div>
      <FloatingCards />

    </section>
  );
}