"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Animated number that counts from 0 to `value` on mount using GSAP.
 */
export function CountUp({
  value,
  duration = 1.2,
  className = "",
  suffix = "",
}: {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
}) {
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = numberRef.current;
    if (!el) return;

    const counter = { current: 0 };
    const tween = gsap.to(counter, {
      current: value,
      duration,
      ease: "power3.out",
      onUpdate: () => {
        el.textContent = String(Math.round(counter.current));
      },
    });

    return () => {
      tween.kill();
    };
  }, [value, duration]);

  return (
    <span className={className}>
      <span ref={numberRef}>0</span>
      {suffix}
    </span>
  );
}
