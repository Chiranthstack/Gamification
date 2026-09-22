'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { myBranch } from '@/lib/selectors';
import { fmt } from '@/lib/format';

export default function Branches() {
  const s = useStore();
  const byB: Record<string, { n: number; pts: number; deals: number }> = {};
  (s.data?.leaderboard || []).forEach((p) => {
    const b = p.branch || '—';
    (byB[b] ??= { n: 0, pts: 0, deals: 0 });
    byB[b].n++;
    byB[b].pts += p.points || 0;
    byB[b].deals += p.deals || 0;
  });
  const base = Object.entries(byB).map(([name, v]) => ({ name, ...v, per: v.n ? Math.round(v.pts / v.n) : 0 }));
  const mode = s.brMode || 'total';
  const key = (mode === 'per' ? 'per' : 'pts') as 'per' | 'pts';
  const rows = base.slice().sort((a, b) => b[key] - a[key]);
  const mx = rows[0]?.[key] || 1;
  const lead = rows[0];
  const mine = myBranch(s);
  const mineRow = rows.find((b) => b.name === mine);
  const mineIdx = rows.findIndex((b) => b.name === mine);

  return (
    <div className="wide">
      <div className="page-hd">
        <div className="page-t">All Branches</div>
        <div className="page-d">Branches differ in headcount — switch to points per player for a like-for-like view.</div>
      </div>

      <div className="chips">
        <span className={`chip ${mode === 'total' ? 'on' : ''}`} onClick={() => useStore.setState({ brMode: 'total' })}>
          Total points
        </span>
        <span className={`chip ${mode === 'per' ? 'on' : ''}`} onClick={() => useStore.setState({ brMode: 'per' })}>
          Points per player
        </span>
      </div>

      {mineRow && (
        <div className="card" style={{ padding: '14px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 10, letterSpacing: '.12em', color: 'var(--mut)', fontWeight: 700, textTransform: 'uppercase' }}>Your branch</div>
            <div style={{ fontFamily: 'var(--disp)', fontSize: 19, fontWeight: 700, marginTop: 3 }}>
              {mineRow.name} <span style={{ color: 'var(--mut)' }}>· P{mineIdx + 1}</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>
            {mineIdx === 0 ? (
              `Leading on ${mode === 'per' ? 'points per player' : 'total points'}. Hold it.`
            ) : (
              <>
                <b style={{ color: 'var(--gold)', fontFamily: 'var(--mono)' }}>{fmt((lead[key] || 0) - (mineRow[key] || 0))}</b> {mode === 'per' ? 'points per player' : 'points'} behind {lead.name}.
              </>
            )}
          </div>
        </div>
      )}

      <div className="card">
        {rows.map((b, i) => {
          const isMine = b.name === mine;
          const medal = i < 3 ? `medal m${i + 1}` : '';
          const val = mode === 'per' ? b.per : b.pts;
          return (
            <div className={`lb-r ${isMine ? 'me' : ''}`} style={{ gridTemplateColumns: '30px 1fr 1.2fr 96px', padding: '14px 16px' }} key={b.name}>
              <div className={`lb-rk ${medal}`}>{i + 1}</div>
              <div>
                <div className="lb-nm">
                  {b.name}
                  {isMine && (
                    <span style={{ fontSize: 9, fontWeight: 800, background: 'var(--green)', color: 'var(--on-accent)', padding: '1px 6px', borderRadius: 4, marginLeft: 5 }}>YOU</span>
                  )}
                </div>
                <div className="lb-sub">
                  {b.n} players · {fmt(b.deals)} deals · {fmt(b.per)}/player
                </div>
              </div>
              <div className="bar">
                <i style={{ width: Math.max(3, (val / mx) * 100) + '%', background: i === 0 ? 'var(--gold)' : 'var(--violet)' }} />
              </div>
              <div className="lb-pt" style={{ textAlign: 'right', color: 'var(--ink)' }}>{fmt(val)}</div>
            </div>
          );
        })}
      </div>
      <div className="note" style={{ marginTop: 12 }}>
        {mode === 'per' ? 'Ranked by average points per player — headcount removed.' : 'Ranked by raw total. Larger branches have an advantage here.'}
      </div>
      <div style={{ height: 20 }} />
    </div>
  );
}
