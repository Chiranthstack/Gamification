'use client';

import React, { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { NAV, MINE_ROUTE } from '@/lib/constants';
import { navAllowed } from '@/lib/roles';
import { teardown } from '@/lib/api';

import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import NotifRail from '@/components/NotifRail';
import BottomNav from '@/components/BottomNav';
import Fab from '@/components/Fab';
import SaveBar from '@/components/SaveBar';
import Toast from '@/components/Toast';
import Sheets from '@/components/Sheets';
import PreviewBanner from '@/components/PreviewBanner';

import Home from '@/components/screens/Home';
import MyWork from '@/components/screens/MyWork';
import Badges from '@/components/screens/Badges';
import Tasks from '@/components/screens/Tasks';
import Weekly from '@/components/screens/Weekly';
import Earnings from '@/components/screens/Earnings';
import Leaderboards from '@/components/screens/Leaderboards';
import Contests from '@/components/screens/Contests';
import Branches from '@/components/screens/Branches';
import Team from '@/components/screens/Team';
import Config from '@/components/screens/config/Config';

const PAGES: Record<string, React.FC> = {
  home: Home, work: MyWork, activity: MyWork, follow: MyWork, kras: MyWork,
  badges: Badges, team: Team, tasks: Tasks, weekly: Weekly, earnings: Earnings,
  leaderboards: Leaderboards, contests: Contests, branches: Branches, config: Config,
};

export default function Page() {
  const s = useStore();

  // Boot once, and keep the hash router + keyboard shortcuts alive.
  useEffect(() => {
    useStore.getState().boot();
    const onHash = () => {
      const r = location.hash.replace('#/', '') || 'home';
      if (r !== useStore.getState().route) useStore.setState({ route: r });
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        useStore.getState().openSheet({ type: 'palette' });
        return;
      }
      if (e.key === 'Escape' && useStore.getState().sheet.type !== 'none') {
        e.preventDefault();
        useStore.getState().closeSheet();
      }
    };
    window.addEventListener('hashchange', onHash);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('keydown', onKey);
      teardown();
    };
  }, []);

  // Resolve the effective route: bounce off disallowed screens, sync My Work tab.
  let route = s.route;
  const want = NAV.find((n) => n.r === route);
  if (want && !navAllowed(want, s)) route = 'home';
  useEffect(() => {
    if (MINE_ROUTE[s.route] && s.mineTab !== MINE_ROUTE[s.route]) useStore.setState({ mineTab: MINE_ROUTE[s.route] });
  }, [s.route]);

  const Screen = PAGES[route] || Home;

  return (
    <>
      <div className={`app ${s.sideNarrow ? 'narrow' : ''}`} id="app">
        <Sidebar />
        <div className="main">
          <PreviewBanner />
          <Topbar />
          <div id="view">
            <Screen />
          </div>
        </div>
        <NotifRail />
      </div>

      <BottomNav />
      <div className={`scrim ${s.sideOpen || s.notifOpen ? 'on' : ''}`} onClick={s.closeAll} />
      <SaveBar />
      <Fab />
      <Sheets />
      <Toast />
    </>
  );
}
