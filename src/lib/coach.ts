import type { StoreState } from './store';
import { me, division } from './selectors';
import { curStreak } from './series';
import { fmt } from './format';

export interface Rec {
  c: string;
  g: string;
  i: string;
  t: string;
  d: string;
  v: string;
  go: string;
  goT: string;
}

/** The coach's ranked recommendations, recomputed from live scoring data. */
export function coachRecs(s: StoreState): Rec[] {
  const m = me(s);
  const all = division(s);
  const mi = all.findIndex((p) => p.uid === m.uid);
  const out: Rec[] = [];
  if (mi > 0) {
    const a = all[mi - 1];
    const gap = (a.points || 0) - (m.points || 0);
    out.push({
      c: 'var(--gold)', g: 'var(--gold-g)', i: 'i-trend-up',
      t: `Overtake ${a.name.split(' ')[0]} for rank ${mi}`,
      d: `You are ${fmt(gap)} points behind. That is roughly ${Math.max(1, Math.ceil(gap / 1000))} new car sale${Math.ceil(gap / 1000) > 1 ? 's' : ''} or ${Math.max(1, Math.ceil(gap / 500))} clean enquiry days.`,
      v: `+${fmt(gap)}`, go: 'activity', goT: 'See the gap',
    });
  }
  s.kraModel
    .map((r) => ({ ...r, gap: r.target - Math.min(r.done, r.target) }))
    .map((r) => ({ ...r, val: r.gap * r.pts }))
    .filter((r) => r.gap > 0)
    .sort((a, b) => b.val - a.val)
    .slice(0, 2)
    .forEach((r, ri) =>
      out.push({
        c: 'var(--green)', g: 'var(--green-g)', i: r.icon,
        t: `${r.name} · ${r.gap} to go`,
        d: `Worth ₹${fmt(r.pts)} each and you are at ${r.done} of ${r.target}. ${ri === 0 ? 'The highest-value gap left on your sheet.' : 'Next-best after that.'}`,
        v: `+₹${fmt(r.val)}`, go: 'kras', goT: 'Open KRAs',
      }),
    );
  const soon = s.contests.filter((c) => c.state === 'live' && !c.joined)[0];
  if (soon)
    out.push({
      c: 'var(--violet)', g: 'var(--violet-g)', i: 'i-trophy',
      t: `Join "${soon.name}" before it closes`,
      d: `${soon.time} · ${soon.players} players already in. Prize: ${soon.prize}.`,
      v: soon.time.split(' ')[0], go: 'contests', goT: 'View contests',
    });
  const st = curStreak(m);
  if (st > 0 && st < 7)
    out.push({
      c: 'var(--orange)', g: 'var(--orange-g)', i: 'i-flame',
      t: `${7 - st} days from the On Fire badge`,
      d: `You are on a ${st}-day streak. Log a single scoring action each day to keep it alive — miss one and it resets to zero.`,
      v: `${st}🔥`, go: 'badges', goT: 'See badges',
    });
  const open = s.daily.filter((t) => t.done < t.goal);
  if (open.length)
    out.push({
      c: 'var(--cyan)', g: 'var(--cyan-g)', i: 'i-check-c',
      t: `${open.length} daily task${open.length > 1 ? 's' : ''} still open`,
      d: `Closing them all is worth ${fmt(open.reduce((sm, t) => sm + t.pts, 0))} pointers before midnight. Start with "${open[0].t}".`,
      v: `+${fmt(open.reduce((sm, t) => sm + t.pts, 0))}`, go: 'tasks', goT: 'Open tasks',
    });
  return out;
}
