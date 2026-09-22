'use client';

import React from 'react';
import Icon from './Icon';
import { useStore } from '@/lib/store';

export default function NotifRail() {
  const s = useStore();
  const unread = s.notifs.filter((n) => n.unread).length;
  return (
    <aside className={`notif ${s.notifOpen ? 'open' : ''}`} id="notifRail">
      <div className="notif-hd">
        <svg className="ico ico-m" style={{ color: 'var(--mut)' }}>
          <use href="#i-bell" />
        </svg>
        <div className="notif-t">Alerts</div>
        <span className="notif-n">{unread}</span>
        <button className="notif-clr" onClick={s.clearNotifs}>
          Mark read
        </button>
        <button className="ibtn notif-x" onClick={() => s.setNotifOpen(false)} style={{ marginLeft: 4 }}>
          <Icon name="i-x" c="ico ico-m" />
        </button>
      </div>
      <div className="notif-bd">
        {s.notifs.length ? (
          s.notifs.map((n, i) => (
            <div className={`nf ${n.unread ? 'unread' : ''}`} style={{ ['--n-c' as any]: n.c, ['--n-g' as any]: n.g, position: 'relative' }} key={i} onClick={() => s.readNotif(i)}>
              <div className="nf-ic">
                <Icon name={n.i} c="ico ico-m" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="nf-t">{n.t}</div>
                <div className="nf-d">{n.d}</div>
                <div className="nf-tm">{n.tm}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty" style={{ padding: '36px 20px' }}>
            <Icon name="i-bell" c="ico ico-xl" />
            <h4>All clear</h4>
            <p>Nothing needs you right now.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
