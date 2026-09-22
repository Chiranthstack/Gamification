'use client';

import React from 'react';
import Icon from '../Icon';
import { useStore } from '@/lib/store';
import { me, division, aBranch } from '@/lib/selectors';
import { kraTotals } from '@/lib/kra';
import { workQueue } from '@/lib/work';
import { MINE_TABS, LBL } from '@/lib/constants';
import { fmt } from '@/lib/format';
import type { Player } from '@/lib/types';

export default function MyWork() {
  const s = useStore();
  const m = me(s);
  const tab = s.mineTab || 'sheet';
  const kraT = kraTotals(s.kraModel);
  const pend = workQueue(s).reduce((a, x) => a + x.mid, 0);
  const rank = division(s).findIndex((x) => x.uid === m.uid) + 1;

  const badge: Record<string, { v: React.ReactNode; c: string }> = {
    sheet: { v: kraT.pct + '%', c: kraT.pct >= 75 ? 'var(--green)' : kraT.pct >= 50 ? 'var(--gold)' : 'var(--red)' },
    follow: { v: pend || '', c: 'var(--gold)' },
    standing: { v: rank ? '#' + rank : '', c: 'var(--mut)' },
  };
  const cur = MINE_TABS.find((t) => t.k === tab) || MINE_TABS[0];

  const setTab = (t: string) => {
    const r = t === 'sheet' ? 'work' : t === 'standing' ? 'activity' : 'follow';
    useStore.setState({ mineTab: t, route: r });
    if (typeof location !== 'undefined') location.hash = '#/' + r;
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  return (
    <div className="wide">
      <div className="page-hd">
        <div className="page-t">My Work</div>
        <div className="page-d">
          {cur.d}. Everything here is credited automatically from the systems you already work in — there is nothing to enter by hand.
        </div>
      </div>

      <div className="chips" role="tablist">
        {MINE_TABS.map((t) => (
          <span key={t.k} className={`chip ${tab === t.k ? 'on' : ''}`} role="tab" aria-selected={tab === t.k} onClick={() => setTab(t.k)}>
            <Icon name={t.i} c="ico ico-s" />
            {t.t}
            {badge[t.k].v !== '' && badge[t.k].v != null && (
              <b className="chip-n" style={{ color: tab === t.k ? 'inherit' : badge[t.k].c }}>
                {badge[t.k].v}
              </b>
            )}
          </span>
        ))}
      </div>

      {tab === 'follow' ? <FollowBody /> : tab === 'standing' ? <StandingBody /> : <ScorecardBody />}
      <div style={{ height: 24 }} />
    </div>
  );
}

// ── Scorecard ──
function ScorecardBody() {
  const s = useStore();
  const T = kraTotals(s.kraModel);
  const grps: Record<string, typeof s.kraModel> = {};
  s.kraModel.forEach((r) => (grps[r.grp] ??= []).push(r));
  const order = ['Sales', 'Pipeline', 'Discipline', 'Quality', 'Engagement'];
  const weak = s.kraModel.filter((r) => r.done / r.target < 0.5);

  return (
    <>
      <div className="note" style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span>Your {s.kraModel.length} scoring parameters this month. Targets and values are set in Configuration.</span>
        <button className="btn" style={{ marginLeft: 'auto' }} onClick={() => s.openSheet({ type: 'scoring' })}>
          <Icon name="i-info" c="ico ico-s" />
          How points are earned
        </button>
      </div>

      <div className="tstrip">
        <div className="tcell">
          <div className="tcell-l">Achieved</div>
          <div className="tcell-v">{fmt(T.got)}</div>
          <div className="tcell-s">of {fmt(T.max)} pointers</div>
        </div>
        <div className="tcell">
          <div className="tcell-l">Completion</div>
          <div className="tcell-v">{T.pct}%</div>
          <div className="tcell-s">month to date</div>
        </div>
        <div className="tcell">
          <div className="tcell-l">Still open</div>
          <div className="tcell-v" style={{ color: 'var(--gold)' }}>{fmt(T.left)}</div>
          <div className="tcell-s">pointers available</div>
        </div>
        <div className="tcell">
          <div className="tcell-l">Maxed</div>
          <div className="tcell-v">
            {s.kraModel.filter((r) => r.done >= r.target).length}
            <span style={{ color: 'var(--dim)', fontSize: 16 }}>/{s.kraModel.length}</span>
          </div>
          <div className="tcell-s">parameters complete</div>
        </div>
      </div>

      {weak.length > 0 && (
        <div className="card" style={{ marginBottom: 16, padding: '14px 16px', borderLeft: '3px solid var(--red)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ color: 'var(--red)', flexShrink: 0, marginTop: 1 }}>
            <Icon name="i-alert" c="ico ico-m" />
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>
            <b style={{ color: 'var(--ink)' }}>
              Below half on {weak.length} parameter{weak.length > 1 ? 's' : ''}:
            </b>{' '}
            {weak.map((w) => w.name).join(', ')}.
            {weak[0].pts >= 500 && (
              <>
                {' '}
                <b style={{ color: 'var(--gold)' }}>{weak[0].name}</b> is worth ₹{fmt(weak[0].pts)} per opportunity — the fastest gain available.
              </>
            )}
          </div>
        </div>
      )}

      {order
        .filter((g) => grps[g])
        .map((g) => (
          <React.Fragment key={g}>
            <div className="sec">
              <div className="sec-t">{g}</div>
              <span className="sec-n">
                {fmt(grps[g].reduce((sm, r) => sm + Math.min(r.done, r.target) * r.pts, 0))} / {fmt(grps[g].reduce((sm, r) => sm + r.target * r.pts, 0))}
              </span>
            </div>
            <div className="card" style={{ marginBottom: 14 }}>
              {grps[g].map((r, idx) => {
                const done = Math.min(r.done, r.target);
                const pct = Math.round((done / r.target) * 100);
                const full = done >= r.target;
                const col = full ? 'var(--green)' : pct >= 50 ? 'var(--gold)' : 'var(--red)';
                return (
                  <div className={`krow${full ? ' done' : ''}`} key={r.name + idx}>
                    <div className="krow-ic" style={{ background: full ? 'var(--green)' : 'var(--surf-2)', color: full ? 'var(--on-accent)' : 'var(--mut)' }}>
                      <Icon name={full ? 'i-check' : r.icon} c="ico ico-m" />
                    </div>
                    <div className="krow-id">
                      <div className="krow-n">{r.name}</div>
                      <div className="krow-s">
                        {done}/{r.target} opportunities · ₹{fmt(r.pts)} each
                      </div>
                    </div>
                    <div className="krow-b">
                      <div className="bar">
                        <i style={{ width: pct + '%', background: col }} />
                      </div>
                    </div>
                    <div className="krow-v">
                      <div className="dnum" style={{ fontSize: 15, color: 'var(--ink)' }}>{fmt(done * r.pts)}</div>
                      <div className="krow-vs">of {fmt(r.target * r.pts)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        ))}
    </>
  );
}

// ── Follow-ups ──
function FollowBody() {
  const s = useStore();
  const q = workQueue(s);
  const pending = q.reduce((a, x) => a + x.mid, 0);
  const untouched = q.reduce((a, x) => a + x.bad, 0);
  const recoverable = q.reduce((a, x) => a + x.mid * x.gain, 0);
  const cur = s.cfg.season.currency;

  return (
    <>
      <div className="note" style={{ margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
        <span className="src-dot" />
        The scoresheet grades these four on how far you take them, not just how many you log.
        <button className="btn btn-ghost btn-sm" onClick={() => s.openSheet({ type: 'grading' })}>
          How grading works
        </button>
      </div>

      <div className="tstrip">
        <div className="tcell">
          <div className="tcell-l">Awaiting follow-up</div>
          <div className="tcell-v">{pending}</div>
          <div className="tcell-s">rows you can finish today</div>
        </div>
        <div className="tcell">
          <div className="tcell-l">Worth clearing</div>
          <div className="tcell-v" style={{ color: 'var(--gold)' }}>{cur}{fmt(recoverable)}</div>
          <div className="tcell-s">if every pending row is closed</div>
        </div>
        <div className="tcell">
          <div className="tcell-l">Not started</div>
          <div className="tcell-v">{untouched}</div>
          <div className="tcell-s">opportunities untouched this month</div>
        </div>
        <div className="tcell">
          <div className="tcell-l">Graded</div>
          <div className="tcell-v">4</div>
          <div className="tcell-s">of {s.kraModel.length} parameters on your sheet</div>
        </div>
      </div>

      {q.map((g) => {
        const total = g.opportunities || 1;
        const pc = (n: number) => Math.round((n / total) * 100);
        return (
          <div className="wk" key={g.para}>
            <div className="wk-hd">
              <div className="wk-ic">
                <Icon name={g.icon} c="ico ico-m" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="wk-t">{g.para}</div>
                <div className="wk-s">
                  {g.kra} · {g.opportunities} this month · {cur}{fmt(g.pts)} each
                </div>
              </div>
              {g.mid ? (
                <span className="wk-pend">
                  <Icon name="i-clock" c="ico ico-s" />
                  <b>{g.mid}</b> pending
                </span>
              ) : (
                <span className="wk-clear">
                  <Icon name="i-check" c="ico ico-s" />
                  Nothing pending
                </span>
              )}
            </div>
            <div className="wk-meter">
              {g.good > 0 && <i className="good" style={{ width: pc(g.good) + '%' }} />}
              {g.mid > 0 && <i className="mid" style={{ width: pc(g.mid) + '%' }} />}
              {g.bad > 0 && <i className="bad" style={{ width: pc(g.bad) + '%' }} />}
            </div>
            <div className="wk-rows">
              <div className="wk-row">
                <i className="good" />
                <span>{g.good_g}</span>
                <b>{g.good}</b>
                <em>full value</em>
              </div>
              <div className={`wk-row ${g.mid ? 'act' : ''}`}>
                <i className="mid" />
                <span>{g.mid_g}</span>
                <b>{g.mid}</b>
                <em>{g.mid ? `+${cur}${fmt(g.gain)} each if closed` : 'none'}</em>
              </div>
              <div className={`wk-row ${g.bad ? 'warn' : ''}`}>
                <i className="bad" />
                <span>{g.bad_g}</span>
                <b>{g.bad}</b>
                <em>{g.bad ? 'not started yet' : 'none'}</em>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

// ── Standing ──
function StandingBody() {
  const s = useStore();
  const m = me(s);
  const all = division(s);
  const mi = all.findIndex((p) => p.uid === m.uid);
  const above = mi > 0 ? all[mi - 1] : null;
  const below = mi >= 0 && mi < all.length - 1 ? all[mi + 1] : null;
  const gapUp = above ? (above.points || 0) - (m.points || 0) : 0;
  const gapDn = below ? (m.points || 0) - (below.points || 0) : 0;
  const ev = (s.data?.recent || []).filter((e) => e.uid === m.uid || e.name === m.name).slice(0, 12);
  const feed = ev.length ? ev : (s.data?.recent || []).slice(0, 12);

  return (
    <>
      <div className="tstrip">
        <div className="tcell">
          <div className="tcell-l">Position</div>
          <div className="tcell-v">#{mi + 1 || '—'}</div>
          <div className="tcell-s">
            of {all.length} {m.role || 'DSE'}s · {aBranch(s)}
          </div>
        </div>
        <div className="tcell">
          <div className="tcell-l">Points behind next</div>
          <div className="tcell-v" style={{ color: 'var(--gold)' }}>{above ? fmt(gapUp) : '—'}</div>
          <div className="tcell-s">{above ? above.name : 'You hold P1'}</div>
        </div>
        <div className="tcell">
          <div className="tcell-l">Lead over chaser</div>
          <div className="tcell-v">{below ? fmt(gapDn) : '—'}</div>
          <div className="tcell-s">{below ? below.name : 'No one behind yet'}</div>
        </div>
        <div className="tcell">
          <div className="tcell-l">Total points</div>
          <div className="tcell-v">{fmt(m.points)}</div>
          <div className="tcell-s">
            {fmt(m.deals || 0)} deals · {fmt(m.events || 0)} events
          </div>
        </div>
      </div>

      {above && (
        <div className="card catch">
          <div className="catch-ic">
            <Icon name="i-target" c="ico ico-l" />
          </div>
          <div className="catch-b">
            <div className="catch-t">Catch {above.name}</div>
            <div className="catch-s">
              You need <b>{fmt(gapUp)}</b> points — about{' '}
              <b className="ink">
                {Math.max(1, Math.ceil(gapUp / 1000))} new car sale{Math.ceil(gapUp / 1000) > 1 ? 's' : ''}
              </b>{' '}
              or <b className="ink">{Math.max(1, Math.ceil(gapUp / 500))} clean enquiry days</b>.
            </div>
          </div>
          <button className="btn btn-p" onClick={() => s.openSheet({ type: 'coach' })}>
            <Icon name="i-spark" c="ico ico-s" />
            Ask the coach
          </button>
        </div>
      )}

      <div className="grid2">
        <div>
          <div className="sec">
            <div className="sec-t">Recent events</div>
            <span className="sec-n">Live from ROI</span>
          </div>
          <div className="card">
            <div>
              {feed.map((e, i) => (
                <div className="evrow" key={i}>
                  <div className="evrow-ic">
                    <Icon name="i-check-c" c="ico ico-m" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="evrow-t">{LBL[e.ac] || e.ac}</div>
                    <div className="evrow-s">
                      {e.enq || '—'} · {e.date || ''}
                    </div>
                  </div>
                  <div className="dnum evrow-v">+{e.pts}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="sec">
            <div className="sec-t">Your division</div>
            <span className="sec-n">{all.length} players</span>
          </div>
          <div className="card">
            <div>
              {all.slice(0, 10).map((p: Player, i) => {
                const isMe = p.uid === m.uid;
                const medal = i < 3 ? `medal m${i + 1}` : '';
                return (
                  <div className={`lb-r ${isMe ? 'me' : ''}`} style={{ padding: '9px 15px' }} key={p.uid}>
                    <div className={`lb-rk ${medal}`}>{i + 1}</div>
                    <div style={{ minWidth: 0 }}>
                      <div className="lb-nm">{isMe ? 'You' : p.name}</div>
                      <div className="lb-sub">
                        {p.role || ''} · {fmt(p.deals || 0)} deals
                      </div>
                    </div>
                    <div className="lb-pt">{fmt(p.points)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
