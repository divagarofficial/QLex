/**
 * Premium Architectural Corner Lighting
 *
 * Two corner light sources like a luxury showroom:
 *   - Top-right: Warm champagne light entering from outside viewport
 *   - Bottom-left: Cool icy blue light entering from outside viewport
 *
 * Each light hugs its respective edges (top/right or bottom/left).
 * The brightest point is exactly in the corner.
 * Not circular. Not spotlight. Not rays.
 *
 * Uses layered linear + conic + radial gradients for organic corner falloff.
 *
 * Dedicated mobile layout: increased corner intensity, reduced spread.
 * Completely static. CSS gradients only. No animation.
 */

/* ─── TOP-RIGHT CORNER GOLDEN ───
     Light hugs the top edge and right edge.
     Brightest at the corner itself.
     Linear gradients create edge-hugging light.
     Conic gradients control corner spread.
     Radial gradient for the bright core. */

const CornerGoldenDesktop = () => (
  <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
    {/* Layer 1: Linear edge highlights — light bleeding along top and right edges */}
    <div
      className="absolute inset-0"
      style={{
        background: `
          /* Top edge light — bleeding inward from the top-right corner */
          linear-gradient(
            180deg,
            rgba(255,248,234,0.06) 0%,
            rgba(248,226,160,0.03) 15%,
            transparent 45%
          ),
          /* Right edge light — bleeding inward from the top-right corner */
          linear-gradient(
            270deg,
            rgba(255,248,234,0.06) 0%,
            rgba(248,226,160,0.03) 15%,
            transparent 45%
          )
        `,
      }}
    />

    {/* Layer 2: Conic corner spread — controls the angular falloff from the corner */}
    <div
      className="absolute top-0 right-0 h-[80vh] w-[80vh]"
      style={{
        background: `
          conic-gradient(
            from 0deg at 100% 0%,
            rgba(255,248,234,0.10) 0deg,
            rgba(248,226,160,0.06) 15deg,
            rgba(231,200,115,0.04) 30deg,
            rgba(231,200,115,0.02) 45deg,
            transparent 60deg
          )
        `,
        filter: "blur(20px)",
      }}
    />

    {/* Layer 3: Radial core at the corner — brightest point */}
    <div
      className="absolute top-0 right-0 h-[400px] w-[400px]"
      style={{
        background: `
          radial-gradient(
            ellipse 60% 55% at 100% 0%,
            rgba(255,248,234,0.14) 0%,
            rgba(248,226,160,0.08) 15%,
            rgba(231,200,115,0.04) 30%,
            rgba(231,200,115,0.02) 50%,
            transparent 75%
          )
        `,
        filter: "blur(15px)",
      }}
    />

    {/* Layer 4: Wide ambient corner glow — very soft, expands the corner presence */}
    <div
      className="absolute top-0 right-0 h-[90vh] w-[90vh]"
      style={{
        background: `
          radial-gradient(
            ellipse 50% 45% at 100% 0%,
            rgba(248,226,160,0.04) 0%,
            rgba(231,200,115,0.02) 25%,
            rgba(216,174,86,0.01) 50%,
            transparent 75%
          )
        `,
        filter: "blur(60px)",
      }}
    />
  </div>
);

const CornerGoldenMobile = () => (
  <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
    {/* Linear edge highlights — stronger on mobile */}
    <div
      className="absolute inset-0"
      style={{
        background: `
          linear-gradient(
            180deg,
            rgba(255,248,234,0.10) 0%,
            rgba(248,226,160,0.05) 12%,
            transparent 35%
          ),
          linear-gradient(
            270deg,
            rgba(255,248,234,0.10) 0%,
            rgba(248,226,160,0.05) 12%,
            transparent 35%
          )
        `,
      }}
    />

    {/* Conic corner spread — tighter */}
    <div
      className="absolute top-0 right-0 h-[50vh] w-[50vh]"
      style={{
        background: `
          conic-gradient(
            from 0deg at 100% 0%,
            rgba(255,248,234,0.14) 0deg,
            rgba(248,226,160,0.09) 15deg,
            rgba(231,200,115,0.05) 30deg,
            transparent 50deg
          )
        `,
        filter: "blur(12px)",
      }}
    />

    {/* Radial core — more intense */}
    <div
      className="absolute top-0 right-0 h-[250px] w-[250px]"
      style={{
        background: `
          radial-gradient(
            ellipse 55% 50% at 100% 0%,
            rgba(255,248,234,0.20) 0%,
            rgba(248,226,160,0.12) 15%,
            rgba(231,200,115,0.06) 30%,
            transparent 65%
          )
        `,
        filter: "blur(10px)",
      }}
    />

    {/* Ambient glow — tighter */}
    <div
      className="absolute top-0 right-0 h-[55vh] w-[55vh]"
      style={{
        background: `
          radial-gradient(
            ellipse 45% 40% at 100% 0%,
            rgba(248,226,160,0.06) 0%,
            rgba(231,200,115,0.03) 25%,
            transparent 60%
          )
        `,
        filter: "blur(40px)",
      }}
    />
  </div>
);

/* ─── BOTTOM-LEFT CORNER ICE BLUE ───
     Light hugs the bottom edge and left edge.
     Brightest at the corner itself.
     Same approach: linear + conic + radial. */

