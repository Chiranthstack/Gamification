'use client';

import React from 'react';
import Icon from '../Icon';
import { useStore } from '@/lib/store';
import { me, division } from '@/lib/selectors';
import { badgesFor, badgeGap, type ComputedBadge } from '@/lib/badges';

export default function Badges() {
  const s = useStore();
  const m = me(s);
  const rank = division(s).findIndex((p) => p.uid === m.uid) + 1;
  const bl = badgesFor(m, rank, s.cfg);
  const on = bl.filter((b) => b.on);
  const off = bl.filter((b) => !b.on).sort((a, c) => c.pct - a.pct);
  const pct = Math.round((on.length / bl.length) * 100);

  const tile = (b: ComputedBadge) => (
    <div className={`btile ${b.on ? 'won' : ''}`} key={b.id}>
      <div className="btile-o">
        <Icon name={b.icon} c="ico ico-xl" />
        {b.on && (
          <span className="btile-tick">
            <Icon name="i-check" />
          </span>
        )}
      </div>
      <div className="btile-n">{b.name}</div>
      <div className="btile-h">{b.hint}</div>
      {b.on ? (
        <div className="btile-p earned">
          <Icon name="i-check-c" c="ico ico-s" />
          Earned
        </div>
      ) : (
        <>
          <div className="btile-bar">
            <i style={{ width: b.pct + '%' }} />
          </div>
          <div className="btile-p">{badgeGap(b)}</div>
        </>
      )}
    </div>
  );

  return (
    <div className="wide">
      <div className="page-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div className="page-t">Achievements</div>
          <div className="page-d">Earned automatically from real scoring activity — nothing to claim by hand.</div>
        </div>
        <div className="hd-stat">
          <div className="dnum" style={{ fontSize: 30, color: 'var(--ink)' }}>
            {on.length}
            <span style={{ color: 'var(--dim)', fontSize: 19 }}>/{bl.length}</span>
          </div>
          <div className="hd-stat-l">Unlocked</div>
        </div>
      </div>
      <div className="card" style={{ padding: 16, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
          <span style={{ color: 'var(--mut)' }}>Collection progress</span>
          <b style={{ color: 'var(--ink)' }}>{pct}%</b>
        </div>
        <div className="bar" style={{ height: 9 }}>
          <i style={{ width: pct + '%', background: 'var(--gold)' }} />
        </div>
      </div>
      <div className="sec">
        <div className="sec-t">Unlocked</div>
        <span className="sec-n">{on.length} earned</span>
      </div>
      {on.length ? (
        <div className="grid4" style={{ marginBottom: 20 }}>
          {on.map(tile)}
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="empty">
            <Icon name="i-badge" c="ico ico-xl" />
            <h4>None yet</h4>
            <p>Your first logged deal earns your first badge.</p>
          </div>
        </div>
      )}
      <div className="sec">
        <div className="sec-t">Still to unlock</div>
        <span className="sec-n">{off.length} remaining</span>
      </div>
      <div className="grid4">{off.map(tile)}</div>
      <div style={{ height: 20 }} />
    </div>
  );
}
