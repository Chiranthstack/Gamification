import { BADGES } from './constants';
import type { Player, Cfg } from './types';

export interface ComputedBadge {
  id: string;
  icon: string;
  name: string;
  hint: string;
  goal: number;
  unit: 'deal' | 'score' | 'day' | 'rank';
  at: number;
  on: boolean;
  pct: number;
}

export function badgesFor(p: Player, rank: number | undefined, cfg: Cfg): ComputedBadge[] {
  return BADGES.filter((b) => cfg.badges[b.id] !== false).map((b) => {
    const at = b.at(p, rank);
    return {
      id: b.id, icon: b.icon, name: b.name, hint: b.hint, goal: b.goal, unit: b.unit,
      at, on: at >= b.goal, pct: Math.max(0, Math.min(100, Math.round((at / b.goal) * 100))),
    };
  });
}

/** How a locked badge states the remaining gap, in its own unit. */
export function badgeGap(b: ComputedBadge): string {
  if (b.on) return 'Earned';
  const left = b.goal - b.at;
  if (b.unit === 'score') return `${b.at} of ${b.goal}`;
  if (b.unit === 'rank') return 'Reach the top 3';
  if (b.unit === 'day') return `${left} more day${left > 1 ? 's' : ''}`;
  if (b.unit === 'deal') return `${left} more deal${left > 1 ? 's' : ''}`;
  return `${left} to go`;
}
