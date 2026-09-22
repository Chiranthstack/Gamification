'use client';

import React from 'react';
import Icon from '../Icon';
import ContestCard from '../ContestCard';
import { useStore } from '@/lib/store';
import { LADDER, FMT_COLOR } from '@/lib/constants';
import type { Contest } from '@/lib/types';

const tabs = [
  { k: 'live', t: 'Live now' },
  { k: 'upc', t: 'Upcoming' },
  { k: 'mine', t: 'My contests' },
  { k: 'ended', t: 'Ended' },
];
const pick: Record<string, (c: Contest) => boolean> = {
  live: (c) => c.state === 'live',
  upc: (c) => c.state === 'upc',
  mine: (c) => c.joined,
  ended: (c) => c.state === 'ended',
};

export default function Contests() {
  const s = useStore();
  const tab = s.contestTab;
  const list = s.contests.filter(pick[tab]);

  return (
    <div className="wide">
      <div className="page-hd">
        <div className="page-t">Contests</div>
        <div className="page-d">Time-boxed challenges anyone can join. The format tells you the length.</div>
      </div>
      <div className="chips">
        {tabs.map((t) => (
          <span key={t.k} className={`chip ${tab === t.k ? 'on' : ''}`} onClick={() => useStore.setState({ contestTab: t.k })}>
            {t.t} <b style={{ fontFamily: 'var(--mono)', fontSize: 10 }}>{s.contests.filter(pick[t.k]).length}</b>
          </span>
        ))}
      </div>
      {list.length ? (
        <div className="grid3">
          {list.map((c) => (
            <ContestCard key={c.id} c={c} wide />
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty">
            <Icon name="i-trophy" c="ico ico-xl" />
            <h4>Nothing here yet</h4>
            <p>{tab === 'mine' ? 'You have not joined a contest. Live ones need a single tap.' : 'Check back — new contests open weekly.'}</p>
            {tab === 'mine' && (
              <button className="btn btn-p" style={{ marginTop: 14 }} onClick={() => useStore.setState({ contestTab: 'live' })}>
                See live contests
              </button>
            )}
          </div>
        </div>
      )}

      <div className="sec" style={{ marginTop: 26 }}>
        <div className="sec-t">The format ladder</div>
        <span className="sec-n">Longer format, bigger prize</span>
      </div>
      <div className="ladder">
        {LADDER.map((f) => {
          const live = s.contests.filter((c) => c.fmt === f.k && c.state !== 'ended').length;
          return (
            <div className="lad" style={{ ['--f-c' as any]: FMT_COLOR[f.k] }} key={f.k}>
              <div className="lad-top">
                <span className="lad-k">{f.k}</span>
                <span className="lad-len">{f.len}</span>
              </div>
              <div className="lad-d">{f.d}</div>
              <div className="lad-ft">{live ? <><b>{live}</b> open now</> : 'None scheduled'}</div>
            </div>
          );
        })}
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}