const CornerBlueDesktop = () => (
  <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
    {/* Layer 1: Linear edge highlights — bleeding along bottom and left edges */}
    <div
      className="absolute inset-0"
      style={{
        background: `
          /* Bottom edge light */
          linear-gradient(
            0deg,
            rgba(244,252,255,0.05) 0%,
            rgba(223,246,255,0.03) 15%,
            transparent 45%
          ),
          /* Left edge light */
          linear-gradient(
            90deg,
            rgba(244,252,255,0.05) 0%,
            rgba(223,246,255,0.03) 15%,
            transparent 45%
          )
        `,
      }}
    />

    {/* Layer 2: Conic corner spread */}
    <div
      className="absolute bottom-0 left-0 h-[75vh] w-[75vh]"
      style={{
        background: `
          conic-gradient(
            from 180deg at 0% 100%,
            rgba(244,252,255,0.08) 0deg,
            rgba(223,246,255,0.05) 15deg,
            rgba(199,240,255,0.03) 30deg,
            rgba(155,215,255,0.02) 45deg,
            transparent 60deg
          )
        `,
        filter: "blur(20px)",
      }}
    />

    {/* Layer 3: Radial core at the corner */}
    <div
      className="absolute bottom-0 left-0 h-[380px] w-[380px]"
      style={{
        background: `
          radial-gradient(
            ellipse 55% 50% at 0% 100%,
            rgba(244,252,255,0.11) 0%,
            rgba(223,246,255,0.07) 15%,
            rgba(199,240,255,0.03) 30%,
            rgba(155,215,255,0.015) 50%,
            transparent 75%
          )
        `,
        filter: "blur(15px)",
      }}
    />

    {/* Layer 4: Wide ambient corner glow */}
    <div
      className="absolute bottom-0 left-0 h-[85vh] w-[85vh]"
      style={{
        background: `
          radial-gradient(
            ellipse 45% 40% at 0% 100%,
            rgba(223,246,255,0.03) 0%,
            rgba(199,240,255,0.015) 25%,
            rgba(155,215,255,0.008) 50%,
            transparent 75%
          )
        `,
        filter: "blur(60px)",
      }}
    />
  </div>
);

const CornerBlueMobile = () => (
  <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
    {/* Linear edge highlights — stronger */}
    <div
      className="absolute inset-0"
      style={{
        background: `
          linear-gradient(
            0deg,
            rgba(244,252,255,0.08) 0%,
            rgba(223,246,255,0.05) 12%,
            transparent 35%
          ),
          linear-gradient(
            90deg,
            rgba(244,252,255,0.08) 0%,
            rgba(223,246,255,0.05) 12%,
            transparent 35%
          )
        `,
      }}
    />

    {/* Conic corner spread — tighter */}
    <div
      className="absolute bottom-0 left-0 h-[45vh] w-[45vh]"
      style={{
        background: `
          conic-gradient(
            from 180deg at 0% 100%,
            rgba(244,252,255,0.12) 0deg,
            rgba(223,246,255,0.08) 15deg,
            rgba(199,240,255,0.04) 30deg,
            transparent 50deg
          )
        `,
        filter: "blur(12px)",
      }}
    />

    {/* Radial core — more intense */}
    <div
      className="absolute bottom-0 left-0 h-[230px] w-[230px]"
      style={{
        background: `
          radial-gradient(
            ellipse 50% 45% at 0% 100%,
            rgba(244,252,255,0.16) 0%,
            rgba(223,246,255,0.10) 15%,
            rgba(199,240,255,0.05) 30%,
            transparent 65%
          )
        `,
        filter: "blur(10px)",
      }}
    />

    {/* Ambient glow */}
    <div
      className="absolute bottom-0 left-0 h-[50vh] w-[50vh]"
      style={{
        background: `
          radial-gradient(
            ellipse 40% 35% at 0% 100%,
            rgba(223,246,255,0.05) 0%,
            rgba(199,240,255,0.025) 25%,
            transparent 60%
          )
        `,
        filter: "blur(40px)",
      }}
    />
  </div>
);

function DesktopLighting() {
  return (
    <>
      <CornerGoldenDesktop />
      <CornerBlueDesktop />

      {/* Central zone — subtle ambient where corners meet */}
      <div
        className="absolute left-1/2 top-1/2 h-[40vh] w-[60vh] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,255,255,0.012) 0%, transparent 60%)",
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

function MobileLighting() {
  return (
    <>
      <CornerGoldenMobile />
      <CornerBlueMobile />

      <div
        className="absolute left-1/2 top-1/2 h-[30vh] w-[40vh] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,255,255,0.015) 0%, transparent 55%)",
          filter: "blur(70px)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

export default function AuroraBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden">
      {/* Base: Obsidian */}
      <div className="absolute inset-0 bg-[#030406]" />

      {/* Desktop — md+ */}
      <div className="hidden md:block absolute inset-0">
        <DesktopLighting />
      </div>

      {/* Mobile — below md */}
      <div className="block md:hidden absolute inset-0">
        <MobileLighting />
      </div>

      {/* Soft vignette — purely depth, not a light */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(0,0,0,0.30) 70%, rgba(0,0,0,0.50) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[20vh]"
        style={{
          background:
            "linear-gradient(to top, rgba(3,4,6,0.70) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

