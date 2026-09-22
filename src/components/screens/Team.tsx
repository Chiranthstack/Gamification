'use client';

import React from 'react';
import Icon from '../Icon';
import { useStore } from '@/lib/store';
import { me, byPts } from '@/lib/selectors';
import { scopeList, myRole } from '@/lib/roles';
import { teamHealth } from '@/lib/team';
import { curStreak } from '@/lib/series';
import { SCOPES } from '@/lib/constants';
import { fmt, ini } from '@/lib/format';

export default function Team() {
  const s = useStore();
  const m = me(s);
  const r = myRole(s);
  const list = byPts(scopeList(s).filter((p) => p.uid !== m.uid));
  const health = list.map((p) => ({ p, h: teamHealth(p, s.data?.leaderboard || []) }));
  const risk = health.filter((x) => x.h.flag === 'risk');
  const watch = health.filter((x) => x.h.flag === 'watch');
  const total = list.reduce((a, p) => a + (p.points || 0), 0);
  const deals = list.reduce((a, p) => a + (p.deals || 0), 0);
  const quiet = list.filter((p) => !curStreak(p)).length;

  return (
    <div className="wide">
      <div className="page-hd">
        <div className="page-t">My Team</div>
        <div className="page-d">
          {SCOPES[r.scope]} · {list.length} people. Each person is measured against the company median for their own role.
        </div>
      </div>

      {!list.length ? (
        <div className="card">
          <div className="empty">
            <Icon name="i-users" c="ico ico-xl" />
            <h4>No one reports to you yet</h4>
            <p>Once people are assigned to you in the HR feed they will appear here.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="tstrip">
            <div className="tcell">
              <div className="tcell-l">Team points</div>
              <div className="tcell-v">{fmt(total)}</div>
              <div className="tcell-s">{fmt(deals)} deals this season</div>
            </div>
            <div className="tcell">
              <div className="tcell-l">Needs attention</div>
              <div className="tcell-v" style={{ color: risk.length ? 'var(--red)' : 'var(--ink)' }}>{risk.length}</div>
              <div className="tcell-s">well below their role median</div>
            </div>
            <div className="tcell">
              <div className="tcell-l">Slipping</div>
              <div className="tcell-v" style={{ color: watch.length ? 'var(--gold)' : 'var(--ink)' }}>{watch.length}</div>
              <div className="tcell-s">drifting below median</div>
            </div>
            <div className="tcell">
              <div className="tcell-l">No activity</div>
              <div className="tcell-v">{quiet}</div>
              <div className="tcell-s">nothing logged recently</div>
            </div>
          </div>

          {risk.length > 0 && (
            <div className="card" style={{ marginBottom: 16, padding: '15px 17px', borderLeft: '3px solid var(--red)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--red)', flexShrink: 0, marginTop: 1 }}>
                  <Icon name="i-alert" c="ico ico-m" />
                </span>
                <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                  <b style={{ color: 'var(--ink)' }}>Start with {risk[0].p.name}.</b>{' '}
                  {risk.length > 1 ? `They and ${risk.length - 1} other${risk.length > 2 ? 's' : ''} are` : 'They are'} far enough below the company median for their role that it is worth a conversation this week.
                </div>
              </div>
            </div>
          )}

          <div className="sec">
            <div className="sec-t">The team</div>
            <span className="sec-n">Sorted by points</span>
          </div>
          <div className="tm-grid">
            {health.map(({ p, h }) => {
              const col = h.flag === 'risk' ? 'var(--red)' : h.flag === 'watch' ? 'var(--gold)' : 'var(--green)';
              return (
                <div className="tm" key={p.uid}>
                  <div className="tm-top">
                    <div className="tm-av">{ini(p.name)}</div>
                    <div style={{ minWidth: 0 }}>
                      <div className="tm-n">{p.name}</div>
                      <div className="tm-r">
                        {p.role || ''} · {p.branch || ''}
                      </div>
                    </div>
                    <span className={`tm-flag ${h.flag}`}>{h.flag === 'ok' ? 'On pace' : h.flag === 'watch' ? 'Watch' : 'At risk'}</span>
                  </div>
                  <div className="tm-row">
                    <span>Points</span>
                    <b>{fmt(p.points)}</b>
                  </div>
                  <div className="tm-row">
                    <span>Deals</span>
                    <b>{fmt(p.deals || 0)}</b>
                  </div>
                  <div className="tm-row">
                    <span>Streak</span>
                    <b>
                      {curStreak(p)}
                      <span style={{ fontSize: 11, color: 'var(--mut)', fontFamily: 'var(--sans)', fontWeight: 400 }}> days</span>
                    </b>
                  </div>
                  <div className="tm-row">
                    <span>KRA average</span>
                    <b>
                      {h.score}
                      <span style={{ fontSize: 11, color: 'var(--mut)', fontFamily: 'var(--sans)', fontWeight: 400 }}> vs {h.median} company median</span>
                    </b>
                  </div>
                  <div className="tm-bar">
                    <i style={{ width: Math.round(Math.max(6, Math.min(100, (h.pace / 1.5) * 100))) + '%', background: col }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--mut)', marginTop: 7 }}>{h.why}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
      <div style={{ height: 24 }} />
    </div>
  );
}
