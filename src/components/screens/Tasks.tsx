'use client';

import React from 'react';
import Icon from '../Icon';
import { useStore } from '@/lib/store';
import { fmt } from '@/lib/format';

export default function Tasks() {
  const s = useStore();
  const DAILY = s.daily;
  const done = DAILY.filter((t) => t.done >= t.goal).length;
  const pct = Math.round((DAILY.reduce((sm, t) => sm + Math.min(1, t.done / t.goal), 0) / DAILY.length) * 100);
  const earned = DAILY.reduce((sm, t) => sm + (t.done >= t.goal ? t.pts : 0), 0);

  return (
    <div className="wide">
      <div className="page-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div className="page-t">Daily Tasks &amp; Quests</div>
          <div className="page-d">Short goals that reset each midnight.</div>
        </div>
        <div className="hd-stat">
          <div className="dnum" style={{ fontSize: 30, color: 'var(--ink)' }}>
            {done}
            <span style={{ color: 'var(--dim)', fontSize: 19 }}>/{DAILY.length}</span>
          </div>
          <div className="hd-stat-l">Complete today</div>
        </div>
      </div>
      <div className="card" style={{ padding: 16, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
          <span style={{ color: 'var(--mut)' }}>
            Today&apos;s progress · <b style={{ color: 'var(--gold)' }}>{fmt(earned)}</b> pointers banked
          </span>
          <b style={{ color: 'var(--ink)' }}>{pct}%</b>
        </div>
        <div className="bar" style={{ height: 9 }}>
          <i style={{ width: pct + '%', background: 'var(--green)' }} />
        </div>
      </div>
      <div className="card" style={{ marginBottom: 18 }}>
        {DAILY.map((t, idx) => {
          const p = Math.round(Math.min(1, t.done / t.goal) * 100);
          const full = t.done >= t.goal;
          return (
            <div className={`krow${full ? ' done' : ''}`} style={{ ['--ic' as any]: '40px' }} key={idx}>
              <div className="krow-ic" style={{ width: 40, height: 40, borderRadius: 11, background: full ? 'var(--green)' : 'var(--surf-2)', color: full ? 'var(--on-accent)' : 'var(--mut)' }}>
                <Icon name={full ? 'i-check' : t.icon} c="ico ico-m" />
              </div>
              <div className="krow-id">
                <div className="krow-n" style={{ fontSize: 13.5, color: full ? 'var(--green)' : 'var(--ink)' }}>{t.t}</div>
                <div className="krow-s" style={{ fontFamily: 'var(--sans)', fontSize: 11 }}>
                  {t.done} of {t.goal} · <b style={{ color: 'var(--gold)' }}>+{fmt(t.pts)}</b> pointers
                </div>
              </div>
              <div className="krow-b">
                <div className="bar">
                  <i style={{ width: p + '%', background: full ? 'var(--green)' : 'var(--gold)' }} />
                </div>
              </div>
              <div className="krow-v">
                <div className="dnum" style={{ fontSize: 15, color: full ? 'var(--green)' : 'var(--ink)' }}>{p}%</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="sec">
        <div className="sec-t">This week&apos;s quest</div>
        <span className="sec-n">Longer challenge</span>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--violet-g)', color: 'var(--violet)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Icon name="i-target" c="ico ico-xl" />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: 'var(--disp)', fontSize: 19, fontWeight: 700 }}>Close 10 deliveries this week</div>
            <div style={{ fontSize: 12, color: 'var(--mut)', marginTop: 4 }}>
              Finish the week with ten gate passes issued and unlock a bonus multiplier on next week&apos;s bookings.
            </div>
            <div className="bar" style={{ marginTop: 12 }}>
              <i style={{ width: '60%', background: 'var(--violet)' }} />
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div className="dnum" style={{ fontSize: 28 }}>
              6<span style={{ color: 'var(--dim)', fontSize: 18 }}>/10</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--mut)', marginTop: 2 }}>3 days left</div>
          </div>
        </div>
      </div>
      <div style={{ height: 20 }} />
    </div>
  );
}
