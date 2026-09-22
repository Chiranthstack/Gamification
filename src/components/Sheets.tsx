'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Icon from './Icon';
import { useStore } from '@/lib/store';
import { ROLESHEET_HELP } from '@/lib/text';
import { SCOPES, TIER_LBL, SOURCES, GRADES, NAV } from '@/lib/constants';
import { coachRecs } from '@/lib/coach';
import { me, byPts, roster } from '@/lib/selectors';
import { myRole, roleDef, navAllowed } from '@/lib/roles';
import { prog } from '@/lib/progression';
import { badgesFor } from '@/lib/badges';
import { fmt, ini } from '@/lib/format';

export default function Sheets() {
  const s = useStore();
  const open = s.sheet.type !== 'none';
  return (
    <>
      <div className={`sheet-bg ${open ? 'on' : ''}`} onClick={s.closeSheet} />
      <div className={`sheet ${open ? 'on' : ''}`}>
        <div className="sheet-grip" />
        <div>
          {s.sheet.type === 'coach' && <CoachSheet />}
          {s.sheet.type === 'scoring' && <ScoringSheet />}
          {s.sheet.type === 'grading' && <GradingSheet />}
          {s.sheet.type === 'roles' && <RolesSheet />}
          {s.sheet.type === 'contest' && <ContestSheet id={s.sheet.id} />}
          {s.sheet.type === 'player' && <PlayerSheet uid={s.sheet.uid} rank={s.sheet.rank} />}
          {s.sheet.type === 'palette' && <PaletteSheet />}
        </div>
      </div>
    </>
  );
}

function CoachSheet() {
  const s = useStore();
  const recs = coachRecs(s);
  return (
    <>
      <div className="sheet-hd">
        <div className="sheet-ic">
          <Icon name="i-spark" c="ico ico-l" />
        </div>
        <div>
          <div className="sheet-t">Race Engineer</div>
          <div className="sheet-s">{recs.length} things that would move your score today</div>
        </div>
        <button className="sheet-x" onClick={s.closeSheet}>
          <Icon name="i-x" c="ico ico-m" />
        </button>
      </div>
      <div className="sheet-bd">
        {recs.map((r, i) => (
          <div className="rec" style={{ ['--r-c' as any]: r.c, ['--r-g' as any]: r.g }} key={i}>
            <div className="rec-ic">
              <Icon name={r.i} c="ico ico-m" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="rec-t">{r.t}</div>
              <div className="rec-d">{r.d}</div>
              <a className="rec-go" onClick={() => { s.closeSheet(); s.go(r.go); }}>
                {r.goT} <Icon name="i-arrow-r" c="ico ico-s" />
              </a>
            </div>
            <div className="rec-v">{r.v}</div>
          </div>
        ))}
        <div style={{ fontSize: 11, color: 'var(--dim)', textAlign: 'center', padding: '10px 0 0', lineHeight: 1.5 }}>
          Ranked by point value. Recalculated from your live scoring data each time you open this.
        </div>
      </div>
    </>
  );
}

