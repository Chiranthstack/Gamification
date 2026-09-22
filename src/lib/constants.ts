import type { Badge, KraTemplate, Role, Tier, CodeRow } from './types';
import { curStreak } from './series';
import { seeded } from './format';

// ── Progression tiers (configurable in the console) ──
export const DEFAULT_LEVEL_STEP = 2500;

export const DEFAULT_TIERS: Tier[] = [
  { name: 'Debutant', min: 0, c: '#7D899E', l: '#A4AEC0', g: 'rgba(125,137,158,.16)' },
  { name: 'Squad', min: 5000, c: '#D08A3C', l: '#EFB878', g: 'rgba(208,138,60,.16)' },
  { name: 'Playing XI', min: 15000, c: '#9AA6BA', l: '#D2DAE8', g: 'rgba(154,166,186,.16)' },
  { name: 'Star Performer', min: 35000, c: '#FFB61F', l: '#FFD979', g: 'rgba(255,182,31,.16)' },
  { name: 'Match Winner', min: 60000, c: '#2CC9E8', l: '#83E6F8', g: 'rgba(44,201,232,.16)' },
  { name: 'Hall of Fame', min: 100000, c: '#A970FF', l: '#CBA9FF', g: 'rgba(169,112,255,.16)' },
];

// ── Achievements — earned automatically from real scoring data ──
export const BADGES: Badge[] = [
  { id: 'first', icon: 'i-file', name: 'Off the Mark', hint: 'Your first credited booking', at: (p) => p.deals || 0, goal: 1, unit: 'deal' },
  { id: 'drive', icon: 'i-car', name: 'Road Tested', hint: '55+ on test drives', at: (p) => p.kras?.['Test Drives'] || 0, goal: 55, unit: 'score' },
  { id: 'exch', icon: 'i-swap', name: 'Trade-In Trader', hint: '55+ on exchange capture', at: (p) => p.kras?.['Exchange'] || 0, goal: 55, unit: 'score' },
  { id: 'acc', icon: 'i-plus', name: 'Fully Loaded', hint: '55+ on accessories attach', at: (p) => p.kras?.['Accessories'] || 0, goal: 55, unit: 'score' },
  { id: 'ins', icon: 'i-shield', name: 'Well Covered', hint: '60+ on insurance attach', at: (p) => p.kras?.['Insurance'] || 0, goal: 60, unit: 'score' },
  { id: 'fin', icon: 'i-rupee', name: 'Finance Ace', hint: '60+ on finance attach', at: (p) => p.kras?.['Finance'] || 0, goal: 60, unit: 'score' },
  { id: 'deliver', icon: 'i-check-c', name: 'Finisher', hint: '60+ on deliveries closed', at: (p) => p.kras?.['Delivery'] || 0, goal: 60, unit: 'score' },
  { id: 'clean', icon: 'i-clip', name: 'Clean Pipeline', hint: '65+ on enquiry hygiene', at: (p) => p.kras?.['Enquiry Hygiene'] || 0, goal: 65, unit: 'score' },
  { id: 'punct', icon: 'i-clock', name: 'Ever-Present', hint: '95+ attendance for the month', at: (p) => p.kras?.['Attendance'] || 0, goal: 95, unit: 'score' },
  { id: 'streak', icon: 'i-flame', name: 'In Form', hint: 'Seven days scoring without a break', at: (p) => curStreak(p), goal: 7, unit: 'day' },
  { id: 'top3', icon: 'i-award', name: 'Top Order', hint: 'Finish in the top three on your board', at: (_p, r) => (r ? Math.max(0, 4 - r) : 0), goal: 1, unit: 'rank' },
];

