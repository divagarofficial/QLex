"use client";

import { useEffect, useRef, useCallback, useState } from "react";

/**
 * QLex Cursor Light — subtle champagne glow following the cursor.
 *
 * Performance optimized:
 * - Disabled entirely on touch devices
 * - Reduced radius to 300px for lighter GPU load
 * - Uses RAF with requestAnimationFrame cleanup
 */

export default function CursorLight() {
  const lightRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const posRef = useRef({ x: -200, y: -200 });
  const targetRef = useRef({ x: -200, y: -200 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch device
    const isTouch = matchMedia("(pointer: coarse)").matches;
    setIsTouchDevice(isTouch);
  }, []);

  const animate = useCallback(() => {
    const pos = posRef.current;
    const target = targetRef.current;
    pos.x += (target.x - pos.x) * 0.08;
    pos.y += (target.y - pos.y) * 0.08;

    if (lightRef.current) {
      lightRef.current.style.setProperty("--cursor-x", `${pos.x}px`);
      lightRef.current.style.setProperty("--cursor-y", `${pos.y}px`);
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    const handleMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleLeave = () => {
      targetRef.current = { x: -200, y: -200 };
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mouseleave", handleLeave, { passive: true });

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate, isTouchDevice]);

  if (isTouchDevice) return null;

  return (
    <div
      ref={lightRef}
      className="pointer-events-none fixed inset-0 -z-40"
      style={{
        background:
          "radial-gradient(300px at var(--cursor-x, -200px) var(--cursor-y, -200px), rgba(231,200,115,0.04) 0%, transparent 70%)",
      }}
    />
  );
}