function ScoringSheet() {
  const s = useStore();
  const rows = s.codes.filter((c) => s.codeOn[c[0]] !== false);
  const pos = rows.filter((c) => c[3] > 0).sort((a, b) => b[3] - a[3]);
  const neg = rows.filter((c) => c[3] < 0);
  return (
    <>
      <div className="sheet-hd">
        <div>
          <div className="sheet-t">How points are earned</div>
          <div className="sheet-s">
            You never log anything twice. When you complete a step in ROI, the engine reads that same event and credits it here — once per booking, automatically.
          </div>
        </div>
      </div>
      <div className="scor">
        <div className="thead" style={{ gridTemplateColumns: 'minmax(0,1fr) 72px', padding: '7px 18px' }}>
          <span>When this happens</span>
          <span style={{ textAlign: 'right' }}>You earn</span>
        </div>
        {pos.map(([code, label, kind, pts]) => (
          <div className="scor-r" key={code}>
            <div style={{ minWidth: 0 }}>
              <div className="scor-t">{label}</div>
              <div className="scor-s">{TIER_LBL[kind] ? TIER_LBL[kind][0] : 'Milestone'}</div>
            </div>
            <div className="scor-v">+{fmt(pts)}</div>
          </div>
        ))}
        {neg.length > 0 && (
          <>
            <div className="scor-sep">These take points back</div>
            {neg.map(([code, label]) => (
              <div className="scor-r" key={code}>
                <div style={{ minWidth: 0 }}>
                  <div className="scor-t">{label}</div>
                  <div className="scor-s">Reversal</div>
                </div>
                <div className="scor-v neg">{fmt(s.codes.find((c) => c[0] === code)![3])}</div>
              </div>
            ))}
          </>
        )}
      </div>
      <div className="scor-sep">Where these numbers come from</div>
      <div className="thead" style={{ gridTemplateColumns: 'minmax(0,1fr) 116px 96px 18px', padding: '7px 18px' }}>
        <span>Feed</span>
        <span>System</span>
        <span>Updates</span>
        <span />
      </div>
      {SOURCES.map((x) => (
        <div className="src-r" key={x.feed}>
          <div className="src-t">{x.feed}</div>
          <div className="src-s">{x.system}</div>
          <div className="src-s">{x.freq}</div>
          <span className={`src-dot ${x.live ? 'live' : ''}`} title={x.live ? 'Realtime' : 'Batch'} />
        </div>
      ))}
      <div className="scor-rules">
        <div className="scor-rule">
          <Icon name="i-check-c" c="ico ico-s" />
          <span>Each step pays <b>once per booking</b>. Repeating it earns nothing.</span>
        </div>
        <div className="scor-rule">
          <Icon name="i-check-c" c="ico ico-s" />
          <span>Logging in, opening records and editing notes are <b>not</b> scored.</span>
        </div>
        <div className="scor-rule">
          <Icon name="i-check-c" c="ico ico-s" />
          <span>If a booking is cancelled, the points it paid are <b>reversed</b>.</span>
        </div>
      </div>
      <div style={{ padding: '12px 18px 6px' }}>
        <button className="btn" style={{ width: '100%' }} onClick={s.closeSheet}>
          Close
        </button>
      </div>
    </>
  );
}

function GradingSheet() {
  const s = useStore();
  return (
    <>
      <div className="sheet-hd">
        <div>
          <div className="sheet-t">How grading works</div>
          <div className="sheet-s">
            Four parameters on the scoresheet are weighted by how far you take each one, so the same volume of work can be worth different amounts.
          </div>
        </div>
      </div>
      <div className="scor">
        <div className="thead" style={{ gridTemplateColumns: 'minmax(0,1fr) 110px 78px', padding: '7px 18px' }}>
          <span>Parameter</span>
          <span>State</span>
          <span style={{ textAlign: 'right' }}>Weight</span>
        </div>
        {GRADES.map((g) =>
          ([[g.good, g.gw], [g.mid, g.mw], [g.bad, g.bw]] as [string, number][]).map(([st, w], i) => (
            <div className="scor-r" style={{ gridTemplateColumns: 'minmax(0,1fr) 110px 78px' }} key={g.para + i}>
              <div className="scor-t">{i === 0 ? g.para : ''}</div>
              <div className="scor-s" style={{ margin: 0 }}>
                {st}
              </div>
              <div className="scor-v" style={{ color: i === 0 ? 'var(--green)' : i === 1 ? 'var(--mut)' : 'var(--red)' }}>
                {w.toFixed(2)}
              </div>
            </div>
          )),
        )}
      </div>
      <div className="scor-rules">
        <div className="scor-rule">
          <Icon name="i-check-c" c="ico ico-s" />
          <span>The top state carries <b>full value</b>. The middle state is the same work left unfinished.</span>
        </div>
        <div className="scor-rule">
          <Icon name="i-check-c" c="ico ico-s" />
          <span>Weights come from the Carverse scoresheet and are editable in Configuration.</span>
        </div>
      </div>
      <div style={{ padding: '12px 18px 6px' }}>
        <button className="btn" style={{ width: '100%' }} onClick={s.closeSheet}>
          Close
        </button>
      </div>
    </>
  );
}

