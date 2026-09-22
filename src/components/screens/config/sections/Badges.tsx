'use client';

import React from 'react';
import Icon from '../../../Icon';
import { useStore } from '@/lib/store';
import { BADGES } from '@/lib/constants';
import { CfgHd, Sw } from '../shared';

const cols = '38px minmax(0,1fr) minmax(0,1fr) 44px';

export function CfgBadges() {
  const s = useStore();
  const inPlay = BADGES.filter((b) => s.cfg.badges[b.id]).length;

  return (
    <div className="cfg-card tbl">
      <CfgHd t="Achievements" d="Badges are awarded automatically from scoring data — nobody claims one by hand. Switch one off to hide it from the collection entirely." />
      <div className="cfg-head" style={{ gridTemplateColumns: cols }}>
        <span />
        <span>Badge</span>
        <span>Earned by</span>
        <span style={{ textAlign: 'center' }}>On</span>
      </div>
      {BADGES.map((b) => {
        const on = !!s.cfg.badges[b.id];
        return (
          <div className="cfg-row" style={{ gridTemplateColumns: cols, opacity: on ? 1 : 0.5 }} key={b.id}>
            <span style={{ width: 30, height: 30, borderRadius: 7, display: 'grid', placeItems: 'center', background: 'var(--surf-2)', color: on ? 'var(--green)' : 'var(--dim)' }}>
              <Icon name={b.icon} c="ico ico-m" />
            </span>
            <input className="cfg-in txt" defaultValue={b.name} readOnly />
            <input className="cfg-in txt" defaultValue={b.hint} readOnly />
            <Sw on={on} onToggle={() => s.edit((st) => (st.cfg.badges[b.id] = !on))} />
          </div>
        );
      })}
      <div className="cfg-foot">
        <span style={{ color: 'var(--mut)' }}>
          {inPlay} of {BADGES.length} in play
        </span>
      </div>
    </div>
  );
}
