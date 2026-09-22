import type { StoreState } from './store';
import { me, division } from './selectors';
import { badgesFor } from './badges';

const VISIT_KEY = 'cv_visit';

export interface VisitSnap {
  ts: number;
  points: number;
  rank: number;
  badges: string[];
}

export function loadVisit(): VisitSnap | null {
  try {
    return JSON.parse(localStorage.getItem(VISIT_KEY) || 'null');
  } catch {
    return null;
  }
}

export function saveVisit(s: StoreState) {
  const m = me(s);
  const rank = division(s).findIndex((p) => p.uid === m.uid) + 1;
  const snap: VisitSnap = {
    ts: Date.now(),
    points: m.points || 0,
    rank,
    badges: badgesFor(m, rank, s.cfg).filter((b) => b.on).map((b) => b.id),
  };
  try {
    localStorage.setItem(VISIT_KEY, JSON.stringify(snap));
  } catch {}
}

export interface VisitDelta {
  pts: number;
  up: number;
  fresh: string[];
  hours: number;
}

export function visitDelta(s: StoreState, last: VisitSnap | null): VisitDelta | null {
  if (!last) return null;
  const m = me(s);
  const rank = division(s).findIndex((p) => p.uid === m.uid) + 1;
  const now = badgesFor(m, rank, s.cfg).filter((b) => b.on).map((b) => b.id);
  const pts = (m.points || 0) - (last.points || 0);
  const up = (last.rank || rank) - rank;
  const fresh = now.filter((id) => !(last.badges || []).includes(id));
  const hours = Math.round((Date.now() - (last.ts || Date.now())) / 36e5);
  if (!pts && !up && !fresh.length) return null;
  return { pts, up, fresh, hours };
}

export const greetWord = () => {
  const h = new Date().getHours();
  return h < 5 ? 'Late night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Evening';
};
