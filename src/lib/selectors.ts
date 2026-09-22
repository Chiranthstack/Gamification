import type { StoreState } from './store';
import type { Player } from './types';

const EMPTY: Player = { name: '—', uid: '', points: 0, deals: 0, events: 0, role: 'DSE', tl: '', streak: 0, kras: {} };

/** The signed-in employee. */
export function me(s: StoreState): Player {
  const lb = s.data?.leaderboard;
  return lb?.find((p) => p.uid === s.data?.current_uid) || lb?.[0] || EMPTY;
}
export const myDept = (s: StoreState) => me(s).department || 'Sales';
export const myBranch = (s: StoreState) => me(s).branch || 'Yeshwanthpur';
export const aDept = (s: StoreState) => (s.lbDept === 'auto' ? myDept(s) : s.lbDept);
export const aBranch = (s: StoreState) => (s.lbBranch === 'auto' ? myBranch(s) : s.lbBranch);

export interface RosterOpt {
  dept?: string;
  branch?: string;
  role?: string;
  q?: string;
  allDept?: boolean;
  allBranch?: boolean;
}

export function roster(s: StoreState, opt: RosterOpt = {}): Player[] {
  const { dept = aDept(s), branch = aBranch(s), role = s.lbRole, q = s.lbSearch, allDept = false, allBranch = false } = opt;
  return (s.data?.leaderboard || []).filter((p) => {
    if (!allDept && dept && p.department && p.department !== dept) return false;
    if (!allBranch && branch && p.branch && p.branch !== branch) return false;
    if (role && role !== 'all' && p.role !== role) return false;
    if (q && !(p.name || '').toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
}

export const byPts = (list: Player[]) => list.slice().sort((a, b) => (b.points || 0) - (a.points || 0));

/** Your division = same role, same branch. Used everywhere a rank is shown. */
export function division(s: StoreState): Player[] {
  const m = me(s);
  return byPts(roster(s, { role: m.role || 'DSE' }));
}

/** Board name display honours the anonymise-boards rule. */
export function shownName(s: StoreState, p: Player, isMe: boolean, i: number): string {
  if (isMe) return 'You';
  if (s.cfg.rules.publicBoards.on) return p.name;
  return 'Player ' + ((i || 0) + 1);
}
