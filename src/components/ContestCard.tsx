'use client';

import React from 'react';
import Icon from './Icon';
import { FMT_COLOR, FMT_LEN } from '@/lib/constants';
import { useStore } from '@/lib/store';
import type { Contest } from '@/lib/types';

/** Ports ctCard / ctCardWide. `wide` swaps to auto width for grid layouts. */
export function ContestCard({ c, wide = false }: { c: Contest; wide?: boolean }) {
  const openSheet = useStore((s) => s.openSheet);
  const joinContest = useStore((s) => s.joinContest);
  const col = FMT_COLOR[c.fmt] || '#2DD46F';
  const urg = /\dh /.test(c.time) && !c.time.includes('d');
  return (
    <div
      className="ct"
      data-wide={wide ? '' : undefined}
      style={{ ['--c-c' as any]: col, ['--c-g' as any]: col + '22', ...(wide ? { width: 'auto' } : null) }}
      onClick={() => openSheet({ type: 'contest', id: c.id })}
    >
      <span className="ct-fmt" title={`${c.fmt} — runs for ${(FMT_LEN[c.fmt] || '').toLowerCase() || 'a set window'}`}>
        <i className={c.state === 'live' ? 'live' : ''} />
        {c.fmt} · {c.state === 'live' ? 'LIVE' : c.state === 'upc' ? 'SOON' : 'ENDED'}
      </span>
      <div className="ct-n">{c.name}</div>
      <div className="ct-d">{c.desc}</div>
      <div className="ct-pz">
        <Icon name="i-gift" c="ico ico-s" />
        <span>
          Prize <b>{c.prize}</b>
        </span>
      </div>
      <div className="ct-ft">
        <span className={`ct-tm ${urg ? 'urg' : ''}`}>
          <Icon name="i-clock" c="ico ico-s" />
          {c.time}
        </span>
        {c.state === 'ended' ? (
          <span style={{ fontSize: 11, color: 'var(--mut)' }}>{c.winner || ''}</span>
        ) : (
          <button
            className={`btn-join ${c.joined ? 'in' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              joinContest(c.id);
            }}
          >
            {c.joined ? '✓ Joined' : 'Join'}
          </button>
        )}
      </div>
    </div>
  );
}

export default ContestCard;
