import type { Tier } from './types';

export interface Prog {
  level: number;
  into: number;
  pct: number;
  toNext: number;
  tier: Tier;
  next: Tier | null;
  toTier: number;
}

/** Level + named tier for a point total. */
export function prog(pts: number, levelStep: number, tiers: Tier[]): Prog {
  pts = pts || 0;
  const step = Math.max(250, levelStep || 2500);
  const level = Math.floor(pts / step) + 1;
  const into = pts % step;
  const pct = Math.round((into / step) * 100);
  let tier = tiers[0];
  let next: Tier | null = null;
  for (let i = 0; i < tiers.length; i++) {
    if (pts >= tiers[i].min) tier = tiers[i];
    else {
      next = tiers[i];
      break;
    }
  }
  return { level, into, pct, toNext: step - into, tier, next, toTier: next ? next.min - pts : 0 };
}
