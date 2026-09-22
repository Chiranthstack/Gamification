'use client';

import React from 'react';
import Icon from '../../../Icon';
import { useStore } from '@/lib/store';
import { CfgHd, Sw, DelBtn } from '../shared';
import type { BoardCfg } from '@/lib/types';

const cols = 'minmax(0,1fr) minmax(150px,1.5fr) 126px 74px 44px 30px';
const scopes: Record<string, string> = { role: 'Same role, same branch', branch: 'Whole branch, all roles', dept: 'Whole department, all branches', all: 'Everyone' };
const ties: Record<string, string> = { deals: 'Most deals', events: 'Most events', streak: 'Longest streak', name: 'Alphabetical' };

export function CfgBoards() {
  const s = useStore();
  const onCount = s.cfg.boards.filter((b) => b.on).length;

  const addBoard = () => s.edit((st) => st.cfg.boards.push({ key: 'b' + Date.now(), t: 'New board', scope: 'branch', on: true, top: 10, tie: 'deals' } as BoardCfg));
  const delBoard = (i: number) => s.edit((st) => st.cfg.boards.splice(i, 1));

  return (
    <div className="cfg-card tbl">
      <CfgHd
        t="Leaderboards"
        d="Which boards employees can open, who each one compares them against, and how ties are broken. Turning a board off removes it from the home rail and the boards page."
        action={
          <button className="btn" onClick={addBoard}>
            <Icon name="i-plus" c="ico ico-s" />
            Add board
          </button>
        }
      />
      <div className="cfg-head" style={{ gridTemplateColumns: cols }}>
        <span>Board name</span>
        <span>Compares against</span>
        <span>Tie-break</span>
        <span style={{ textAlign: 'right' }}>Show top</span>
        <span style={{ textAlign: 'center' }}>On</span>
        <span />
      </div>
      {s.cfg.boards.map((b, i) => (
        <div className="cfg-row" style={{ gridTemplateColumns: cols, opacity: b.on ? 1 : 0.5 }} key={i}>
          <input className="cfg-in txt" value={b.t} onChange={(e) => s.edit((st) => (st.cfg.boards[i].t = e.target.value))} />
          <select className="cfg-in" value={b.scope} style={{ fontSize: 11 }} onChange={(e) => s.edit((st) => (st.cfg.boards[i].scope = e.target.value as any))}>
            {Object.entries(scopes).map(([k, v]) => (
              <option value={k} key={k}>
                {v}
              </option>
            ))}
          </select>
          <select className="cfg-in" value={b.tie} style={{ fontSize: 11 }} onChange={(e) => s.edit((st) => (st.cfg.boards[i].tie = e.target.value as any))}>
            {Object.entries(ties).map(([k, v]) => (
              <option value={k} key={k}>
                {v}
              </option>
            ))}
          </select>
          <input className="cfg-in num" type="number" min={3} max={50} value={b.top} onChange={(e) => s.edit((st) => (st.cfg.boards[i].top = Math.max(3, +e.target.value || 10)))} />
          <Sw on={b.on} onToggle={() => s.edit((st) => (st.cfg.boards[i].on = !st.cfg.boards[i].on))} />
          {s.cfg.boards.length > 1 ? <DelBtn onClick={() => delBoard(i)} /> : <span />}
        </div>
      ))}
      <div className="cfg-foot">
        <span style={{ color: 'var(--mut)' }}>
          Employees see {onCount} board{onCount === 1 ? '' : 's'} on their home screen.
        </span>
      </div>
    </div>
  );
}
