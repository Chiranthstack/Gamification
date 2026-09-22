import type { StoreState } from './store';
import { FALLBACK_DATA, FALLBACK_CONTESTS } from './fallback-data';
import type { BootstrapData, Contest } from './types';

type Set = (patch: Partial<StoreState>) => void;
type Get = () => StoreState;

/** Resolve the backend base URL (?api= wins, then localStorage, then origin). */
export const API: string = (() => {
  if (typeof window === 'undefined') return '';
  const q = new URLSearchParams(location.search).get('api');
  if (q) {
    try { localStorage.setItem('cv_api', q); } catch {}
    return q.replace(/\/$/, '');
  }
  try {
    const s = localStorage.getItem('cv_api');
    if (s) return s.replace(/\/$/, '');
  } catch {}
  return location.protocol === 'file:' ? 'http://localhost:8000' : '';
})();

const getJSON = <T,>(p: string, ms = 3000): Promise<T> =>
  Promise.race([
    fetch(API + p).then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<T>;
    }),
    new Promise<T>((_, rj) => setTimeout(() => rj(new Error('timeout')), ms)),
  ]);

function countdown(iso?: string, state?: string): string {
  if (!iso) return state === 'live' ? 'Ongoing' : state === 'upcoming' ? 'Starting soon' : 'Ended';
  const end = new Date(iso);
  if (isNaN(+end)) return String(iso);
  const d = +end - +new Date();
  if (state === 'ended' || d < 0) return 'Ended ' + end.toLocaleDateString();
  const days = Math.floor(d / 864e5),
    h = Math.floor((d % 864e5) / 36e5),
    m = Math.floor((d % 36e5) / 6e4);
  return days > 0 ? `${days} day${days > 1 ? 's' : ''} left` : h > 0 ? `${h}h ${m}m left` : `${m}m left`;
}

async function pullData(get: Get): Promise<BootstrapData> {
  return getJSON<BootstrapData>('/v1/sales/bootstrap?limit=500');
}

async function pullContests(data: BootstrapData | null): Promise<Contest[]> {
  const raw = await getJSON<any[]>('/v1/contests');
  const map: Record<string, Contest['state']> = { live: 'live', upcoming: 'upc', ended: 'ended' };
  return raw.map((c) => ({
    id: c.id, fmt: c.format || 'T20', name: c.name, desc: c.description || '',
    prize: c.prize || '—', state: map[c.state] || 'upc', players: c.participant_count || 0,
    joined: data?.current_uid ? (c.participant_ids || []).includes(data.current_uid) : false,
    time: countdown(c.end_date, c.state),
  }));
}

let WATCH: ReturnType<typeof setInterval> | null = null;
let POLL: ReturnType<typeof setInterval> | null = null;

function stopTimers() {
  if (WATCH) clearInterval(WATCH);
  if (POLL) clearInterval(POLL);
  WATCH = POLL = null;
}

/** Try the backend once; on failure hold sample data and retry every 8s. */
export async function attemptBackend(set: Set, get: Get): Promise<void> {
  set({ connecting: true });
  try {
    await getJSON('/v1/sales/bootstrap?limit=1', 2500);
    const data = await pullData(get);
    const contests = await pullContests(data);
    set({ data, contests, offline: false, connecting: false });
    get().useKraFor(get().viewAs || data.leaderboard.find((p) => p.uid === data.current_uid)?.role || 'DSE');
    get().rebuildNotifs();
    startPoll(set, get);
  } catch {
    set({ data: FALLBACK_DATA, contests: FALLBACK_CONTESTS.slice(), offline: true, connecting: false });
    startWatch(set, get);
  }
}

function startWatch(set: Set, get: Get) {
  stopTimers();
  WATCH = setInterval(async () => {
    try {
      await getJSON('/v1/sales/bootstrap?limit=1', 1800);
      stopTimers();
      await attemptBackend(set, get);
      get().pushToast('Connected', 'Live data loaded from your backend');
    } catch {}
  }, 8000);
}

function startPoll(set: Set, get: Get) {
  stopTimers();
  POLL = setInterval(async () => {
    try {
      const data = await pullData(get);
      const contests = await pullContests(data);
      set({ data, contests });
      get().rebuildNotifs();
    } catch {}
  }, 20000);
}

export function teardown() {
  stopTimers();
}