// ── KRA templates, one per role family ──
export const DEFAULT_KRA_TEMPLATES: Record<string, KraTemplate> = {
  sales: {
    label: 'Sales floor',
    rows: [
      { name: 'New Car Sales', grp: 'Sales', target: 2, pts: 1000, done: 1, icon: 'i-car', roles: ['DSE', 'TL', 'SM', 'GM', 'CH', 'AD'] },
      { name: 'Daily Enquiry Hygiene', grp: 'Pipeline', target: 25, pts: 500, done: 16, icon: 'i-clip', roles: ['DSE'] },
      { name: 'Attendance + Uniform + MM', grp: 'Discipline', target: 25, pts: 250, done: 22, icon: 'i-clock', roles: [] },
      { name: 'Test Drives (DFMS)', grp: 'Pipeline', target: 10, pts: 250, done: 6, icon: 'i-target', roles: ['DSE'] },
      { name: 'Evaluation', grp: 'Pipeline', target: 5, pts: 500, done: 3, icon: 'i-file', roles: ['DSE'] },
      { name: 'Home Visits (pre-booking)', grp: 'Pipeline', target: 15, pts: 100, done: 9, icon: 'i-building', roles: ['DSE'] },
      { name: 'ROI Usage', grp: 'Discipline', target: 25, pts: 100, done: 20, icon: 'i-book', roles: [] },
      { name: 'Showroom Visit (face to face)', grp: 'Pipeline', target: 8, pts: 250, done: 5, icon: 'i-users', roles: ['DSE'] },
      { name: 'Event / Activity', grp: 'Engagement', target: 4, pts: 250, done: 2, icon: 'i-zap', roles: ['DSE', 'TL'] },
      { name: 'Recommended Training', grp: 'Engagement', target: 1, pts: 500, done: 0, icon: 'i-award', roles: [] },
      { name: 'AI Lead Score >80%', grp: 'Quality', target: 1, pts: 2500, done: 0, icon: 'i-spark', roles: ['DSE'] },
    ],
  },
  finance: {
    label: 'Finance desk',
    rows: [
      { name: 'Finance Cases Logged', grp: 'Pipeline', target: 30, pts: 300, done: 19, icon: 'i-file' },
      { name: 'Loan Approvals', grp: 'Sales', target: 20, pts: 800, done: 12, icon: 'i-check-c' },
      { name: 'Delivery Orders Issued', grp: 'Sales', target: 18, pts: 600, done: 11, icon: 'i-rupee' },
      { name: 'Attach Rate vs Target', grp: 'Quality', target: 1, pts: 2500, done: 0, icon: 'i-target' },
      { name: 'Approval Turnaround', grp: 'Quality', target: 20, pts: 250, done: 14, icon: 'i-clock' },
      { name: 'Attendance + Uniform', grp: 'Discipline', target: 25, pts: 250, done: 23, icon: 'i-check-c' },
      { name: 'ROI Usage', grp: 'Discipline', target: 25, pts: 100, done: 22, icon: 'i-book' },
      { name: 'Training Attended', grp: 'Engagement', target: 1, pts: 500, done: 0, icon: 'i-award' },
    ],
  },
  accounts: {
    label: 'Accounts desk',
    rows: [
      { name: 'Payments Verified', grp: 'Pipeline', target: 40, pts: 250, done: 27, icon: 'i-rupee' },
      { name: 'Invoices Cleared', grp: 'Sales', target: 35, pts: 400, done: 24, icon: 'i-file' },
      { name: 'Gate Passes Released', grp: 'Sales', target: 30, pts: 500, done: 18, icon: 'i-check-c' },
      { name: 'Same-day Clearance', grp: 'Quality', target: 25, pts: 300, done: 15, icon: 'i-clock' },
      { name: 'Reconciliation Closed', grp: 'Quality', target: 4, pts: 750, done: 2, icon: 'i-shield' },
      { name: 'Attendance + Uniform', grp: 'Discipline', target: 25, pts: 250, done: 24, icon: 'i-check-c' },
      { name: 'ROI Usage', grp: 'Discipline', target: 25, pts: 100, done: 21, icon: 'i-book' },
    ],
  },
  edp: {
    label: 'EDP desk',
    rows: [
      { name: 'Invoices Raised', grp: 'Sales', target: 45, pts: 250, done: 31, icon: 'i-file' },
      { name: 'Registrations Filed', grp: 'Pipeline', target: 30, pts: 400, done: 20, icon: 'i-building' },
      { name: 'Data Accuracy Checks', grp: 'Quality', target: 25, pts: 300, done: 17, icon: 'i-shield' },
      { name: 'Same-day Processing', grp: 'Quality', target: 30, pts: 200, done: 22, icon: 'i-clock' },
      { name: 'Attendance + Uniform', grp: 'Discipline', target: 25, pts: 250, done: 24, icon: 'i-check-c' },
      { name: 'ROI Usage', grp: 'Discipline', target: 25, pts: 100, done: 23, icon: 'i-book' },
    ],
  },
  pdi: {
    label: 'PDI bay',
    rows: [
      { name: 'Pre-delivery Checks', grp: 'Sales', target: 35, pts: 400, done: 23, icon: 'i-check-c' },
      { name: 'Vehicles Dispatched', grp: 'Pipeline', target: 30, pts: 350, done: 19, icon: 'i-car' },
      { name: 'Zero-defect Handovers', grp: 'Quality', target: 28, pts: 500, done: 18, icon: 'i-shield' },
      { name: 'Bay Turnaround', grp: 'Quality', target: 25, pts: 250, done: 16, icon: 'i-clock' },
      { name: 'Attendance + Uniform', grp: 'Discipline', target: 25, pts: 250, done: 25, icon: 'i-check-c' },
      { name: 'Training Attended', grp: 'Engagement', target: 1, pts: 500, done: 0, icon: 'i-award' },
    ],
  },
};

