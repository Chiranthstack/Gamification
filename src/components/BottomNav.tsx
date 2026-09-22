'use client';

import React from 'react';
import Icon from './Icon';
import { useStore } from '@/lib/store';

export default function BottomNav() {
  const s = useStore();
  const bn = [
    { r: 'home', t: 'Home', i: 'i-home' },
    { r: 'leaderboards', t: 'Boards', i: 'i-list' },
    { r: 'contests', t: 'Contests', i: 'i-trophy' },
    { r: 'work', t: 'My Work', i: 'i-target' },
    s.cfg.rules.showEarnings.on ? { r: 'earnings', t: 'Earnings', i: 'i-rupee' } : { r: 'badges', t: 'Badges', i: 'i-badge' },
  ];
  return (
    <nav className="bnav" id="bnav">
      {bn.map((n) => (
        <a key={n.r} className={s.route === n.r ? 'on' : ''} onClick={() => s.go(n.r)}>
          <Icon name={n.i} c="ico ico-m" />
          <span>{n.t}</span>
        </a>
      ))}
    </nav>
  );
}
