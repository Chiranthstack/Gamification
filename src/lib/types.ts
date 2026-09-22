// ── Domain types ──────────────────────────────────────────────────────────
// Shapes mirror the backend bootstrap payload (see README "Backend contract").

export interface Player {
  uid: string;
  name: string;
  points: number;
  deals: number;
  events: number;
  role: string;
  tl: string;
  streak: number;
  department?: string;
  branch?: string;
  kras?: Record<string, number>;
  /** Optional real per-day series: { "YYYY-MM-DD": points }. */
  daily?: Record<string, number>;
}

export interface RecentEvent {
  uid: string;
  name: string;
  ac: string;
  pts: number;
  enq?: string;
  date?: string;
}

/** [name, weight, unit, blurb] — the header KRA list from the sheet. */
export type KraHeader = [string, number, string, string];

export interface BootstrapData {
  kras: KraHeader[];
  leaderboard: Player[];
  recent: RecentEvent[];
  codes: Record<string, number>;
  current_uid: string;
}

export interface Contest {
  id: string;
  fmt: string;
  name: string;
  desc: string;
  prize: string;
  time: string;
  state: 'live' | 'upc' | 'ended';
  players: number;
  joined: boolean;
  rank?: number;
  winner?: string;
}

// ── Configurable model ──────────────────────────────────────────────────────

export interface Tier {
  name: string;
  min: number;
  c: string;
  l: string;
  g: string;
}

export interface KraRow {
  name: string;
  grp: string;
  target: number;
  pts: number;
  done: number;
  icon: string;
  roles?: string[];
}

export interface KraTemplate {
  label: string;
  rows: KraRow[];
}

export interface Badge {
  id: string;
  icon: string;
  name: string;
  hint: string;
  at: (p: Player, rank?: number) => number;
  goal: number;
  unit: 'deal' | 'score' | 'day' | 'rank';
}

export interface ComputedBadge extends Badge {
  at: number & { (p: Player, rank?: number): number }; // narrowed at call sites
  on: boolean;
  pct: number;
  c?: string;
  l?: string;
}

export interface Role {
  id: string;
  lvl?: string;
  label: string;
  alt?: string;
  scope: 'self' | 'team' | 'branch' | 'org';
  kra: string;
  perms: string[];
}

export interface BoardCfg {
  key: string;
  t: string;
  scope: 'role' | 'branch' | 'dept' | 'all';
  on: boolean;
  top: number;
  tie: 'deals' | 'events' | 'streak' | 'name';
}

export interface RuleFlag {
  on: boolean;
  t: string;
  d: string;
}

export interface Quest {
  t: string;
  goal: number;
  done: number;
  icon: string;
  pts: number;
}

/** [code, label, kind, points] */
export type CodeRow = [string, string, string, number];

export interface Season {
  name: string;
  start: string;
  end: string;
  levelStep: number;
  resetDay: string;
  currency: string;
  pointsLabel: string;
}

export interface Cfg {
  season: Season;
  rules: Record<string, RuleFlag>;
  clawbackPct: number;
  boards: BoardCfg[];
  badges: Record<string, boolean>;
}

/** Transient UI state (the original module-level `S`). */
export interface UIState {
  route: string;
  viewAs: string | null;
  cfgSec: string;
  lbDept: string;
  lbBranch: string;
  lbRole: string;
  lbSearch: string;
  contestTab: string;
  mineTab: string;
  brMode: string;
  board: string;
  deptMult: Record<string, number>;
}

export interface Notif {
  c: string;
  g: string;
  i: string;
  unread: boolean;
  t: string;
  d: string;
  tm: string;
  go: string;
}

export interface ToastState {
  title: string;
  desc: string;
  kind: 'ok' | 'warn' | 'info';
  seq: number;
}

export type SheetKind =
  | { type: 'none' }
  | { type: 'coach' }
  | { type: 'scoring' }
  | { type: 'grading' }
  | { type: 'roles' }
  | { type: 'palette' }
  | { type: 'contest'; id: string }
  | { type: 'player'; uid: string; rank: number };
