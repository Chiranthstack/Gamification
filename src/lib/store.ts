'use client';

import { create } from 'zustand';
import type {
  BootstrapData, Contest, Role, Tier, CodeRow, KraTemplate, KraRow, Quest, Cfg, Notif, ToastState, SheetKind, Season, RuleFlag, BoardCfg,
} from './types';
import {
  DEFAULT_TIERS, DEFAULT_ROLES, DEFAULT_KRA_TEMPLATES, DEFAULT_CODES, DEFAULT_RULES, DEFAULT_BOARDS,
  DEFAULT_DEPT_MULT, DEFAULT_LEVEL_STEP, BADGES, makeDailyDefaults,
} from './constants';
import { FALLBACK_DATA, FALLBACK_CONTESTS } from './fallback-data';
import { NAV } from './constants';
import { myRole, navAllowed } from './roles';
import { buildNotifs } from './notifs';

const THEME_KEY = 'cv_theme';
const SIDE_KEY = 'cv_side';

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export interface StoreState {
  // ── Data ──
  data: BootstrapData | null;
  contests: Contest[];
  offline: boolean;
  connecting: boolean;

  // ── Configurable model (editable in the console) ──
  roles: Role[];
  tiers: Tier[];
  codes: CodeRow[];
  codeOn: Record<string, boolean>;
  kraTemplates: Record<string, KraTemplate>;
  kraModel: KraRow[];
  daily: Quest[];
  deptMult: Record<string, number>;
  cfg: Cfg;

  // ── UI state (the original `S`) ──
  route: string;
  viewAs: string | null;
  cfgSec: string;
  board: string;
  contestTab: string;
  mineTab: string;
  brMode: string;
  lbDept: string;
  lbBranch: string;
  lbRole: string;
  lbSearch: string;

  // ── Auth (demo) ──
  authed: boolean;

  // ── Chrome ──
  theme: 'light' | 'dark';
  sideNarrow: boolean;
  sideOpen: boolean;
  notifOpen: boolean;
  sheet: SheetKind;
  toast: ToastState | null;
  notifs: Notif[];
  cfgDirty: number;
  rev: number; // bumped after any in-place model mutation to force re-render

  // ── Actions ──
  boot: () => Promise<void>;
  go: (r: string) => void;
  setRoute: (r: string) => void;
  setViewAs: (id: string | null) => void;
  toggleTheme: () => void;
  applyThemeToDom: () => void;
  toggleSideWidth: () => void;
  setSideOpen: (v: boolean) => void;
  setNotifOpen: (v: boolean) => void;
  closeAll: () => void;
  openSheet: (s: SheetKind) => void;
  closeSheet: () => void;
  pushToast: (title: string, desc?: string, kind?: ToastState['kind']) => void;
  joinContest: (id: string, silent?: boolean) => void;
  setUI: (patch: Partial<StoreState>) => void;
  edit: (fn: (s: StoreState) => void, dirtyInc?: number) => void;
  useKraFor: (roleId: string) => void;
  rebuildNotifs: () => void;
  readNotif: (i: number) => void;
  clearNotifs: () => void;
  markSaved: () => void;
  login: (roleId: string) => void;
  logout: () => void;
}

const AUTH_KEY = 'cv_auth';

function defaultSeason(): Season {
  return { name: 'Q3 FY26', start: '2026-07-01', end: '2026-09-30', levelStep: DEFAULT_LEVEL_STEP, resetDay: 'Mon', currency: '₹', pointsLabel: 'pointers' };
}