function RolesSheet() {
  const s = useStore();
  const cur = myRole(s);
  return (
    <>
      <div className="sheet-hd">
        <div>
          <div className="sheet-t">View as</div>
          <div className="sheet-s">{ROLESHEET_HELP}</div>
        </div>
      </div>
      <div className="rolelist">
        {s.roles.map((r) => (
          <div className={`rolerow ${r.id === cur.id ? 'on' : ''}`} key={r.id} onClick={() => s.setViewAs(r.id)}>
            <div className="rolerow-ic">
              <Icon name={r.scope === 'self' ? 'i-users' : r.scope === 'org' ? 'i-globe' : 'i-layers'} c="ico ico-m" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="rolerow-t">{r.label}</div>
              <div className="rolerow-s">
                {SCOPES[r.scope]} · {r.perms.length} permission{r.perms.length > 1 ? 's' : ''}
              </div>
            </div>
            {r.id === cur.id && (
              <span className="rolerow-on">
                <Icon name="i-check" c="ico ico-s" />
              </span>
            )}
          </div>
        ))}
      </div>
      <div style={{ padding: '13px 18px 4px' }}>
        <button className="btn" style={{ width: '100%' }} onClick={() => s.setViewAs(null)}>
          Back to my own role
        </button>
      </div>
    </>
  );
}

