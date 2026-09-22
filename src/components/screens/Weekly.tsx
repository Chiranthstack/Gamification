'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { me, roster, aDept } from '@/lib/selectors';
import { weekSeries } from '@/lib/series';
import { fmt } from '@/lib/format';

export default function Weekly() {
  const s = useStore();
  const m = me(s);
  const v = weekSeries(m);
  const tot = v.reduce((a, b) => a + b, 0);
  const mx = Math.max(...v) || 1;
  const avg = Math.round(tot / 7);
  const best = v.indexOf(mx);
  const D = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const pool = roster(s);
  const teamAvg = Math.round(pool.reduce((sm, p) => sm + (p.points || 0), 0) / (pool.length || 1) / 4);
  const src = [
    { l: 'Bookings created', p: 34 },
    { l: 'Invoices approved', p: 24 },
    { l: 'Deliveries closed', p: 19 },
    { l: 'Finance attached', p: 14 },
    { l: 'Other actions', p: 9 },
  ].map((r, i) => ({ ...r, o: 1 - i * 0.16 }));

  const top = Math.max(1, ...v);
  const step = Math.ceil(top / 3 / 50) * 50 || 50;
  const ceiling = step * 3;
  const ticks = [3, 2, 1, 0].map((k) => k * step);

  return (
    <div className="wide">
      <div className="page-hd">
        <div className="page-t">Weekly Performance</div>
        <div className="page-d">How your scoring spreads across the week.</div>
      </div>
      <div className="tstrip">
        <div className="tcell">
          <div className="tcell-l">Points this week</div>
          <div className="tcell-v">{fmt(tot)}</div>
          <div className="tcell-s">across 7 days</div>
        </div>
        <div className="tcell">
          <div className="tcell-l">Daily average</div>
          <div className="tcell-v">{fmt(avg)}</div>
          <div className="tcell-s">points per day</div>
        </div>
        <div className="tcell">
          <div className="tcell-l">Best day</div>
          <div className="tcell-v" style={{ color: 'var(--gold)' }}>{D[best]}</div>
          <div className="tcell-s">{fmt(mx)} points</div>
        </div>
        <div className="tcell">
          <div className="tcell-l">Active days</div>
          <div className="tcell-v" style={{ color: 'var(--cyan)' }}>
            {v.filter((x) => x > 0).length}
            <span style={{ color: 'var(--dim)', fontSize: 16 }}>/7</span>
          </div>
          <div className="tcell-s">days with activity</div>
        </div>
      </div>

      <div className="card chartc">
        <div className="chart-hd">
          <div className="card-t">Points per day</div>
          <div className="chart-lg">
            <span className="chart-key today" />
            Today
            <span className="chart-key avg" />
            Average {fmt(avg)}
          </div>
        </div>
        <div className="chart">
          <div className="chart-y">
            {ticks.map((t, i) => (
              <span key={i}>{fmt(t)}</span>
            ))}
          </div>
          <div className="chart-plot">
            {ticks.map((t, i) => (
              <div className="chart-grid" style={{ bottom: (t / ceiling) * 100 + '%' }} key={i} />
            ))}
            <div className="chart-avg" style={{ bottom: Math.min(100, (avg / ceiling) * 100) + '%' }} />
            <div className="chart-bars">
              {v.map((x, i) => (
                <div className="chart-col" title={`${D[i]}: ${fmt(x)} points`} key={i}>
                  <div className={`chart-bar ${i === 6 ? 'on' : ''}`} style={{ height: Math.max(1, (x / ceiling) * 100) + '%' }}>
                    <span className="chart-val">{fmt(x)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="chart-x">
          {v.map((x, i) => (
            <span className={i === 6 ? 'on' : ''} key={i}>
              {D[i]}
            </span>
          ))}
        </div>
      </div>

      <div className="grid2">
        <div>
          <div className="sec">
            <div className="sec-t">Where points came from</div>
          </div>
          <div className="card" style={{ padding: '6px 16px 14px' }}>
            {src.map((si) => (
              <div style={{ padding: '11px 0', borderBottom: '1px solid var(--line)' }} key={si.l}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 7 }}>
                  <span>{si.l}</span>
                  <b>{si.p}%</b>
                </div>
                <div className="bar">
                  <i style={{ width: si.p + '%', background: 'var(--green)', opacity: si.o }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="sec">
            <div className="sec-t">Against your team</div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            {[
              { l: 'You', v: tot, hl: true },
              { l: aDept(s) + ' average', v: teamAvg },
              { l: 'Top performer', v: Math.round((pool[0]?.points || 0) / 4) },
            ].map((r) => {
              const mxv = Math.max(tot, teamAvg, Math.round((pool[0]?.points || 0) / 4)) || 1;
              return (
                <div style={{ marginBottom: 17 }} key={r.l}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 7 }}>
                    <span style={r.hl ? { color: 'var(--ink)', fontWeight: 600 } : undefined}>{r.l}</span>
                    <b className="num">{fmt(r.v)}</b>
                  </div>
                  <div className="bar">
                    <i style={{ width: (r.v / mxv) * 100 + '%', background: r.hl ? 'var(--green)' : 'var(--surf-3)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ height: 20 }} />
    </div>
  );
}
