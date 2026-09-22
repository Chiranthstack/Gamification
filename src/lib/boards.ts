import type { StoreState } from './store';
import type { Player } from './types';
import { me, myBranch, myDept, roster, division } from './selectors';

const STYLE: Record<string, { i: string; c: string; g: string }> = {
  role: { i: 'i-users', c: '#8B949E', g: 'rgba(139,148,158,.12)' },
  branch: { i: 'i-building', c: '#8B949E', g: 'rgba(139,148,158,.12)' },
  dept: { i: 'i-layers', c: '#8B949E', g: 'rgba(139,148,158,.12)' },
  all: { i: 'i-globe', c: '#8B949E', g: 'rgba(139,148,158,.12)' },
};

/** Points first, then whichever tie-break the board is configured with. */
export function sortBoard(list: Player[], tie: string): Player[] {
  const k = ({ deals: 'deals', events: 'events', streak: 'streak' } as Record<string, keyof Player>)[tie];
  return list.slice().sort(
    (a, b) =>
      (b.points || 0) - (a.points || 0) ||
      (tie === 'name'
        ? String(a.name || '').localeCompare(String(b.name || ''))
        : ((b[k] as number) || 0) - ((a[k] as number) || 0)),
  );
}

export interface Board {
  key: string;
  t: string;
  s: string;
  i: string;
  c: string;
  g: string;
  top: number;
  list: Player[];
}

export function boards(s: StoreState): Board[] {
  const m = me(s);
  const listFor = (sc: string): Player[] =>
    sc === 'role'
      ? division(s)
      : sc === 'branch'
      ? roster(s, { allDept: true, role: 'all' })
      : sc === 'dept'
      ? roster(s, { allBranch: true, role: 'all' })
      : roster(s, { allDept: true, allBranch: true, role: 'all' });
  const subFor = (sc: string): string =>
    sc === 'role'
      ? `${m.role || 'DSE'} · ${myBranch(s)}`
      : sc === 'branch'
      ? myBranch(s)
      : sc === 'dept'
      ? `${myDept(s)} · all branches`
      : 'Every branch, every role';

  return s.cfg.boards
    .filter((b) => b.on && (b.scope !== 'dept' && b.scope !== 'all' ? true : s.cfg.rules.crossDept.on))
    .map((b) => {
      const st = STYLE[b.scope] || STYLE.branch;
      return {
        key: b.key, t: b.t, s: subFor(b.scope), i: st.i, c: st.c, g: st.g,
        top: Math.max(3, b.top), list: sortBoard(listFor(b.scope), b.tie),
      };
    });
}