// ── Roles / scope / permissions ──
export const DEFAULT_ROLES: Role[] = [
  { id: 'DSE', lvl: 'L1', label: 'Direct Sales Executive', alt: 'Relationship Manager', scope: 'self', kra: 'sales', perms: ['self.view'] },
  { id: 'TL', lvl: 'L2', label: 'Team Leader', alt: 'Senior Relationship Manager', scope: 'team', kra: 'sales', perms: ['self.view', 'team.view', 'contests.manage'] },
  { id: 'SM', lvl: 'L3', label: 'Sales Manager', alt: '', scope: 'branch', kra: 'sales', perms: ['self.view', 'team.view', 'branch.view', 'contests.manage'] },
  { id: 'GM', lvl: 'L4', label: 'General Manager', alt: '', scope: 'branch', kra: 'sales', perms: ['self.view', 'team.view', 'branch.view', 'contests.manage', 'config.edit'] },
  { id: 'CH', lvl: 'L5', label: 'Cluster Head', alt: '', scope: 'org', kra: 'sales', perms: ['self.view', 'team.view', 'branch.view', 'org.view', 'contests.manage', 'config.edit'] },
  { id: 'AD', lvl: 'L6', label: 'Associate Director, Sales', alt: '', scope: 'org', kra: 'sales', perms: ['self.view', 'team.view', 'branch.view', 'org.view', 'contests.manage', 'config.edit', 'roles.edit'] },
  { id: 'FIN', lvl: '—', label: 'Finance Executive', alt: '', scope: 'self', kra: 'finance', perms: ['self.view'] },
  { id: 'Accounts', lvl: '—', label: 'Accounts Executive', alt: '', scope: 'self', kra: 'accounts', perms: ['self.view'] },
  { id: 'EDP', lvl: '—', label: 'EDP Executive', alt: '', scope: 'self', kra: 'edp', perms: ['self.view'] },
  { id: 'PDI', lvl: '—', label: 'PDI Executive', alt: '', scope: 'self', kra: 'pdi', perms: ['self.view'] },
];

export const SCOPES: Record<string, string> = {
  self: 'Own record',
  team: 'Their team',
  branch: 'Whole branch',
  org: 'All branches',
};

