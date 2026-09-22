import { seeded } from './format';
import type { Player } from './types';

// ── Weekly & month activity series (deterministic, seeded per person) ──

export function weekSeries(p: Player): number[] {
  const r = seeded('wk' + (p.uid || 'x'));
  const base = (p.points || 0) / 30;
  return [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const dayW = [0.6, 1, 1.2, 1.3, 1.1, 1.4, 0.8][i];
    return Math.round(base * dayW * (0.7 + r() * 0.6));
  });
}

export const MONTH_DAYS = 35; // 5 calendar weeks
const dkey = (d: Date) => d.toISOString().slice(0, 10);

export interface MonthCell {
  d: Date;
  v: number;
  future: boolean;
  today: boolean;
  lv?: number;
}

export function monthSeries(pl?: Player): MonthCell[] {
  const real = pl && pl.daily && typeof pl.daily === 'object' ? pl.daily : null;
  const r = seeded('mo' + ((pl && pl.uid) || 'x'));
  const base = ((pl && pl.points) || 0) / 30;
  const out: MonthCell[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // End the grid on the Sunday of the current week so rows are whole.
  const endShift = 7 - (today.getDay() === 0 ? 7 : today.getDay());
  const end = new Date(today);
  end.setDate(end.getDate() + endShift);
  for (let i = MONTH_DAYS - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const future = d > today;
    let v: number;
    if (future) v = 0;
    else if (real) v = Number(real[dkey(d)] || 0);
    else {
      const dow = [0.55, 1, 1.15, 1.2, 1.1, 1.3, 0.7][d.getDay() === 0 ? 6 : d.getDay() - 1];
      v = r() < 0.16 ? 0 : Math.round(base * dow * (0.55 + r() * 0.9));
    }
    out.push({ d, v, future, today: +d === +today });
  }
  return out;
}

export function monthLevels(series: MonthCell[]): MonthCell[] {
  const on = series
    .filter((x) => !x.future && x.v > 0)
    .map((x) => x.v)
    .sort((a, b) => a - b);
  const med = on.length ? on[Math.floor(on.length / 2)] : 1;
  return series.map((x) => ({
    ...x,
    lv: x.future ? -1 : x.v <= 0 ? 0 : x.v < med * 0.7 ? 1 : x.v < med * 1.3 ? 2 : 3,
  }));
}

export function longestRun(series: MonthCell[]): number {
  let best = 0,
    run = 0;
  series
    .filter((x) => !x.future)
    .forEach((x) => {
      if (x.v > 0) {
        run++;
        if (run > best) best = run;
      } else run = 0;
    });
  return best;
}

/** The single streak value shown app-wide. Real p.streak wins once p.daily arrives. */
export function curStreak(pl?: Player): number {
  if (!pl) return 0;
  if (pl.daily && typeof pl.daily === 'object') return pl.streak || 0;
  const past = monthSeries(pl).filter((x) => !x.future);
  let n = 0;
  for (let i = past.length - 1; i >= 0; i--) {
    if (past[i].v > 0) n++;
    else break;
  }
  return n;
}
