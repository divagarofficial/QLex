import Logo from "../common/Logo";
import GlassButton from "../glass/GlassButton";

export default function Navbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          <a className="text-zinc-300 transition hover:text-white" href="#">
            Features
          </a>

          <a className="text-zinc-300 transition hover:text-white" href="#">
            Pricing
          </a>

          <a className="text-zinc-300 transition hover:text-white" href="#">
            Contact
          </a>
        </nav>

        <GlassButton>
          Login
        </GlassButton>
      </div>
    </header>
  );
}