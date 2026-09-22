'use client';

import React from 'react';
import Icon from './Icon';
import { useStore } from '@/lib/store';
import { NAV, MINE_ROUTE, SCOPES } from '@/lib/constants';
import { myRole, navAllowed } from '@/lib/roles';

const GROUPS: { g: number; lbl: string }[] = [
  { g: 1, lbl: 'Play' },
  { g: 2, lbl: 'Performance' },
  { g: 3, lbl: 'Compete' },
];

export default function Sidebar() {
  const s = useStore();
  const role = myRole(s);
  const activeR = MINE_ROUTE[s.route] ? 'work' : s.route;
  const count = (cnt?: 'tasks' | 'contests') =>
    cnt === 'tasks' ? s.daily.filter((t) => t.done < t.goal).length : cnt === 'contests' ? s.contests.filter((c) => c.state !== 'ended').length : 0;

  const link = (n: (typeof NAV)[number]) => {
    const on = n.r === activeR || Boolean(MINE_ROUTE[n.r] && MINE_ROUTE[s.route]);
    const c = n.cnt ? count(n.cnt) : 0;
    return (
      <a key={n.r} className={on ? 'on' : ''} title={n.t} onClick={() => s.go(n.r)}>
        <Icon name={n.i} c="ico ico-m" />
        <span>{n.t}</span>
        {c > 0 && <span className="cnt">{c}</span>}
      </a>
    );
  };

  const adminVisible = NAV.some((n) => n.g === 4 && navAllowed(n, s, role));

  return (
    <aside className={`side ${s.sideOpen ? 'open' : ''}`} id="side">
      <div className="brand">
        <div className="brand-mark" onClick={() => s.go('home')}>
          C
        </div>
        <div className="brand-txt" onClick={() => s.go('home')}>
          <div className="brand-t">CARVERSE</div>
          <div className="brand-s">PERFORMANCE</div>
        </div>
        <button className="side-tog" onClick={s.toggleSideWidth} title="Collapse sidebar" aria-label="Collapse sidebar">
          <Icon name="i-chev-l" c="ico ico-m" />
        </button>
      </div>

      {GROUPS.map((grp) => (
        <div className="nav-grp" key={grp.g}>
          <div className="nav-lbl">{grp.lbl}</div>
          <nav className="nav">{NAV.filter((n) => n.g === grp.g && navAllowed(n, s, role)).map(link)}</nav>
        </div>
      ))}

      <div className="nav-grp" style={{ display: adminVisible ? 'block' : 'none' }}>
        <div className="nav-lbl">Admin</div>
        <nav className="nav">{NAV.filter((n) => n.g === 4 && navAllowed(n, s, role)).map(link)}</nav>
      </div>

      <div className="side-foot">
        <div className="role-sw" onClick={() => s.openSheet({ type: 'roles' })} title="Change the role you are viewing as">
          <div className="role-sw-ic">
            <Icon name={role.scope === 'self' ? 'i-users' : role.scope === 'org' ? 'i-globe' : 'i-settings'} c="ico ico-m" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="role-sw-t">{role.label}</div>
            <div className="role-sw-s">{s.viewAs ? 'Previewing · tap to change' : SCOPES[role.scope]}</div>
          </div>
          <svg className="ico ico-s" style={{ marginLeft: 'auto', color: 'var(--dim)', flexShrink: 0 }}>
            <use href="#i-swap" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