export const PERMS = [
  { k: 'self.view', t: 'Own dashboard', d: 'Their own standing, scoresheet and earnings.' },
  { k: 'team.view', t: 'Their team', d: 'The people who report to them, by name.' },
  { k: 'branch.view', t: 'Whole branch', d: 'Every role at their branch, not just their own department.' },
  { k: 'org.view', t: 'All branches', d: 'The group-wide league table.' },
  { k: 'contests.manage', t: 'Run contests', d: 'Open, edit and close contests for their scope.' },
  { k: 'config.edit', t: 'Edit the ruleset', d: 'Scoring, targets, tiers, boards and quests.' },
  { k: 'roles.edit', t: 'Manage roles', d: 'Change who is allowed to do what.' },
];

// ── Navigation ──
export interface NavItem {
  g: number;
  r: string;
  t: string;
  i: string;
  perm?: string;
  cnt?: 'tasks' | 'contests';
}
export const NAV: NavItem[] = [
  { g: 1, r: 'home', t: 'Home', i: 'i-home' },
  { g: 1, r: 'work', t: 'My Work', i: 'i-target' },
  { g: 1, r: 'badges', t: 'Achievements', i: 'i-badge' },
  { g: 2, r: 'tasks', t: 'Daily Tasks & Quests', i: 'i-check-c', cnt: 'tasks' },
  { g: 2, r: 'weekly', t: 'Weekly Performance', i: 'i-chart' },
  { g: 2, r: 'earnings', t: 'Earnings', i: 'i-rupee' },
  { g: 3, r: 'leaderboards', t: 'Leaderboards', i: 'i-list' },
  { g: 3, r: 'contests', t: 'Contests', i: 'i-trophy', cnt: 'contests' },
  { g: 3, r: 'branches', t: 'All Branches', i: 'i-layers', perm: 'org.view' },
  { g: 4, r: 'team', t: 'My Team', i: 'i-users', perm: 'team.view' },
  { g: 4, r: 'config', t: 'Configuration', i: 'i-settings', perm: 'config.edit' },
];

export const TITLES: Record<string, string> = {
  home: 'Home', work: 'My Work', activity: 'My Work', follow: 'My Work', badges: 'Achievements', kras: 'My Work',
  tasks: 'Daily Tasks & Quests', weekly: 'Weekly Performance', earnings: 'Earnings',
  leaderboards: 'Leaderboards', contests: 'Contests', branches: 'All Branches', config: 'Configuration', team: 'My Team',
};
export const TITLES_SM: Record<string, string> = {
  tasks: 'Quests', weekly: 'Weekly', kras: 'My Work', badges: 'Badges', branches: 'Branches',
  activity: 'My Work', follow: 'My Work', leaderboards: 'Boards', team: 'Team', work: 'My Work',
};

export const MINE_ROUTE: Record<string, string> = { work: 'sheet', kras: 'sheet', activity: 'standing', follow: 'follow' };
export const MINE_TABS = [
  { k: 'sheet', t: 'Scorecard', i: 'i-target', d: 'Every KRA row on your sheet' },
  { k: 'follow', t: 'Follow-ups', i: 'i-clip', d: 'The four graded parameters' },
  { k: 'standing', t: 'Standing', i: 'i-activity', d: 'Your board position and events' },
];

// ── Contest format language ──
export const FMT_COLOR: Record<string, string> = {
  'SUPER OVER': '#F85149', T20: '#8B949E', ODI: '#8B949E', TEST: '#8B949E',
  SERIES: '#8B949E', Trophy: '#D29922', League: '#8B949E',
};
export const FMT_LEN: Record<string, string> = {
  'SUPER OVER': 'Hours', T20: 'Days', ODI: 'A month', TEST: 'The season', SERIES: 'Multi-round',
};
export const LADDER = [
  { k: 'SUPER OVER', len: 'A few hours', d: 'A blitz inside one shift — a price-lock hour, an evening booking sprint. Won and settled the same day.' },
  { k: 'T20', len: 'Days', d: 'A short burst on one behaviour: clean enquiries, zero late swipes, a five-day streak.' },
  { k: 'ODI', len: 'A month', d: 'A full-month race on a headline number — deliveries, finance attach, insurance. Caps are awarded here.' },
  { k: 'TEST', len: 'The season', d: 'The championship. Every branch, every rep, running the whole quarter for the biggest pool.' },
];

