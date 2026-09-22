import type { StoreState } from './store';
import type { CodeRow, KraRow } from './types';

/** The whole season as one exportable JSON document. */
export function cfgSnapshot(s: StoreState) {
  return {
    season: s.cfg.season,
    rules: Object.fromEntries(Object.entries(s.cfg.rules).map(([k, v]) => [k, v.on])),
    clawbackPct: s.cfg.clawbackPct,
    tiers: s.tiers.map((t) => ({ name: t.name, min: t.min })),
    actions: s.codes.map(([code, label, kind, points]) => ({ code, label, kind, points, enabled: s.codeOn[code] !== false })),
    kras: s.kraModel.map((r) => ({ name: r.name, group: r.grp, target: r.target, points: r.pts })),
    departmentMultipliers: s.deptMult,
    boards: s.cfg.boards,
    contests: s.contests.map((c) => ({ id: c.id, name: c.name, format: c.fmt, description: c.desc, prize: c.prize, window: c.time, state: c.state })),
    dailyQuests: s.daily.map((t) => ({ title: t.t, goal: t.goal, points: t.pts })),
    badges: Object.entries(s.cfg.badges).map(([id, enabled]) => ({ id, enabled: !!enabled })),
    roles: s.roles.map((r) => ({ id: r.id, label: r.label, scope: r.scope, kraTemplate: r.kra, permissions: r.perms })),
    kraTemplates: Object.fromEntries(
      Object.entries(s.kraTemplates).map(([k, v]) => [
        k,
        { label: v.label, rows: v.rows.map((r) => ({ name: r.name, group: r.grp, target: r.target, points: r.pts })) },
      ]),
    ),
  };
}

/** Apply an imported ruleset onto the store state (mutates in place). Returns true on success. */
export function applyImport(s: StoreState, j: any): boolean {
  try {
    if (j.season) Object.assign(s.cfg.season, j.season);
    if (j.clawbackPct != null) s.cfg.clawbackPct = +j.clawbackPct;
    if (j.rules) Object.entries(j.rules).forEach(([k, v]) => { if (s.cfg.rules[k]) s.cfg.rules[k].on = !!v; });
    if (Array.isArray(j.tiers)) j.tiers.forEach((t: any, i: number) => { if (s.tiers[i]) { s.tiers[i].name = t.name; s.tiers[i].min = +t.min || 0; } });
    if (Array.isArray(j.actions))
      j.actions.forEach((a: any) => {
        const row = s.codes.find((c) => c[0] === a.code);
        if (row) { row[1] = a.label ?? row[1]; row[2] = a.kind ?? row[2]; row[3] = +a.points; s.codeOn[a.code] = a.enabled !== false; }
        else { s.codes.push([a.code, a.label || a.code, a.kind || 'm', +a.points || 0] as CodeRow); s.codeOn[a.code] = a.enabled !== false; }
      });
    if (j.departmentMultipliers) s.deptMult = j.departmentMultipliers;
    if (Array.isArray(j.boards)) s.cfg.boards = j.boards;
    if (Array.isArray(j.dailyQuests)) {
      s.daily.length = 0;
      j.dailyQuests.forEach((t: any) => s.daily.push({ t: t.title, goal: +t.goal || 1, done: 0, icon: 'i-check-c', pts: +t.points || 0 }));
    }
    if (Array.isArray(j.badges)) j.badges.forEach((b: any) => { s.cfg.badges[b.id] = b.enabled !== false; });
    if (Array.isArray(j.roles)) {
      s.roles.length = 0;
      j.roles.forEach((r: any) => s.roles.push({ id: r.id, label: r.label, scope: r.scope || 'self', kra: r.kraTemplate || 'sales', perms: Array.isArray(r.permissions) ? r.permissions : ['self.view'] }));
    }
    if (j.kraTemplates)
      Object.entries(j.kraTemplates).forEach(([k, v]: [string, any]) => {
        if (!Array.isArray(v?.rows)) return;
        s.kraTemplates[k] = { label: v.label || k, rows: v.rows.map((r: any): KraRow => ({ name: r.name, grp: r.group || 'Pipeline', target: +r.target || 1, pts: +r.points || 0, done: 0, icon: 'i-target' })) };
      });
    // Explicit kras block is the active sheet and outranks the template.
    if (Array.isArray(j.kras)) {
      s.kraModel = j.kras.map((r: any): KraRow => ({ name: r.name, grp: r.group || 'Pipeline', target: +r.target || 1, pts: +r.points || 0, done: 0, icon: 'i-target' }));
    }
    s.cfg.season.levelStep = Math.max(250, +s.cfg.season.levelStep || 2500);
    return true;
  } catch {
    return false;
  }
}
