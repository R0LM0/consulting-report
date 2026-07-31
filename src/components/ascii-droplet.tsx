"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";

const RAMP = " .·:;=+*#%@";
const COLS = 38;
const ROWS = 26;

function hash(x: number, y: number): number {
  const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return h - Math.floor(h);
}

/**
 * Procedurally rasterizes the brand droplet into ASCII characters
 * (density ramp + dither + background stars), in the spirit of ASCII-art
 * sites. Deterministic, so SSR and client render match.
 */
function buildGrid(): string[] {
  const lines: string[] = [];
  const R = ROWS * 0.3;
  const cy = ROWS * 0.68;
  const tipV = ROWS * 0.02;
  const aspect = 0.55; // compensación: un char mono es ~2x más alto que ancho
  const baseV = cy - R * 0.25;
  const baseHalf = R * 0.98;

  function triDepth(u: number, v: number): number {
    if (v < tipV || v > baseV) return -1;
    const t = (v - tipV) / (baseV - tipV);
    return t * baseHalf - Math.abs(u);
  }

  for (let y = 0; y < ROWS; y++) {
    let line = "";
    for (let x = 0; x < COLS; x++) {
      const u = (x - COLS / 2 + 0.5) * aspect;
      const v = y;
      const depth = Math.max(R - Math.hypot(u, v - cy), triDepth(u, v));
      if (depth <= 0) {
        line += hash(x, y) > 0.985 ? "·" : " ";
        continue;
      }
      let intensity = Math.min(1, depth / (R * 0.9));
      const gloss = Math.max(
        0,
        1 - Math.hypot(u + R * 0.35, v - (cy - R * 0.4)) / (R * 0.7)
      );
      intensity *= 1 - gloss * 0.55;
      intensity += (hash(x * 3, y * 5) - 0.5) * 0.28;
      const idx = Math.max(
        1,
        Math.min(RAMP.length - 1, Math.round(intensity * (RAMP.length - 1)))
      );
      line += RAMP[idx];
    }
    lines.push(line);
  }
  return lines;
}

export function AsciiDroplet({
  className = "",
  animated = true,
}: {
  className?: string;
  animated?: boolean;
}) {
  const lines = useMemo(() => buildGrid(), []);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!animated || !root) return;

    const ctx = gsap.context(() => {
      const chars = root.querySelectorAll("[data-char]");
      // Revelado aleatorio tipo "descifrado"
      gsap.fromTo(
        chars,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.01,
          stagger: { each: 0.0012, from: "random" },
        }
      );
      // Twinkle infinito: caracteres que parpadean suavemente
      gsap.to(chars, {
        opacity: 0.25,
        duration: 1.5,
        ease: "sine.inOut",
        stagger: { each: 0.006, from: "random", grid: [ROWS, COLS] },
        repeat: -1,
        yoyo: true,
        repeatDelay: 1.8,
      });
    }, root);

    return () => ctx.revert();
  }, [animated]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={`font-mono leading-[1.15] select-none ${className}`}
    >
      {lines.map((line, y) => (
        <div key={y} className="whitespace-pre">
          {line.split("").map((ch, x) => (
            <span key={x} data-char>
              {ch === " " ? " " : ch}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