// ── Event feed labels ──
export const LBL: Record<string, string> = {
  BOOKING_CREATED: 'Booking created', DISCOUNT_APPROVED: 'Discount approved', PAYMENT_ADDED: 'Payment received',
  INVOICE_CREATED: 'Invoice raised', INVOICE_APPROVED_SALES: 'Invoice approved',
  RGISTRATION_APPROVED_SALES: 'Registration approved', DSE_COMMITMENTS_ADDED: 'Commitment logged',
};

// ── Scoring action codes (configurable) ──
export const DEFAULT_CODES: CodeRow[] = [
  ['BOOKING_CREATED', 'Booking created', 'm', 120], ['DISCOUNT_APPROVED', 'Discount approved', 'm', 60],
  ['PAYMENT_ADDED', 'Payment captured', 'm', 40], ['CREDIT_APPROVED', 'Payment approved', 'm', 40],
  ['FINANCE_INFO_UPDATED', 'Finance secured', 'v', 80], ['DOCUMENTS_INSURANCE', 'Insurance attached', 'v', 60],
  ['DEBIT_ADDED', 'Accessories billed', 'v', 50], ['VEHICLE_EXCHANGE_UPDATED', 'Exchange captured', 'v', 50],
  ['INVOICE_CREATED', 'Invoice raised', 'm', 40], ['INVOICE_APPROVED_SALES', 'Invoice approved', 'm', 50],
  ['RTO_REQUEST', 'RTO initiated', 'm', 50], ['RGISTRATION_APPROVED_SALES', 'Registration approved', 'm', 50],
  ['REGISTRATION_UPDATED', 'Registration complete', 'm', 60], ['PDI_INFO_ADDED', 'PDI verified', 'm', 40],
  ['DISPATCH_BY_CCM', 'Dispatch coordinated', 'm', 40], ['DISPATCH_BY_PDI', 'Vehicle dispatched', 'm', 50],
  ['GATEPASS_ISSUED_BY_ACCOUNTS', 'Gate pass issued', 'f', 200], ['DSE_COMMITMENTS_ADDED', 'Commitment logged', 'a', 15],
  ['BOOKING_CANCELLATION_REQUEST_APPROVED', 'Booking cancelled', 'p', -100], ['INVOICE_CANCEL_APPROVED', 'Invoice cancelled', 'p', -40],
];
export const TIER_LBL: Record<string, [string, string, string]> = {
  m: ['Milestone', 'var(--green)', 'var(--green-g)'], v: ['Value-add', 'var(--gold)', 'var(--gold-g)'],
  f: ['Finisher', 'var(--orange)', 'var(--orange-g)'], a: ['Assist', 'var(--cyan)', 'var(--cyan-g)'],
  p: ['Penalty', 'var(--red)', 'var(--red-g)'],
};

// ── Graded follow-up parameters (My Work → Follow-ups) ──
export const GRADES = [
  { para: 'Enquiry', good: 'Followed Up', mid: 'Pending', bad: 'Incomplete', gw: 0.35, mw: 0.25, bw: 0.3, icon: 'i-clip', kra: 'Daily Enquiry Hygiene' },
  { para: 'Test Drive', good: 'Followed Up', mid: 'Pending', bad: 'Incomplete', gw: 0.35, mw: 0.25, bw: 0.3, icon: 'i-target', kra: 'Test Drives (DFMS)' },
  { para: 'Home Visit', good: 'Completed', mid: 'Scheduled', bad: 'Not Offered', gw: 0.35, mw: 0.25, bw: 0.3, icon: 'i-building', kra: 'Home Visits (pre-booking)' },
  { para: 'Delivery', good: 'Followed Up', mid: 'Pending', bad: 'Incomplete', gw: 0.35, mw: 0.25, bw: 0.3, icon: 'i-car', kra: 'New Car Sales' },
];

