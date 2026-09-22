'use client';

import React, { useEffect, useState } from 'react';
import Icon from './Icon';
import { useStore } from '@/lib/store';
import { coachRecs } from '@/lib/coach';

export default function Fab() {
  const s = useStore();
  const [away, setAway] = useState(false);
  const n = coachRecs(s).length;

  // On a phone the coach button gets out of the way while scrolling down.
  useEffect(() => {
    let last = 0;
    let tid: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      if (window.innerWidth > 860) return;
      const y = Math.max(0, window.scrollY);
      const d = y - last;
      last = y;
      if (y < 80) setAway(false);
      else if (d > 6) setAway(true);
      else if (d < -6) setAway(false);
      clearTimeout(tid);
      tid = setTimeout(() => setAway(false), 900);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button className={`fab ${s.route === 'config' ? 'hide' : ''} ${away ? 'away' : ''}`} onClick={() => s.openSheet({ type: 'coach' })} aria-label="AI Coach">
      <Icon name="i-spark" c="ico ico-l" />
      <span className="fab-n">{n}</span>
    </button>
  );
}
