'use client';

import React, { useEffect, useState } from 'react';
import Icon from './Icon';
import { useStore } from '@/lib/store';
import { TITLES, TITLES_SM } from '@/lib/constants';

export default function Topbar() {
  const s = useStore();
  const [sm, setSm] = useState(false);
  useEffect(() => {
    const on = () => setSm(window.innerWidth <= 560);
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  const title = (sm && TITLES_SM[s.route]) || TITLES[s.route] || 'Home';
  const unread = s.notifs.filter((n) => n.unread).length;
  const tasksLeft = s.daily.some((t) => t.done < t.goal);

  return (
    <div className="topbar">
      <button className="ibtn menu-btn" onClick={() => s.setSideOpen(!s.sideOpen)} aria-label="Menu">
        <Icon name="i-menu" />
      </button>
      <div className="tb-title">{title}</div>
      <div className="tb-spacer" />
      <div className="tb-search">
        <Icon name="i-search" c="ico ico-m" />
        <input placeholder="Search players, contests…" readOnly onClick={() => s.openSheet({ type: 'palette' })} />
        <span className="tb-kbd">⌘K</span>
      </div>
      <button className="ibtn" onClick={s.toggleTheme} title="Switch theme">
        <Icon name={s.theme === 'dark' ? 'i-sun' : 'i-moon'} />
      </button>
      <button className="ibtn" onClick={() => s.openSheet({ type: 'scoring' })} title="How points are earned">
        <Icon name="i-info" />
      </button>
      <button className="ibtn" onClick={() => s.go('tasks')} title="Tasks">
        <Icon name="i-check-c" />
        <span className="dot" style={{ background: 'var(--gold)', display: tasksLeft ? 'block' : 'none' }} />
      </button>
      <button className="ibtn" onClick={() => s.setNotifOpen(!s.notifOpen)} title="Notifications">
        <Icon name="i-bell" />
        <span className="dot" style={{ display: unread ? 'block' : 'none' }} />
      </button>
    </div>
  );
}
