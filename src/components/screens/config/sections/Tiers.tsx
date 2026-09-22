'use client';

import React from 'react';
import Icon from '../../../Icon';
import { useStore } from '@/lib/store';
import { prog } from '@/lib/progression';
import { fmt } from '@/lib/format';
import { CfgHd, DelBtn } from '../shared';

const cols = 'minmax(0,1fr) 120px 110px 78px 34px';

export function CfgTiers() {
  const s = useStore();
  const step = s.cfg.season.levelStep;
  const counts: Record<string, number> = {};
  s.tiers.forEach((t) => (counts[t.name] = 0));
  (s.data?.leaderboard || []).forEach((p) => {
    const name = prog(p.points, step, s.tiers).tier.name;
    counts[name] = (counts[name] || 0) + 1;
  });

  const addTier = () =>
    s.edit((st) => {
      const last = st.tiers[st.tiers.length - 1];
      st.tiers.push({ name: 'New tier', min: (last?.min || 0) + 25000, c: '#7D899E', l: '#A4AEC0', g: 'rgba(125,137,158,.16)' });
    });
  const delTier = (i: number) => s.edit((st) => st.tiers.splice(i, 1));

  return (
    <div className="cfg-card tbl">
      <CfgHd
        t="Tiers & levels"
        d={`Players climb one level every ${fmt(step)} points and unlock a named tier at the thresholds below. The player counts show how the current roster would fall out.`}
        action={
          <button className="btn" onClick={addTier}>
            <Icon name="i-plus" c="ico ico-s" />
            Add tier
          </button>
        }
      />
      <div className="cfg-head" style={{ gridTemplateColumns: cols }}>
        <span>Tier</span>
        <span style={{ textAlign: 'right' }}>Unlocks at</span>
        <span style={{ textAlign: 'right' }}>Players now</span>
        <span style={{ textAlign: 'right' }}>Level</span>
        <span />
      </div>
      {s.tiers.map((t, i) => (
        <div className="cfg-row" style={{ gridTemplateColumns: cols }} key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <span className="cfg-swatch" style={{ background: t.c }} />
            <input className="cfg-in txt" value={t.name} onChange={(e) => s.edit((st) => (st.tiers[i].name = e.target.value))} />
          </div>
          {i === 0 ? (
            <span style={{ color: 'var(--dim)', fontSize: 11.5, textAlign: 'right' }}>starting tier</span>
          ) : (
            <input className="cfg-in num" type="number" step={500} min={0} value={t.min} onChange={(e) => s.edit((st) => (st.tiers[i].min = +e.target.value || 0))} />
          )}
          <span className="cfg-calc" style={{ color: 'var(--mut)' }}>{counts[t.name] || 0}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)', textAlign: 'right' }}>L{Math.floor(t.min / step) + 1}+</span>
          {i > 1 ? <DelBtn onClick={() => delTier(i)} /> : <span />}
        </div>
      ))}
    </div>
  );
}
