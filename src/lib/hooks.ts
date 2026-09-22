'use client';

import { useEffect, useRef } from 'react';
import { fmt } from './format';

/** Count a number up into a ref'd element (ported from the original `countTo`). */
export function useCountUp(target: number, ms = 900) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      node.textContent = fmt(Math.round(target * e));
      if (k < 1) raf = requestAnimationFrame(step);
      else node.textContent = fmt(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return ref;
}

/** Fire a celebratory confetti burst (ported from `burst`). */
export function burst(cols?: string[]) {
  if (typeof window === 'undefined') return;
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const b = document.createElement('div');
  b.className = 'burst';
  const palette = cols || ['#FFB61F', '#2DD46F', '#2CC9E8', '#A970FF', '#FF8A3D', '#FFFFFF'];
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('i');
    s.style.left = Math.random() * 100 + 'vw';
    s.style.background = palette[i % palette.length];
    s.style.animationDuration = 1.8 + Math.random() * 1.5 + 's';
    s.style.animationDelay = Math.random() * 0.3 + 's';
    if (Math.random() > 0.6) s.style.borderRadius = '50%';
    b.appendChild(s);
  }
  document.body.appendChild(b);
  setTimeout(() => b.remove(), 3800);
}
