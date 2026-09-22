'use client';

import React from 'react';
import Icon from '../../../Icon';
import { useStore } from '@/lib/store';
import { CfgHd, DelBtn } from '../shared';

const cols = 'minmax(0,1fr) 100px 120px 34px';

export function CfgDepts() {
  const s = useStore();

  const addDept = () => {
    const n = typeof window !== 'undefined' ? window.prompt('Department name') : '';
    if (!n) return;
    s.edit((st) => (st.deptMult[n] = 1));
  };
  const delDept = (d: string) =>
    s.edit((st) => {
      delete st.deptMult[d];
    });

  return (
    <div className="cfg-card tbl">
      <CfgHd
        t="Department multipliers"
        d="Departments normally compete only against their own. On a cross-department board, points are scaled by these first, so a high-volume back-office role does not drown out sales on raw event count."
        action={
          <button className="btn" onClick={addDept}>
            <Icon name="i-plus" c="ico ico-s" />
            Add department
          </button>
        }
      />
      {!s.cfg.rules.crossDept.on && (
        <div className="cfg-note" style={{ borderLeftColor: 'var(--gold)' }}>
          <Icon name="i-alert" c="ico ico-m" />
          <span style={{ color: 'var(--gold)' }}>Cross-department boards are switched off in Season &amp; rules, so these multipliers are not being applied right now.</span>
        </div>
      )}
      <div className="cfg-head" style={{ gridTemplateColumns: cols }}>
        <span>Department</span>
        <span style={{ textAlign: 'right' }}>Multiplier</span>
        <span style={{ textAlign: 'right' }}>Effect</span>
        <span />
      </div>
      {Object.entries(s.deptMult).map(([d, v]) => (
        <div className="cfg-row" style={{ gridTemplateColumns: cols }} key={d}>
          <b style={{ fontSize: 12.5 }}>{d}</b>
          <input
            className="cfg-in num"
            type="number"
            step={0.1}
            min={0}
            max={3}
            value={(+v).toFixed(1)}
            onChange={(e) => s.edit((st) => (st.deptMult[d] = isNaN(+e.target.value) ? 1 : +e.target.value))}
          />
          <span style={{ fontSize: 11, color: v == 1 ? 'var(--dim)' : v < 1 ? 'var(--gold)' : 'var(--green)', fontFamily: 'var(--mono)', textAlign: 'right' }}>
            {v == 1 ? 'baseline' : v < 1 ? (100 - v * 100).toFixed(0) + '% down' : '+' + (v * 100 - 100).toFixed(0) + '%'}
          </span>
          <DelBtn onClick={() => delDept(d)} />
        </div>
      ))}
    </div>
  );
}
