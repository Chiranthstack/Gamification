import type { StoreState } from './store';
import type { Role } from './types';
import type { NavItem } from './constants';
import { me } from './selectors';

export function roleDef(s: StoreState, id: string): Role {
  return s.roles.find((r) => r.id === id) || s.roles.find((r) => r.id === 'DSE') || s.roles[0];
}

/** The role actually in play: signed-in role, unless previewing another. */
export function myRole(s: StoreState): Role {
  return roleDef(s, s.viewAs || me(s).role || 'DSE');
}

export function can(s: StoreState, perm: string): boolean {
  return myRole(s).perms.includes(perm);
}

/** Who this viewer may see, given their scope. Display-only — enforce again server-side. */
export function scopeList(s: StoreState) {
  const m = me(s);
  const r = myRole(s);
  const all = s.data?.leaderboard || [];
  if (r.scope === 'org') return all;
  if (r.scope === 'branch') return all.filter((p) => p.branch === m.branch);
  if (r.scope === 'team') {
    const reports = all.filter((p) => p.tl === m.name);
    return reports.length ? [...reports, m] : all.filter((p) => p.tl && p.tl === m.tl);
  }
  return all.filter((p) => p.uid === m.uid);
}

export function navAllowed(n: NavItem, s: StoreState, role?: Role): boolean {
  const has = (perm?: string) => !perm || (role || myRole(s)).perms.includes(perm);
  return has(n.perm) && (n.r !== 'earnings' || s.cfg.rules.showEarnings.on);
}
