'use client';

import React from 'react';
import Icon from '../Icon';
import { useStore } from '@/lib/store';
import { me } from '@/lib/selectors';
import { boards } from '@/lib/boards';
import { fmt } from '@/lib/format';

export default function Leaderboards() {
  const s = useStore();
  const m = me(s);
  const B = boards(s);

  if (!B.length) {
    return (
      <div className="wide">
        <div className="page-hd">
          <div className="page-t">Leaderboards</div>
        </div>
        <div className="card">
          <div className="empty">
            <Icon name="i-list" c="ico ico-xl" />
            <h4>No boards are running</h4>
            <p>Every leaderboard is switched off in Configuration. Turn one back on to start comparing again.</p>
          </div>
        </div>
      </div>
    );
  }

  const curBoard = B.find((b) => b.key === s.board) || B[0];
  const full = curBoard.list;
  const myPos = full.findIndex((p) => p.uid === m.uid);
  const list = full.slice(0, curBoard.top);
  const outside = myPos >= curBoard.top;

  return (
    <div className="wide">
      <div className="page-hd">
        <div className="page-t">Leaderboards</div>
        <div className="page-d">Your division is people doing your job at your branch — never a DSE against a manager.</div>
      </div>
      <div className="chips">
        {B.map((b) => (
          <span key={b.key} className={`chip ${b.key === s.board ? 'on' : ''}`} onClick={() => useStore.setState({ board: b.key })}>
            <Icon name={b.i} c="ico ico-s" />
            {b.t}
          </span>
        ))}
      </div>
      <div className="card">
        <div className="card-hd">
          <div className="card-t">{curBoard.t}</div>
          <span className="card-s">
            {curBoard.s} · {full.length} players
          </span>
        </div>
        <div className="thead" style={{ gridTemplateColumns: '30px 1fr 68px 68px 88px' }}>
          <span />
          <span>Player</span>
          <span style={{ textAlign: 'right' }}>Deals</span>
          <span style={{ textAlign: 'right' }}>Avg</span>
          <span style={{ textAlign: 'right' }}>Points</span>
        </div>
        <div>
          {list.length ? (
            list.map((p, i) => {
              const isMe = p.uid === m.uid;
              const medal = i < 3 ? `medal m${i + 1}` : '';
              const sr = p.deals ? Math.round((p.points || 0) / p.deals) : 0;
              return (
                <div
                  className={`lb-r ${isMe ? 'me' : ''}`}
                  style={{ gridTemplateColumns: '30px 1fr 68px 68px 88px', padding: '9px 16px' }}
                  key={p.uid}
                  onClick={() => s.openSheet({ type: 'player', uid: p.uid, rank: i + 1 })}
                >
                  <div className={`lb-rk ${medal}`}>{i + 1}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="lb-nm">{isMe ? 'You' : p.name}</div>
                    <div className="lb-sub">
                      {p.role || ''}
                      {p.branch ? ' · ' + p.branch : ''}
                    </div>
                  </div>
                  <div className="tnum">{fmt(p.deals || 0)}</div>
                  <div className="tnum">{sr || '—'}</div>
                  <div className="lb-pt" style={{ textAlign: 'right' }}>{fmt(p.points)}</div>
                </div>
              );
            })
          ) : (
            <div className="empty">
              <Icon name="i-search" c="ico ico-xl" />
              <h4>No players here</h4>
              <p>Nothing matches this board yet.</p>
            </div>
          )}
        </div>
        {outside && myPos >= 0 && (
          <>
            <div style={{ padding: '7px 16px', textAlign: 'center', color: 'var(--dim)', fontSize: 11, letterSpacing: '.3em', borderTop: '1px solid var(--line)' }}>···</div>
            <div className="lb-r me" style={{ gridTemplateColumns: '30px 1fr 74px 74px 84px', padding: '11px 16px' }}>
              <div className="lb-rk">{myPos + 1}</div>
              <div style={{ minWidth: 0 }}>
                <div className="lb-nm">You</div>
                <div className="lb-sub">
                  {m.role || ''}
                  {m.branch ? ' · ' + m.branch : ''}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--mut)' }} className="num">
                {fmt(m.deals || 0)}
                <div style={{ fontSize: 9.5, color: 'var(--dim)' }}>deals</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--mut)' }} className="num">
                {m.deals ? Math.round((m.points || 0) / m.deals) : '—'}
                <div style={{ fontSize: 9.5, color: 'var(--dim)' }}>avg</div>
              </div>
              <div className="lb-pt" style={{ textAlign: 'right' }}>{fmt(m.points)}</div>
            </div>
          </>
        )}
        {myPos >= 0 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', fontSize: 12, color: 'var(--mut)' }}>
            You are <b style={{ color: 'var(--green)' }}>#{myPos + 1}</b> of {full.length}
            {myPos > 0 ? (
              <>
                {' '}
                — <b style={{ color: 'var(--gold)' }}>{fmt((full[myPos - 1].points || 0) - (m.points || 0))}</b> behind {full[myPos - 1].name}
              </>
            ) : (
              ' — top of the board'
            )}
          </div>
        )}
      </div>
      <div style={{ height: 20 }} />
    </div>
  );
}
