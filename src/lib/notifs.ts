import type { StoreState } from './store';
import type { Notif } from './types';
import { me, division } from './selectors';
import { curStreak } from './series';
import { fmt } from './format';

export function buildNotifs(s: StoreState): Notif[] {
  const m = me(s);
  const all = division(s);
  const mi = all.findIndex((p) => p.uid === m.uid);
  const out: Notif[] = [];
  if (mi > 0) {
    const a = all[mi - 1];
    out.push({
      c: 'var(--gold)', g: 'var(--gold-g)', i: 'i-trend-up', unread: true,
      t: `${a.name.split(' ')[0]} is ${fmt((a.points || 0) - (m.points || 0))} points ahead`,
      d: 'Close the gap and take their spot on your division board.', tm: 'Just now', go: 'activity',
    });
  }
  s.contests
    .filter((c) => c.joined && c.state === 'live' && /\dh /.test(c.time))
    .forEach((c) =>
      out.push({
        c: 'var(--red)', g: 'var(--red-g)', i: 'i-clock', unread: true,
        t: `"${c.name}" ends in ${c.time.replace(' left', '')}`,
        d: `You are in this one. ${c.players} players competing.`, tm: 'Live now', go: 'contests',
      }),
    );
  const open = s.daily.filter((t) => t.done < t.goal);
  if (open.length)
    out.push({
      c: 'var(--cyan)', g: 'var(--cyan-g)', i: 'i-check-c', unread: true,
      t: `${open.length} daily task${open.length > 1 ? 's' : ''} left`,
      d: `Worth ${fmt(open.reduce((sm, t) => sm + t.pts, 0))} pointers before midnight.`, tm: 'Today', go: 'tasks',
    });
  const st = curStreak(m);
  if (st > 0 && st < 7)
    out.push({
      c: 'var(--orange)', g: 'var(--orange-g)', i: 'i-flame', unread: false,
      t: `${7 - st} days to the On Fire badge`,
      d: `Your ${st}-day streak is alive. Score once today to keep it.`, tm: 'Today', go: 'badges',
    });
  const gap = s.kraModel
    .map((r) => ({ ...r, v: (r.target - Math.min(r.done, r.target)) * r.pts }))
    .sort((a, b) => b.v - a.v)[0];
  if (gap && gap.v > 0)
    out.push({
      c: 'var(--green)', g: 'var(--green-g)', i: 'i-rupee', unread: false,
      t: `₹${fmt(gap.v)} still open on ${gap.name}`,
      d: 'Your highest-value remaining opportunity this month.', tm: 'This month', go: 'earnings',
    });
  out.push({
    c: 'var(--violet)', g: 'var(--violet-g)', i: 'i-chart', unread: false,
    t: 'Weekly summary refreshed', d: 'Your seven-day breakdown has been recalculated.', tm: 'This morning', go: 'weekly',
  });
  return out;
}
