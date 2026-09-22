import type { Player } from './types';
import { curStreak } from './series';

export function kraAverage(p: Player): number {
  const v = Object.values(p.kras || {}).filter((n) => typeof n === 'number' && n > 0) as number[];
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
}

export interface Health {
  pace: number;
  flag: 'ok' | 'watch' | 'risk';
  why: string;
  score: number;
  median: number;
}

/** Health measured against the company median for the person's own role. */
export function teamHealth(p: Player, peers: Player[]): Health {
  const mine = kraAverage(p);
  const pool = (peers || [])
    .filter((x) => x.role === p.role)
    .map(kraAverage)
    .filter((n) => n > 0)
    .sort((a, b) => a - b);
  const median = pool.length ? pool[Math.floor(pool.length / 2)] : mine || 1;
  const pace = median ? mine / median : 1;
  let flag: Health['flag'] = 'ok';
  let why = `At the company median for a ${p.role || 'DSE'}`;
  if (pace >= 1.1) why = `Ahead of the company median for a ${p.role || 'DSE'}`;
  else if (pace < 0.75) { flag = 'risk'; why = 'Well below the company median for their role'; }
  else if (pace < 0.92) { flag = 'watch'; why = 'Drifting below the company median for their role'; }
  if (!curStreak(p)) { flag = flag === 'ok' ? 'watch' : flag; why = 'No scoring activity logged'; }
  return { pace, flag, why, score: Math.round(mine), median: Math.round(median) };
}
