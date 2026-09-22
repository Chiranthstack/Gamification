'use client';

import React from 'react';
import Icon from '../../../Icon';
import { useStore } from '@/lib/store';
import { fmt } from '@/lib/format';
import { CfgHd, DelBtn } from '../shared';

const cols = 'minmax(0,1.6fr) 84px 104px 34px';

export function CfgQuests() {
  const s = useStore();
  const addQuest = () => s.edit((st) => st.daily.push({ t: 'New quest', goal: 1, done: 0, icon: 'i-check-c', pts: 100 }));
  const delQuest = (i: number) => s.edit((st) => st.daily.splice(i, 1));

  return (
    <div className="cfg-card tbl">
      <CfgHd
        t="Daily quests"
        d="Short goals that reset each midnight. Keep them small enough to finish in a normal day — a quest nobody clears stops being a nudge and starts being noise."
        action={
          <button className="btn" onClick={addQuest}>
            <Icon name="i-plus" c="ico ico-s" />
            Add quest
          </button>
        }
      />
      <div className="cfg-head" style={{ gridTemplateColumns: cols }}>
        <span>Quest</span>
        <span style={{ textAlign: 'right' }}>Goal</span>
        <span style={{ textAlign: 'right' }}>Reward</span>
        <span />
      </div>
      {s.daily.map((t, i) => (
        <div className="cfg-row" style={{ gridTemplateColumns: cols }} key={i}>
          <input className="cfg-in txt" value={t.t} onChange={(e) => s.edit((st) => (st.daily[i].t = e.target.value))} />
          <input className="cfg-in num" type="number" min={1} value={t.goal} onChange={(e) => s.edit((st) => (st.daily[i].goal = Math.max(1, +e.target.value || 1)))} />
          <input className="cfg-in num" type="number" step={50} value={t.pts} onChange={(e) => s.edit((st) => (st.daily[i].pts = +e.target.value || 0))} />
          <DelBtn onClick={() => delQuest(i)} />
        </div>
      ))}
      <div className="cfg-foot">
        <b>A full clean sweep pays</b>
        <b className="num" style={{ color: 'var(--gold)' }}>
          {fmt(s.daily.reduce((sm, t) => sm + t.pts, 0))} {s.cfg.season.pointsLabel}
        </b>
      </div>
    </div>
  );
}
