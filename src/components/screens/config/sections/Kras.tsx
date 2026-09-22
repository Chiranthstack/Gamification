'use client';

import React from 'react';
import Icon from '../../../Icon';
import { useStore } from '@/lib/store';
import { kraTotals } from '@/lib/kra';
import { fmt } from '@/lib/format';
import { CfgHd, DelBtn } from '../shared';

const cols = 'minmax(0,1.5fr) 118px 88px 88px 96px 34px';

export function CfgKras() {
  const s = useStore();
  const T = kraTotals(s.kraModel);
  const groups = Array.from(new Set(s.kraModel.map((r) => r.grp)));
  const cur = s.cfg.season.currency;

  const addKra = () => s.edit((st) => st.kraModel.push({ name: 'New parameter', grp: 'Pipeline', target: 10, pts: 100, done: 0, icon: 'i-target' }));
  const delKra = (i: number) => s.edit((st) => st.kraModel.splice(i, 1));

  return (
    <div className="cfg-card tbl">
      <CfgHd
        t="KRA scoresheet"
        d="The monthly incentive sheet. Target is how many opportunities the role gets in a month; pointer value is what one of them pays. The ceiling below is what a perfect month is worth."
        action={
          <button className="btn" onClick={addKra}>
            <Icon name="i-plus" c="ico ico-s" />
            Add parameter
          </button>
        }
      />
      <div className="cfg-head" style={{ gridTemplateColumns: cols }}>
        <span>Parameter</span>
        <span>Group</span>
        <span style={{ textAlign: 'right' }}>Target</span>
        <span style={{ textAlign: 'right' }}>Each</span>
        <span style={{ textAlign: 'right' }}>Max value</span>
        <span />
      </div>
      {s.kraModel.map((r, i) => (
        <div className="cfg-row" style={{ gridTemplateColumns: cols }} key={i}>
          <input className="cfg-in txt" value={r.name} onChange={(e) => s.edit((st) => (st.kraModel[i].name = e.target.value))} />
          <select className="cfg-in" value={r.grp} style={{ fontSize: 11 }} onChange={(e) => s.edit((st) => (st.kraModel[i].grp = e.target.value))}>
            {groups.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
          <input className="cfg-in num" type="number" min={1} value={r.target} onChange={(e) => s.edit((st) => (st.kraModel[i].target = Math.max(1, +e.target.value || 1)))} />
          <input className="cfg-in num" type="number" step={50} value={r.pts} onChange={(e) => s.edit((st) => (st.kraModel[i].pts = +e.target.value || 0))} />
          <span className="cfg-calc">
            {cur}
            {fmt(r.target * r.pts)}
          </span>
          <DelBtn onClick={() => delKra(i)} />
        </div>
      ))}
      <div className="cfg-foot">
        <b>Monthly ceiling</b>
        <b className="num" style={{ color: 'var(--ink)', fontSize: 15 }}>
          {cur}
          {fmt(T.max)}
        </b>
      </div>
    </div>
  );
}