export const useStore = create<StoreState>((set, get) => ({
  data: FALLBACK_DATA,
  contests: FALLBACK_CONTESTS.slice(),
  offline: true,
  connecting: false,

  roles: clone(DEFAULT_ROLES),
  tiers: clone(DEFAULT_TIERS),
  codes: clone(DEFAULT_CODES) as CodeRow[],
  codeOn: {},
  kraTemplates: clone(DEFAULT_KRA_TEMPLATES),
  kraModel: clone(DEFAULT_KRA_TEMPLATES).sales.rows,
  daily: makeDailyDefaults(),
  deptMult: DEFAULT_DEPT_MULT(),
  cfg: {
    season: defaultSeason(),
    rules: DEFAULT_RULES() as Record<string, RuleFlag>,
    clawbackPct: 50,
    boards: DEFAULT_BOARDS() as BoardCfg[],
    badges: Object.fromEntries(BADGES.map((b) => [b.id, true])),
  },

  route: 'home',
  viewAs: null,
  cfgSec: 'season',
  board: 'division',
  contestTab: 'live',
  mineTab: 'sheet',
  brMode: 'total',
  lbDept: 'auto',
  lbBranch: 'auto',
  lbRole: 'all',
  lbSearch: '',

  authed: false,
  theme: 'light',
  sideNarrow: false,
  sideOpen: false,
  notifOpen: false,
  sheet: { type: 'none' },
  toast: null,
  notifs: [],
  cfgDirty: 0,
  rev: 0,

  boot: async () => {
    // Read persisted chrome prefs.
    let theme: 'light' | 'dark' = 'light';
    let narrow = false;
    let authRole: string | null = null;
    try {
      theme = (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light';
      narrow = localStorage.getItem(SIDE_KEY) === 'narrow';
      authRole = localStorage.getItem(AUTH_KEY);
    } catch {}
    // Resolve initial route from the hash.
    let route = 'home';
    if (typeof location !== 'undefined') route = location.hash.replace('#/', '') || 'home';

    // Restore a persisted demo session, if any.
    const own = get().data?.leaderboard?.find((p) => p.uid === get().data?.current_uid)?.role || 'DSE';
    const restoredViewAs = authRole ? (authRole !== own ? authRole : null) : null;

    set({ theme, sideNarrow: narrow, route, authed: !!authRole, viewAs: restoredViewAs });
    get().applyThemeToDom();
    get().useKraFor(restoredViewAs || own);
    get().rebuildNotifs();

    // Try the live backend; fall back to the bundled sample set.
    const { attemptBackend } = await import('./api');
    await attemptBackend(set, get);
  },

  go: (r) => {
    if (typeof location !== 'undefined') location.hash = '#/' + r;
    set({ route: r, sideOpen: false, notifOpen: false });
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  },

  setRoute: (r) => set({ route: r }),

  setViewAs: (id) => {
    const s = get();
    const own = s.data?.leaderboard?.find((p) => p.uid === s.data?.current_uid)?.role || 'DSE';
    const viewAs = id && id !== own ? id : null;
    set({ viewAs, sheet: { type: 'none' } });
    get().useKraFor(viewAs || own);
    // Bounce off a screen the previewed role cannot see.
    const st = get();
    const role = myRole(st);
    const nav = NAV.find((n) => n.r === st.route);
    if (nav && !navAllowed(nav, st, role)) set({ route: 'home' });
    get().pushToast('Viewing as ' + role.label, viewAs ? 'Preview only — nothing is saved as this role' : 'Back to your own view', 'info');
  },

  toggleTheme: () => {
    const now = get().theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(THEME_KEY, now); } catch {}
    set({ theme: now });
    get().applyThemeToDom();
  },

  applyThemeToDom: () => {
    if (typeof document === 'undefined') return;
    const t = get().theme;
    document.documentElement.setAttribute('data-theme', t);
    const mc = document.querySelector('meta[name="theme-color"]');
    if (mc) mc.setAttribute('content', t === 'dark' ? '#0D1117' : '#F7F8FA');
  },

  toggleSideWidth: () => {
    const narrow = !get().sideNarrow;
    try { localStorage.setItem(SIDE_KEY, narrow ? 'narrow' : 'wide'); } catch {}
    set({ sideNarrow: narrow });
  },
  setSideOpen: (v) => set({ sideOpen: v }),
  setNotifOpen: (v) => set({ notifOpen: v }),
  closeAll: () => set({ sideOpen: false, notifOpen: false }),

  openSheet: (s) => set({ sheet: s }),
  closeSheet: () => set({ sheet: { type: 'none' } }),

  pushToast: (title, desc = '', kind = 'ok') => set({ toast: { title, desc, kind, seq: Date.now() } }),

  joinContest: (id, silent) => {
    const contests = get().contests.map((c) => (c.id === id ? { ...c, joined: !c.joined } : c));
    const c = contests.find((x) => x.id === id);
    set({ contests });
    if (c?.joined && !silent) get().pushToast('Joined "' + c.name + '"', 'Good luck — your standing updates live');
    get().rebuildNotifs();
  },

  setUI: (patch) => set(patch as Partial<StoreState>),

  edit: (fn, dirtyInc = 1) => {
    const s = get();
    fn(s);
    set({ rev: s.rev + 1, cfgDirty: s.cfgDirty + dirtyInc });
  },

  useKraFor: (roleId) => {
    const s = get();
    const role = s.roles.find((r) => r.id === roleId) || s.roles.find((r) => r.id === 'DSE') || s.roles[0];
    const key = role?.kra || 'sales';
    set({ kraModel: (s.kraTemplates[key] || s.kraTemplates.sales).rows });
  },

  rebuildNotifs: () => {
    set({ notifs: buildNotifs(get()) });
  },
  readNotif: (i) => {
    const notifs = get().notifs.slice();
    const n = notifs[i];
    if (!n) return;
    n.unread = false;
    set({ notifs });
    if (n.go) get().go(n.go);
  },
  clearNotifs: () => {
    set({ notifs: get().notifs.map((n) => ({ ...n, unread: false })) });
  },

  markSaved: () => set({ cfgDirty: 0 }),

  login: (roleId) => {
    const s = get();
    const own = s.data?.leaderboard?.find((p) => p.uid === s.data?.current_uid)?.role || 'DSE';
    const viewAs = roleId && roleId !== own ? roleId : null;
    try { localStorage.setItem(AUTH_KEY, roleId); } catch {}
    set({ authed: true, viewAs, route: 'home', sheet: { type: 'none' }, sideOpen: false, notifOpen: false });
    get().useKraFor(viewAs || own);
    get().rebuildNotifs();
    if (typeof location !== 'undefined') location.hash = '#/home';
  },

  logout: () => {
    try { localStorage.removeItem(AUTH_KEY); } catch {}
    set({ authed: false, viewAs: null, sheet: { type: 'none' }, sideOpen: false, notifOpen: false });
  },
}));

// Convenience non-hook accessors used by imperative helpers.
export const getState = useStore.getState;
export const setState = useStore.setState;
