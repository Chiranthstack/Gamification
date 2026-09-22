'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../Icon';
import Rail from '../Rail';
import ContestCard from '../ContestCard';
import { useStore } from '@/lib/store';
import { me, myBranch, division, shownName } from '@/lib/selectors';
import { prog } from '@/lib/progression';
import { badgesFor, badgeGap } from '@/lib/badges';
import { boards } from '@/lib/boards';
import { curStreak, monthSeries, monthLevels, longestRun } from '@/lib/series';
import { BADGES } from '@/lib/constants';
import { fmt, ini } from '@/lib/format';
import { useCountUp } from '@/lib/hooks';
import { loadVisit, saveVisit, visitDelta, greetWord } from '@/lib/visit';
import type { Player } from '@/lib/types';

export default function Home() {
  const s = useStore();
  const m = me(s);
  const P = prog(m.points, s.cfg.season.levelStep, s.tiers);
  const all = division(s);
  const rank = all.findIndex((p) => p.uid === m.uid) + 1;
  const bl = badgesFor(m, rank, s.cfg);
  const earned = bl.filter((b) => b.on);

  const heroPtsRef = useCountUp(m.points || 0, 1100);
  const xpIntoRef = useCountUp(P.into, 1100);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setAnimate(true), 140);
    return () => clearTimeout(id);
  }, []);

  // Visit delta (stamps a fresh snapshot 4s after the page settles).
  const [last] = useState(() => (typeof window !== 'undefined' ? loadVisit() : null));
  useEffect(() => {
    const id = setTimeout(() => saveVisit(useStore.getState()), 4000);
    return () => clearTimeout(id);
  }, []);
  const d = visitDelta(s, last);
  const first = (m.name || '').split(' ')[0];
  const ago = d
    ? d.hours < 1
      ? 'since you last looked'
      : d.hours < 24
      ? `in the last ${d.hours} hour${d.hours === 1 ? '' : 's'}`
      : `since ${Math.round(d.hours / 24)} day${d.hours < 48 ? '' : 's'} ago`
    : '';

  const rr = 2 * Math.PI * 35;

  const badgeOrder = [...earned, ...bl.filter((b) => !b.on).sort((a, c) => c.pct - a.pct)];

  return (
    <div className="feed">
      {/* GREETING */}
      <section className="greet">
        <div className="greet-row">
          <div style={{ minWidth: 0 }}>
            <div className="greet-t">
              {greetWord()}, {first ? first.charAt(0) + first.slice(1).toLowerCase() : 'there'}
            </div>
            {d ? (
              <div className="greet-d">
                {d.pts > 0 && (
                  <span className="gd up">
                    <Icon name="i-trend-up" c="ico ico-s" />
                    <b>+{fmt(d.pts)}</b> points
                  </span>
                )}
                {d.up > 0 && (
                  <span className="gd up">
                    <Icon name="i-chev-up" c="ico ico-s" />
                    up <b>{d.up}</b> place{d.up > 1 ? 's' : ''}
                  </span>
                )}
                {d.up < 0 && (
                  <span className="gd dn">
                    <Icon name="i-chev-down" c="ico ico-s" />
                    down <b>{-d.up}</b>
                  </span>
                )}
                {d.fresh.length > 0 && (
                  <span className="gd up">
                    <Icon name="i-award" c="ico ico-s" />
                    <b>{d.fresh.length}</b> new badge{d.fresh.length > 1 ? 's' : ''}
                  </span>
                )}
                <span className="gd-ago">{ago}</span>
              </div>
            ) : (
              <div className="greet-d">
                <span className="gd-ago">
                  {myBranch(s)} · {s.roles.find((r) => r.id === (s.viewAs || m.role))?.label || m.role}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PROFILE HERO */}
      <section className="hero" style={{ ['--tier-c' as any]: P.tier.c, ['--tier-l' as any]: P.tier.l, ['--tier-glow' as any]: P.tier.g }}>
        <div className="hero-top">
          <div className="ring-wrap">
            <svg className="ring" viewBox="0 0 80 80" aria-hidden>
              <defs>
                <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor={P.tier.l} />
                  <stop offset="1" stopColor={P.tier.c} />
                </linearGradient>
              </defs>
              <circle className="ring-bg" cx="40" cy="40" r="35" />
              <circle
                className="ring-fg"
                cx="40"
                cy="40"
                r="35"
                stroke="url(#rg)"
                strokeDasharray={rr}
                strokeDashoffset={animate ? (1 - P.pct / 100) * rr : rr}
              />
            </svg>
            <div className="ring-in">
              <div className="ring-av">{ini(m.name)}</div>
            </div>
            <div className="lvl-chip">LVL {P.level}</div>
          </div>
          <div className="hero-id">
            <div className="tier-pill">
              <i />
              {P.tier.name}
            </div>
            <div className="hero-name">{m.name}</div>
            <div className="hero-meta">
              <span>
                {m.role || 'DSE'} · {myBranch(s)}
              </span>
              <span className="hero-rk">
                RANK {rank || '—'}/{all.length}
              </span>
            </div>
          </div>
          <div className="hero-pts">
            <div className="hero-pts-v" ref={heroPtsRef as any}>
              0
            </div>
            <div className="hero-pts-l">Points</div>
          </div>
        </div>

        <div className="hero-body">
          <div className="xp">
            <div className="xp-head">
              <span>Level {P.level} progress</span>
              <span>
                <b ref={xpIntoRef as any}>0</b> / {fmt(s.cfg.season.levelStep)} XP
              </span>
            </div>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: animate ? P.pct + '%' : '0%' }} />
            </div>
            <div className="xp-foot">
              <Icon name="i-trend-up" c="ico ico-s" />
              {P.next ? (
                <>
                  <b>{fmt(P.toTier)}</b> points to reach <b style={{ color: P.next.c }}>{P.next.name}</b>
                </>
              ) : (
                <>
                  Top tier — you are in the <b style={{ color: P.tier.c }}>Hall of Fame</b>
                </>
              )}
            </div>
          </div>

          <div className="hero-stats">
            <div className="hs">
              <div className="hs-v">
                {curStreak(m)}
                <span style={{ color: 'var(--gold)' }}>
                  <Icon name="i-flame" c="ico ico-s" />
                </span>
              </div>
              <div className="hs-l">Day streak</div>
            </div>
            <div className="hs">
              <div className="hs-v">
                {earned.length}
                <span style={{ color: 'var(--dim)', fontSize: 15 }}>/{BADGES.length}</span>
              </div>
              <div className="hs-l">Badges</div>
            </div>
            <div className="hs">
              <div className="hs-v">{fmt(m.deals || 0)}</div>
              <div className="hs-l">Deals</div>
            </div>
          </div>
        </div>
      </section>

      <TodayCard />
      <MonthCard />

      {/* BADGES */}
      <div className="sec">
        <div className="sec-t">Badges</div>
        <div className="sec-ctrl">
          <a className="sec-a" onClick={() => s.go('badges')} style={{ marginLeft: 4 }}>
            {earned.length}/{BADGES.length} <Icon name="i-chev-r" c="ico ico-s" />
          </a>
        </div>
      </div>
      <div className="railmask">
        <div className="rail">
          {badgeOrder.map((b) => (
            <div
              key={b.id}
              className={`bdg ${b.on ? '' : 'locked'}`}
              onClick={() => s.go('badges')}
              title={`${b.hint}${b.on ? '' : ' — ' + badgeGap(b)}`}
            >
              <div className={`bdg-o ${b.on ? 'on' : 'off'}`}>
                {!b.on && (
                  <svg className="bdg-ring" viewBox="0 0 56 56" aria-hidden>
                    <circle cx="28" cy="28" r="26.5" />
                    <circle cx="28" cy="28" r="26.5" className="bdg-ring-f" strokeDasharray={2 * Math.PI * 26.5} strokeDashoffset={2 * Math.PI * 26.5 * (1 - b.pct / 100)} />
                  </svg>
                )}
                <Icon name={b.icon} c="ico ico-l" />
                {b.on && (
                  <span className="bdg-tick">
                    <Icon name="i-check" />
                  </span>
                )}
              </div>
              <div className="bdg-n">{b.name}</div>
              <div className="bdg-g">{b.on ? 'Earned' : badgeGap(b)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* LEADERBOARDS */}
      <Rail title="Points table" link="leaderboards" linkLabel="Full boards" onLink={() => s.go('leaderboards')}>
        {boards(s).map((b) => {
          const mi = b.list.findIndex((p) => p.uid === m.uid);
          const inTop = mi >= 0 && mi < 3;
          const top = b.list.slice(0, inTop ? 4 : 3);
          const above = mi > 0 ? b.list[mi - 1] : null;
          const gap = above ? (above.points || 0) - (m.points || 0) : 0;
          const row = (p: Player, i: number) => {
            const isMe = p.uid === m.uid;
            const medal = i < 3 ? `medal m${i + 1}` : '';
            return (
              <div className={`lb-r ${isMe ? 'me' : ''}`} key={p.uid + i}>
                <div className={`lb-rk ${medal}`}>{i + 1}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="lb-nm">{shownName(s, p, isMe, i)}</div>
                  <div className="lb-sub">
                    {p.role || ''}
                    {p.department && p.department !== 'Sales' ? ' · ' + p.department : ''}
                  </div>
                </div>
                <div className="lb-pt">{fmt(p.points)}</div>
              </div>
            );
          };
          return (
            <div className="lb-card" key={b.key} style={{ ['--l-c' as any]: b.c, ['--l-g' as any]: b.g }} onClick={() => { useStore.setState({ board: b.key }); s.go('leaderboards'); }}>
              <div className="lb-hd">
                <div className="lb-hd-ic">
                  <Icon name={b.i} c="ico ico-m" />
                </div>
                <div>
                  <div className="lb-hd-t">{b.t}</div>
                  <div className="lb-hd-s">
                    {b.s} · {b.list.length} players
                  </div>
                </div>
                <span className="lb-hd-go">
                  <Icon name="i-chev-r" c="ico ico-m" />
                </span>
              </div>
              <div className="lb-rows">
                {top.map((p, i) => row(p, i))}
                {!inTop && mi >= 0 && (
                  <>
                    <div style={{ textAlign: 'center', color: 'var(--dim)', fontSize: 11, letterSpacing: '.3em', padding: '2px 0' }}>···</div>
                    {row(b.list[mi], mi)}
                  </>
                )}
              </div>
              {above ? (
                <div className="lb-gap">
                  <Icon name="i-trend-up" c="ico ico-s" />
                  <span>
                    <b>{fmt(gap)}</b> behind {above.name.split(' ')[0]} · <b>{Math.max(1, Math.ceil(gap / 1000))}</b> car
                    {Math.ceil(gap / 1000) > 1 ? 's' : ''}
                  </span>
                </div>
              ) : mi === 0 ? (
                <div className="lb-gap" style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>
                  <Icon name="i-trophy" c="ico ico-s" />
                  <span>
                    You hold <b>P1</b> — defend it
                  </span>
                </div>
              ) : null}
            </div>
          );
        })}
      </Rail>

      {/* CONTESTS */}
      <Rail title="Contests" link="contests" linkLabel="All contests" onLink={() => s.go('contests')}>
        {s.contests.filter((c) => c.state !== 'ended').slice(0, 6).map((c) => (
          <ContestCard key={c.id} c={c} />
        ))}
      </Rail>

      <div style={{ height: 18 }} />
    </div>
  );
}

// ── TODAY ──
function TodayCard() {
  const s = useStore();
  const m = me(s);
  const open = s.daily.filter((t) => t.done < t.goal);
  const worth = open.reduce((a, t) => a + t.pts, 0);
  const gaps = s.kraModel
    .map((r) => ({ ...r, left: r.target - Math.min(r.done, r.target) }))
    .filter((r) => r.left > 0)
    .map((r) => ({ ...r, val: r.left * r.pts }))
    .sort((a, b) => b.val - a.val);
  const top = gaps[0];
  const isNew = !(m.points > 0);
  const day = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
  const cur = s.cfg.season.currency;

  if (isNew) {
    const starters = gaps.slice(-3).reverse().concat(gaps.slice(0, 1)).slice(0, 3);
    return (
      <section className="today">
        <div className="today-hd">
          <div>
            <div className="today-k">Welcome to Carverse Performance</div>
            <div className="today-t">Your first points are a few minutes away</div>
          </div>
        </div>
        <div className="today-note">
          Nothing here needs extra data entry. You work as you always do in ROI, and the scoresheet below credits you automatically. These are the quickest places to start.
        </div>
        <div className="today-list">
          {starters.map((r) => (
            <div className="tdy" key={r.name} onClick={() => s.go('kras')}>
              <div className="tdy-ic">
                <Icon name={r.icon} c="ico ico-m" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="tdy-t">{r.name}</div>
                <div className="tdy-s">
                  {r.target} this month · {cur}
                  {fmt(r.pts)} each
                </div>
              </div>
              <div className="tdy-v">
                {cur}
                {fmt(r.val)}
              </div>
            </div>
          ))}
        </div>
        <div className="today-ft">
          <button className="btn btn-p" onClick={() => s.openSheet({ type: 'scoring' })}>
            <Icon name="i-info" c="ico ico-s" />
            How points are earned
          </button>
          <button className="btn" onClick={() => s.go('kras')}>
            See my full scoresheet
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="today">
      <div className="today-hd">
        <div>
          <div className="today-k">{day}</div>
          <div className="today-t">{open.length ? `${open.length} thing${open.length > 1 ? 's' : ''} left today` : 'Everything for today is done'}</div>
        </div>
      </div>
      {open.length ? (
        <div className="today-list">
          {open.slice(0, 3).map((t) => {
            const pct = Math.round((t.done / t.goal) * 100);
            return (
              <div className="tdy" key={t.t} onClick={() => s.go('tasks')}>
                <div className="tdy-ic">
                  <Icon name={t.icon} c="ico ico-m" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="tdy-t">{t.t}</div>
                  <div className="tdy-s">
                    {t.done} of {t.goal} done
                  </div>
                  <div className="tdy-bar">
                    <i style={{ width: pct + '%' }} />
                  </div>
                </div>
                <div className="tdy-v">+{fmt(t.pts)}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="today-note">
          Your quests reset at midnight.{' '}
          {top && (
            <>
              The bigger win this month is <b style={{ color: 'var(--ink)' }}>{top.name}</b> — {top.left} more is worth {cur}
              {fmt(top.val)}.
            </>
          )}
        </div>
      )}
      <div className="today-ft">
        {open.length > 0 && (
          <span className="today-worth">
            {cur}
            {fmt(worth)} still open today
          </span>
        )}
        <button className="btn btn-p" onClick={() => s.openSheet({ type: 'coach' })}>
          <Icon name="i-spark" c="ico ico-s" />
          What should I do next?
        </button>
      </div>
    </section>
  );
}

// ── MONTH ACTIVITY GRID ──
function MonthCard() {
  const s = useStore();
  const m = me(s);
  const cells = useMemo(() => monthLevels(monthSeries(m)), [m]);
  const past = cells.filter((c) => !c.future);
  const tot = past.reduce((a, c) => a + c.v, 0);
  const act = past.filter((c) => c.v > 0).length;
  const best = longestRun(cells);
  const bestDay = past.reduce((a, c) => Math.max(a, c.v), 0);
  const cur = curStreak(m);
  const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const fdate = (d: Date) => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <section className="mon">
      <div className="mon-hd">
        <div>
          <div className="mon-k">Last 5 weeks</div>
          <div className="mon-t">{cur > 0 ? `${cur}-day scoring streak` : 'No streak running'}</div>
        </div>
        <div className="mon-sum">
          <div className="mon-sum-v">{fmt(tot)}</div>
          <div className="mon-sum-l">points banked</div>
        </div>
      </div>
      <div className="mon-body">
        <div className="mon-grid" role="img" aria-label="Daily scoring activity for the last five weeks">
          <div className="mon-dow">
            {DOW.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="mon-cells">
            {cells.map((c, i) => (
              <i
                key={i}
                className={`mc l${(c.lv ?? 0) < 0 ? 'x' : c.lv}${c.today ? ' now' : ''}`}
                title={c.future ? fdate(c.d) + ' — not yet' : fdate(c.d) + ' — ' + (c.v > 0 ? fmt(c.v) + ' points' : 'no scoring activity')}
              />
            ))}
          </div>
        </div>
        <div className="mon-side">
          <div className="mon-st">
            <b>
              {act}
              <span>/{past.length}</span>
            </b>
            <span>Days scored</span>
          </div>
          <div className="mon-st">
            <b>{best}</b>
            <span>Longest run</span>
          </div>
          <div className="mon-st">
            <b>{fmt(bestDay)}</b>
            <span>Best single day</span>
          </div>
          <div className="mon-st">
            <b>{fmt(Math.round(tot / Math.max(1, act)))}</b>
            <span>Average scoring day</span>
          </div>
        </div>
      </div>
      <div className="mon-ft">
        <Icon name="i-flame" c="ico ico-s" />
        {cur > 0 ? (
          <span>
            Score anything today and the run reaches <b>{cur + 1}</b> days.
          </span>
        ) : (
          <span>One scoring day starts a new run.</span>
        )}
        <div className="mon-lg">
          <span>Quiet</span>
          <i className="mc l0" />
          <i className="mc l1" />
          <i className="mc l2" />
          <i className="mc l3" />
          <span>Busy</span>
        </div>
      </div>
    </section>
  );
}
