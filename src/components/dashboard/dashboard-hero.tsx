"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SparklesIcon } from "@/components/icons";
import { AsciiDroplet } from "@/components/ascii-droplet";

export function DashboardHero({
  name,
  monthName,
  year,
}: {
  name: string;
  monthName: string;
  year: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from("[data-hero='badge']", { opacity: 0, y: -12, duration: 0.5 })
        .from("[data-hero='title']", { opacity: 0, y: 18, duration: 0.6 }, "-=0.25")
        .from("[data-hero='subtitle']", { opacity: 0, y: 14, duration: 0.5 }, "-=0.35")
        .from(
          "[data-hero='glow']",
          { opacity: 0, scale: 0.6, duration: 1.1, ease: "power2.out" },
          0
        );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden rounded-md border border-white/10 bg-white/[0.03] px-6 py-8 text-white sm:px-8"
    >
      <div
        data-hero="glow"
        className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl"
      />
      <div
        data-hero="glow"
        className="pointer-events-none absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-brand-400/10 blur-3xl"
      />
      <AsciiDroplet
        animated={false}
        className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 text-[8px] text-white/[0.07] md:block"
      />
      <div className="relative">
        <p
          data-hero="badge"
          className="font-mono text-[11px] text-brand-400/80"
        >
          {"// resumen mensual"}
        </p>
        <span
          data-hero="badge"
          className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-brand-400/25 bg-brand-500/10 px-3 py-1 font-mono text-xs font-medium text-brand-300"
        >
          <SparklesIcon />
          {monthName} {year}
        </span>
        <h1
          data-hero="title"
          className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl"
        >
          Hola, {name}
        </h1>
        <p data-hero="subtitle" className="mt-1.5 max-w-md text-sm text-slate-400">
          Este es el resumen de tu trabajo. Registra tus actividades y genera tu
          informe y recibo cuando cierre el mes.
        </p>
      </div>
    </div>
  );
}