// ── Data provenance table (How points are earned) ──
export const SOURCES = [
  { feed: 'Enquiry', system: 'DMS / Offline', mode: 'FTP', freq: 'Once a day', live: false },
  { feed: 'Booking', system: 'ROI', mode: 'API', freq: 'Realtime', live: true },
  { feed: 'Customer', system: 'ROI', mode: 'API', freq: 'Realtime', live: true },
  { feed: 'Financial', system: 'RealBooks', mode: 'API', freq: 'Realtime', live: true },
  { feed: 'HR', system: 'RollPe', mode: 'API', freq: 'Realtime', live: true },
];

export const CFG_SECTIONS = [
  { k: 'season', t: 'Season & rules', i: 'i-settings' },
  { k: 'roles', t: 'Roles & access', i: 'i-users' },
  { k: 'tiers', t: 'Tiers & levels', i: 'i-award' },
  { k: 'codes', t: 'Scoring actions', i: 'i-zap' },
  { k: 'kras', t: 'KRA scoresheet', i: 'i-target' },
  { k: 'depts', t: 'Departments', i: 'i-layers' },
  { k: 'boards', t: 'Leaderboards', i: 'i-list' },
  { k: 'contests', t: 'Contests', i: 'i-trophy' },
  { k: 'quests', t: 'Daily quests', i: 'i-check-c' },
  { k: 'badgecfg', t: 'Achievements', i: 'i-badge' },
  { k: 'data', t: 'Export & import', i: 'i-file' },
];

export const DEFAULT_RULES = () => ({
  crossDept: { on: true, t: 'Cross-department boards', d: 'Let people open a board that mixes departments. Multipliers below are applied first.' },
  showEarnings: { on: true, t: 'Show rupee projection', d: 'Employees see what their scoresheet is worth in money, not only in points.' },
  idempotent: { on: true, t: 'One score per milestone', d: 'A milestone pays once per booking, ever. Re-clicking it earns nothing.' },
  vesting: { on: true, t: 'Vest booking points', d: 'Points for creating a booking are held until a second person clears the next gate.' },
  clawback: { on: true, t: 'Clawback on cancellation', d: 'A cancelled booking reverses a share of every point it paid out.' },
  streakGrace: { on: false, t: 'One grace day per streak', d: 'A streak survives a single missed day each month instead of resetting.' },
  publicBoards: { on: true, t: 'Names visible on boards', d: 'Turn off to show only the viewer’s own row by name and anonymise the rest.' },
});

export const DEFAULT_BOARDS = () => [
  { key: 'division', t: 'My Division', scope: 'role' as const, on: true, top: 10, tie: 'deals' as const },
  { key: 'branch', t: 'My Branch', scope: 'branch' as const, on: true, top: 10, tie: 'deals' as const },
  { key: 'dept', t: 'Department', scope: 'dept' as const, on: true, top: 10, tie: 'deals' as const },
];

export const DEFAULT_DEPT_MULT = (): Record<string, number> => ({
  Sales: 1, Finance: 1, Accounts: 1, PDI: 1, EDP: 0.6, RTO: 1, 'Customer Care': 1, Accessories: 1,
});

/** Daily quests are deterministic per calendar day. */
export function makeDailyDefaults() {
  const r = seeded('tasks' + new Date().toDateString());
  return [
    { t: 'Log 5 enquiry follow-ups', goal: 5, done: Math.floor(r() * 6), icon: 'i-clip', pts: 250 },
    { t: 'Book 2 test drives', goal: 2, done: Math.floor(r() * 3), icon: 'i-car', pts: 500 },
    { t: 'Close one delivery', goal: 1, done: Math.floor(r() * 2), icon: 'i-check-c', pts: 1000 },
    { t: 'Attach finance on a booking', goal: 2, done: Math.floor(r() * 3), icon: 'i-rupee', pts: 800 },
    { t: 'Complete showroom walk-in log', goal: 3, done: Math.floor(r() * 4), icon: 'i-users', pts: 250 },
  ].map((t) => ({ ...t, done: Math.min(t.done, t.goal) }));
}
