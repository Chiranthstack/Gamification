import type { KraRow } from './types';

export interface KraTotals {
  max: number;
  got: number;
  left: number;
  pct: number;
}

export function kraTotals(kraModel: KraRow[]): KraTotals {
  const max = kraModel.reduce((sm, r) => sm + r.target * r.pts, 0);
  const got = kraModel.reduce((sm, r) => sm + Math.min(r.done, r.target) * r.pts, 0);
  return { max, got, left: max - got, pct: max ? Math.round((got / max) * 100) : 0 };
}

/** Whether a scoresheet row is scored for a given role (empty roles = company-wide). */
export function kraAppliesTo(row: KraRow, roleId: string): boolean {
  if (!row.roles) return true;
  if (!row.roles.length) return true;
  return row.roles.includes(roleId);
}