function ContestSheet({ id }: { id: string }) {
  const s = useStore();
  const c = s.contests.find((x) => x.id === id);
  if (!c) return null;
  const { FMT_COLOR } = require('@/lib/constants');
  const col = FMT_COLOR[c.fmt] || '#2DD46F';
  const cells: [React.ReactNode, string][] = [
    [c.players, 'Players'],
    [c.time.split(' left')[0], c.state === 'ended' ? 'Ran for' : 'Remaining'],
    [c.rank ? '#' + c.rank : '—', 'Your rank'],
  ];
  return (
    <>
      <div className="sheet-hd">
        <div className="sheet-ic" style={{ background: col + '22', color: col }}>
          <Icon name="i-trophy" c="ico ico-l" />
        </div>
        <div>
          <div className="sheet-t">{c.name}</div>
          <div className="sheet-s">
            {c.fmt} format · {c.state === 'live' ? 'Live now' : c.state === 'upc' ? 'Starting soon' : 'Ended'}
          </div>
        </div>
        <button className="sheet-x" onClick={s.closeSheet}>
          <Icon name="i-x" c="ico ico-m" />
        </button>
      </div>
      <div className="sheet-bd">
        <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 16 }}>{c.desc}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--line)', borderRadius: 'var(--r-m)', overflow: 'hidden', marginBottom: 16 }}>
          {cells.map(([v, l], i) => (
            <div style={{ background: 'var(--surf-2)', padding: 14, textAlign: 'center' }} key={i}>
              <div className="dnum" style={{ fontSize: 21 }}>{v}</div>
              <div style={{ fontSize: 9.5, color: 'var(--mut)', letterSpacing: '.1em', fontWeight: 700, textTransform: 'uppercase', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--gold-g)', borderRadius: 'var(--r-m)', padding: '13px 15px', marginBottom: 18 }}>
          <span style={{ color: 'var(--gold)', flexShrink: 0 }}>
            <Icon name="i-gift" c="ico ico-m" />
          </span>
          <div style={{ fontSize: 12.5 }}>
            <b style={{ color: 'var(--gold)' }}>Prize</b> · {c.prize}
            {c.winner && (
              <div style={{ fontSize: 11.5, color: 'var(--mut)', marginTop: 3 }}>
                Won by <b style={{ color: 'var(--ink)' }}>{c.winner}</b>
              </div>
            )}
          </div>
        </div>
        {c.state === 'ended' ? (
          <button className="btn" style={{ width: '100%', justifyContent: 'center', padding: 12 }} onClick={s.closeSheet}>
            Close
          </button>
        ) : c.joined ? (
          <div style={{ textAlign: 'center', background: 'var(--green-g)', color: 'var(--green)', borderRadius: 'var(--r-m)', padding: 13, fontWeight: 600, fontSize: 13 }}>
            ✓ You are in this contest
          </div>
        ) : (
          <button
            className="btn btn-p"
            style={{ width: '100%', justifyContent: 'center', padding: 12, fontSize: 14 }}
            onClick={() => { s.joinContest(c.id); s.closeSheet(); }}
          >
            Join this contest
          </button>
        )}
      </div>
    </>
  );
}

function PlayerSheet({ uid, rank }: { uid: string; rank: number }) {
  const s = useStore();
  const p = (s.data?.leaderboard || []).find((x) => x.uid === uid);
  if (!p) return null;
  const P = prog(p.points, s.cfg.season.levelStep, s.tiers);
  const bl = badgesFor(p, rank, s.cfg);
  const on = bl.filter((b) => b.on);
  const sr = p.deals ? Math.round((p.points || 0) / p.deals) : 0;
  const top3 = Object.entries(p.kras || {}).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const stats: [React.ReactNode, string][] = [
    [fmt(p.points), 'Points'],
    [fmt(p.deals || 0), 'Deals'],
    [sr || '—', 'Avg / deal'],
  ];
  const rr = 2 * Math.PI * 20;
  return (
    <>
      <div className="sheet-hd">
        <div style={{ position: 'relative', width: 46, height: 46, flexShrink: 0 }}>
          <svg viewBox="0 0 46 46" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="23" cy="23" r="20" fill="none" stroke="var(--surf-3)" strokeWidth="4" />
            <circle cx="23" cy="23" r="20" fill="none" stroke={P.tier.c} strokeWidth="4" strokeLinecap="round" strokeDasharray={rr} strokeDashoffset={(1 - P.pct / 100) * rr} />
          </svg>
          <div style={{ position: 'absolute', inset: 6, borderRadius: '50%', background: `linear-gradient(145deg,${P.tier.l},${P.tier.c})`, display: 'grid', placeItems: 'center', fontFamily: 'var(--disp)', fontSize: 14, fontWeight: 650, color: 'var(--on-accent)' }}>
            {ini(p.name)}
          </div>
        </div>
        <div>
          <div className="sheet-t">{p.name}</div>
          <div className="sheet-s">
            {P.tier.name} · Level {P.level} · Rank #{rank}
          </div>
        </div>
        <button className="sheet-x" onClick={s.closeSheet}>
          <Icon name="i-x" c="ico ico-m" />
        </button>
      </div>
      <div className="sheet-bd">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--line)', borderRadius: 'var(--r-m)', overflow: 'hidden', marginBottom: 16 }}>
          {stats.map(([v, l], i) => (
            <div style={{ background: 'var(--surf-2)', padding: 14, textAlign: 'center' }} key={i}>
              <div className="dnum" style={{ fontSize: 20 }}>{v}</div>
              <div style={{ fontSize: 9.5, color: 'var(--mut)', letterSpacing: '.1em', fontWeight: 700, textTransform: 'uppercase', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
        {top3.length > 0 && (
          <div style={{ background: 'var(--surf-2)', borderRadius: 'var(--r-m)', padding: '13px 15px', fontSize: 12.5, color: 'var(--mut)', lineHeight: 1.55, marginBottom: 16 }}>
            Strongest KRAs:{' '}
            {top3.map(([k, v], i) => (
              <React.Fragment key={k}>
                {i > 0 ? ', ' : ''}
                <b style={{ color: 'var(--ink)' }}>
                  {k} ({v}%)
                </b>
              </React.Fragment>
            ))}
            .
          </div>
        )}
        <div style={{ fontSize: 10, color: 'var(--mut)', letterSpacing: '.12em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>
          Badges · {on.length} of {bl.length}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
          {bl.map((b) => (
            <div style={{ textAlign: 'center' }} key={b.id}>
              <div
                style={{
                  width: 42, height: 42, margin: '0 auto 5px', borderRadius: 13, display: 'grid', placeItems: 'center',
                  ...(b.on ? { background: `linear-gradient(145deg,var(--surf-3),var(--surf-3))`, color: 'var(--on-accent)' } : { background: 'var(--surf-3)', color: 'var(--dim)' }),
                }}
              >
                <Icon name={b.icon} c="ico ico-m" />
              </div>
              <div style={{ fontSize: 9, color: b.on ? 'var(--ink-2)' : 'var(--dim)', lineHeight: 1.2 }}>{b.name}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Command palette ──
interface PalItem { k: string; t: string; s: string; i: string; go: () => void; }
function PaletteSheet() {
  const store = useStore();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);

  const pool: PalItem[] = useMemo(() => {
    const pages = NAV.filter((n) => navAllowed(n, store)).map((n) => ({ k: 'Page', t: n.t, s: '', i: n.i, go: () => store.go(n.r) }));
    const extra: PalItem[] = [{ k: 'Help', t: 'How points are earned', s: '', i: 'i-info', go: () => store.openSheet({ type: 'scoring' }) }];
    const all = byPts(roster(store, { allDept: true, allBranch: true, role: 'all' }));
    const players = (store.data?.leaderboard || []).map((p) => ({
      k: 'Player', t: p.name, s: `${p.role || ''} · ${fmt(p.points)} pts`, i: 'i-users',
      go: () => store.openSheet({ type: 'player', uid: p.uid, rank: all.findIndex((x) => x.uid === p.uid) + 1 }),
    }));
    const cts = store.contests.map((c) => ({ k: 'Contest', t: c.name, s: `${c.fmt} · ${c.time}`, i: 'i-trophy', go: () => store.openSheet({ type: 'contest', id: c.id }) }));
    return [...pages, ...extra, ...players, ...cts];
  }, [store]);

  const query = q.toLowerCase().trim();
  const list = query ? pool.filter((x) => x.t.toLowerCase().includes(query) || x.s.toLowerCase().includes(query)).slice(0, 24) : pool.slice(0, 14);

  useEffect(() => setSel(0), [q]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel((v) => Math.min(list.length - 1, v + 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSel((v) => Math.max(0, v - 1)); }
      if (e.key === 'Enter') { e.preventDefault(); list[sel]?.go(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [list, sel]);

  const groups: Record<string, { it: PalItem; idx: number }[]> = {};
  list.forEach((it, idx) => (groups[it.k] ??= []).push({ it, idx }));

  return (
    <>
      <div className="sheet-hd">
        <div className="sheet-ic" style={{ background: 'var(--surf-3)', color: 'var(--mut)' }}>
          <Icon name="i-search" c="ico ico-m" />
        </div>
        <input
          autoFocus
          placeholder="Search pages, players, contests…"
          autoComplete="off"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 15, minWidth: 0 }}
        />
        <button className="sheet-x" onClick={store.closeSheet}>
          <Icon name="i-x" c="ico ico-m" />
        </button>
      </div>
      <div className="sheet-bd" style={{ padding: '8px 0 16px' }}>
        {list.length ? (
          Object.entries(groups).map(([k, arr]) => (
            <div key={k}>
              <div style={{ padding: '8px 20px 4px', fontSize: 9.5, color: 'var(--dim)', letterSpacing: '.14em', fontWeight: 700, textTransform: 'uppercase' }}>{k}s</div>
              {arr.map(({ it, idx }) => (
                <div
                  key={idx}
                  onClick={it.go}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', cursor: 'pointer', background: idx === sel ? 'var(--surf-2)' : 'transparent' }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--surf-2)', color: 'var(--mut)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon name={it.i} c="ico ico-s" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{it.t}</div>
                    {it.s && <div style={{ fontSize: 11, color: 'var(--mut)', fontFamily: 'var(--mono)', marginTop: 1 }}>{it.s}</div>}
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="empty" style={{ padding: '36px 20px' }}>
            <Icon name="i-search" c="ico ico-xl" />
            <h4>No matches</h4>
            <p>Try a player name, a page, or a contest.</p>
          </div>
        )}
      </div>
    </>
  );
}
