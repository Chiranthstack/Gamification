'use client';

import React from 'react';
import Icon from '../../../Icon';
import { useStore } from '@/lib/store';
import { FMT_COLOR } from '@/lib/constants';
import { CfgHd, DelBtn } from '../shared';
import type { Contest } from '@/lib/types';

const states: Record<string, string> = { live: 'Live now', upc: 'Upcoming', ended: 'Ended' };

export function CfgContests() {
  const s = useStore();
  const fmts = Object.keys(FMT_COLOR).filter((k) => k === k.toUpperCase());
  const set = (fn: (c: Contest[]) => void) => {
    const contests = s.contests.slice();
    fn(contests);
    useStore.setState({ contests, cfgDirty: s.cfgDirty + 1, rev: s.rev + 1 });
  };
  const editC = (i: number, patch: Partial<Contest>) => set((c) => (c[i] = { ...c[i], ...patch }));
  const addContest = () => set((c) => c.unshift({ id: 'c' + Date.now(), fmt: 'SPRINT', name: 'New contest', desc: '', prize: '', time: 'Starts soon', state: 'upc', players: 0, joined: false }));
  const delContest = (i: number) => set((c) => c.splice(i, 1));

  return (
    <div className="cfg-card">
      <CfgHd
        t="Contests"
        d="Time-boxed challenges. Anything created here appears on the home rail and the contests page straight away, so a manager can open a Friday sprint without waiting on a release."
        action={
          <button className="btn btn-p" onClick={addContest}>
            <Icon name="i-plus" c="ico ico-s" />
            New contest
          </button>
        }
      />
      {s.contests.map((c, i) => (
        <div style={{ padding: '15px 17px', borderBottom: '1px solid var(--line)' }} key={c.id}>
          <div className="ct-edit-a">
            <input className="cfg-in txt" value={c.name} style={{ fontWeight: 600 }} onChange={(e) => editC(i, { name: e.target.value })} />
            <select className="cfg-in" value={c.fmt} style={{ fontSize: 11 }} onChange={(e) => editC(i, { fmt: e.target.value })}>
              {fmts.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
            <select className="cfg-in" value={c.state} style={{ fontSize: 11 }} onChange={(e) => editC(i, { state: e.target.value as any })}>
              {Object.entries(states).map(([k, v]) => (
                <option value={k} key={k}>
                  {v}
                </option>
              ))}
            </select>
            <DelBtn onClick={() => delContest(i)} />
          </div>
          <div className="ct-edit-b">
            <input className="cfg-in txt" value={c.desc || ''} placeholder="What people have to do" onChange={(e) => editC(i, { desc: e.target.value })} />
            <input className="cfg-in txt" value={c.prize || ''} placeholder="Prize" onChange={(e) => editC(i, { prize: e.target.value })} />
            <input className="cfg-in txt" value={c.time || ''} placeholder="e.g. 3 days left" onChange={(e) => editC(i, { time: e.target.value })} />
          </div>
        </div>
      ))}
      <div className="cfg-foot">
        <span style={{ color: 'var(--mut)' }}>
          {s.contests.filter((c) => c.state === 'live').length} live · {s.contests.filter((c) => c.state === 'upc').length} upcoming · {s.contests.filter((c) => c.state === 'ended').length} ended
        </span>
        <button className="btn" onClick={() => s.go('contests')}>
          Preview as employee
        </button>
      </div>
    </div>
  );
}
