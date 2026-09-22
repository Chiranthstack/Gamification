'use client';

import React from 'react';
import Icon from '../../../Icon';
import { useStore } from '@/lib/store';
import { TIER_LBL } from '@/lib/constants';
import { fmt } from '@/lib/format';
import { CfgHd, Sw, DelBtn } from '../shared';
import type { CodeRow } from '@/lib/types';

const cols = 'minmax(128px,.9fr) minmax(150px,1.5fr) 106px 86px 44px 30px';

export function CfgCodes() {
  const s = useStore();
  const active = s.codes.filter((c) => s.codeOn[c[0]] !== false).length;

  const addCode = () => s.edit((st) => st.codes.push(['NEW_EVENT_CODE', 'New action', 'm', 50] as CodeRow));
  const delCode = (i: number) =>
    s.edit((st) => {
      delete st.codeOn[st.codes[i][0]];
      st.codes.splice(i, 1);
    });

  return (
    <div className="cfg-card tbl">
      <CfgHd
        t="Scoring actions"
        d="The ROI event codes that pay points. Turn one off and it stops scoring immediately without losing its history. Negative values are penalties."
        action={
          <button className="btn" onClick={addCode}>
            <Icon name="i-plus" c="ico ico-s" />
            Add action
          </button>
        }
      />
      <div className="cfg-note">
        <Icon name="i-info" c="ico ico-m" />
        <span>
          These are the real event codes the dealership system already emits, so nothing new has to be logged by hand. Everything not listed here scores zero — that is deliberate.
        </span>
      </div>
      <div className="cfg-head" style={{ gridTemplateColumns: cols }}>
        <span>Event code</span>
        <span>Shown as</span>
        <span>Kind</span>
        <span style={{ textAlign: 'right' }}>Points</span>
        <span style={{ textAlign: 'center' }}>On</span>
        <span />
      </div>
      {s.codes.map(([code, lbl, t, pts], i) => {
        const on = s.codeOn[code] !== false;
        return (
          <div className="cfg-row" style={{ gridTemplateColumns: cols, opacity: on ? 1 : 0.5 }} key={i}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--cyan)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{code}</span>
            <input className="cfg-in txt" value={lbl} onChange={(e) => s.edit((st) => (st.codes[i][1] = e.target.value))} />
            <select className="cfg-in" value={t} style={{ fontSize: 11 }} onChange={(e) => s.edit((st) => (st.codes[i][2] = e.target.value))}>
              {Object.entries(TIER_LBL).map(([k, v]) => (
                <option value={k} key={k}>
                  {v[0]}
                </option>
              ))}
            </select>
            <input
              className="cfg-in num"
              type="number"
              step={10}
              value={pts}
              style={{ color: pts < 0 ? 'var(--red)' : 'var(--ink)' }}
              onChange={(e) => s.edit((st) => (st.codes[i][3] = +e.target.value || 0))}
            />
            <Sw on={on} onToggle={() => s.edit((st) => (st.codeOn[code] = !on))} />
            <DelBtn onClick={() => delCode(i)} />
          </div>
        );
      })}
      <div className="cfg-foot">
        <b>
          {active} of {s.codes.length} active
        </b>
        <span style={{ color: 'var(--mut)' }}>
          Highest single award: <b className="num" style={{ color: 'var(--gold)' }}>{fmt(Math.max(...s.codes.map((c) => c[3])))}</b>
        </span>
      </div>
    </div>
  );
}
