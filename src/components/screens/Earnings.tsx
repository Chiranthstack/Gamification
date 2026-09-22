'use client';

import React from 'react';
import Icon from '../Icon';
import { useStore } from '@/lib/store';
import { kraTotals } from '@/lib/kra';
import { fmt } from '@/lib/format';
import { useCountUp } from '@/lib/hooks';

export default function Earnings() {
  const s = useStore();
  const T = kraTotals(s.kraModel);
  const gaps = s.kraModel
    .map((r) => ({ ...r, gap: r.target - Math.min(r.done, r.target) }))
    .map((r) => ({ ...r, val: r.gap * r.pts }))
    .filter((r) => r.gap > 0)
    .sort((a, b) => b.val - a.val)
    .slice(0, 4);
  const earnRef = useCountUp(T.got, 1100);

  return (
    <div className="wide">
      <div className="page-hd">
        <div className="page-t">Earnings estimate</div>
        <div className="page-d">This month&apos;s incentive, projected from your scoresheet.</div>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 18, background: 'linear-gradient(140deg,var(--surf-2),var(--surf))', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: '-30% -20% 40% 55%', borderRadius: '50%', background: 'radial-gradient(circle,var(--green-g),transparent 68%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap', position: 'relative' }}>
          <div style={{ flex: 1, minWidth: 230 }}>
            <div style={{ fontSize: 10, color: 'var(--mut)', letterSpacing: '.14em', fontWeight: 700, textTransform: 'uppercase' }}>Projected this month</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 8 }}>
              <span style={{ fontFamily: 'var(--disp)', fontSize: 26, fontWeight: 700, color: 'var(--mut)' }}>₹</span>
              <span className="dnum" ref={earnRef as any} style={{ fontSize: 44, color: 'var(--ink)' }}>0</span>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--mut)', marginTop: 6 }}>
              of <b style={{ color: 'var(--ink)' }}>₹{fmt(T.max)}</b> possible
            </div>
            <div className="bar" style={{ height: 9, marginTop: 14, maxWidth: 420 }}>
              <i style={{ width: T.pct + '%', background: 'var(--green)' }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--mut)', marginTop: 9 }}>
              <b style={{ color: 'var(--ink)' }}>₹{fmt(T.left)}</b> still achievable if you close every open opportunity
            </div>
          </div>
          <div style={{ display: 'flex', gap: 26, flexShrink: 0 }}>
            <div style={{ textAlign: 'center' }}>
              <div className="dnum" style={{ fontSize: 26 }}>{T.pct}%</div>
              <div style={{ fontSize: 9.5, color: 'var(--mut)', letterSpacing: '.1em', fontWeight: 700, textTransform: 'uppercase', marginTop: 5 }}>Locked in</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="dnum" style={{ fontSize: 26 }}>
                {s.kraModel.filter((r) => r.done >= r.target).length}
                <span style={{ color: 'var(--dim)', fontSize: 17 }}>/{s.kraModel.length}</span>
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--mut)', letterSpacing: '.1em', fontWeight: 700, textTransform: 'uppercase', marginTop: 5 }}>Maxed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="sec">
        <div className="sec-t">Where your next rupees are</div>
        <span className="sec-n">HIGHEST VALUE FIRST</span>
      </div>
      <div className="card" style={{ marginBottom: 18 }}>
        {gaps.map((r) => (
          <div style={{ display: 'grid', gridTemplateColumns: '38px 1fr auto', gap: 13, alignItems: 'center', padding: '13px 16px', borderBottom: '1px solid var(--line)' }} key={r.name}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--surf-2)', color: 'var(--mut)', display: 'grid', placeItems: 'center' }}>
              <Icon name={r.icon} c="ico ico-m" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
              <div style={{ fontSize: 11, color: 'var(--mut)', marginTop: 2 }}>
                {r.gap} more × ₹{fmt(r.pts)} · {r.done}/{r.target} done
              </div>
            </div>
            <div className="dnum" style={{ fontSize: 17, color: 'var(--gold)' }}>+₹{fmt(r.val)}</div>
          </div>
        ))}
      </div>

      <div className="sec">
        <div className="sec-t">Full breakdown</div>
      </div>
      <div className="card">
        {s.kraModel.map((r) => {
          const done = Math.min(r.done, r.target);
          const pct = Math.round((done / r.target) * 100);
          const full = done >= r.target;
          return (
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr auto', gap: 14, alignItems: 'center', padding: '11px 16px', borderBottom: '1px solid var(--line)' }} key={r.name}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: full ? 600 : 500, color: full ? 'var(--green)' : 'var(--ink)' }}>{r.name}</div>
                <div style={{ fontSize: 10.5, color: 'var(--mut)', fontFamily: 'var(--mono)', marginTop: 2 }}>
                  {done} of {r.target}
                </div>
              </div>
              <div className="bar">
                <i style={{ width: pct + '%', background: full ? 'var(--green)' : 'var(--gold)' }} />
              </div>
              <div style={{ textAlign: 'right', minWidth: 110, fontSize: 12.5 }}>
                <b>₹{fmt(done * r.pts)}</b>
                <span style={{ color: 'var(--dim)', fontSize: 11 }}> / ₹{fmt(r.target * r.pts)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ height: 20 }} />
    </div>
  );
}
