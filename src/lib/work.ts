import type { StoreState } from './store';
import { GRADES } from './constants';
import { seeded } from './format';
import { me } from './selectors';

export interface WorkRow {
  para: string;
  kra: string;
  icon: string;
  good_g: string;
  mid_g: string;
  bad_g: string;
  opportunities: number;
  pts: number;
  good: number;
  mid: number;
  bad: number;
  gain: number;
  loss: number;
  gw: number;
  mw: number;
  bw: number;
}

/** Split each graded parameter's month-to-date volume across three states. */
export function workQueue(s: StoreState): WorkRow[] {
  const m = me(s);
  const r = seeded('wq' + (m.uid || 'x') + new Date().toDateString());
  return GRADES.map((g) => {
    const row = s.kraModel.find((k) => k.name === g.kra);
    const opportunities = row ? row.target : 10;
    const pts = row ? row.pts : 250;
    const logged = row ? Math.min(row.done, opportunities) : 0;
    const good = Math.round(logged * (0.45 + r() * 0.25));
    const mid = Math.max(0, logged - good);
    const bad = Math.max(0, opportunities - logged);
    return {
      para: g.para, kra: g.kra, icon: g.icon, gw: g.gw, mw: g.mw, bw: g.bw,
      good_g: g.good, mid_g: g.mid, bad_g: g.bad,
      opportunities, pts, good, mid, bad,
      gain: Math.round(pts * (g.gw - g.mw)),
      loss: Math.round(pts * (g.gw - g.bw)),
    };
  });
}
