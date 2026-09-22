'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { fmt } from '@/lib/format';
import { CfgHd, Sw } from '../shared';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const wide = { gridTemplateColumns: 'minmax(0,1fr) 190px' };

export function CfgSeason() {
  const s = useStore();
  const S1 = s.cfg.season;
  return (
    <>
      <div className="cfg-card">
        <CfgHd t="Season" d="What the current competition is called and when it runs. Boards, streaks and contests all reset with it." />
        <div className="cfg-row" style={wide}>
          <div>
            <div className="cfg-n">Season name</div>
            <div className="cfg-s">Shown on every leaderboard header</div>
          </div>
          <input className="cfg-in txt" value={S1.name} onChange={(e) => s.edit((st) => (st.cfg.season.name = e.target.value))} />
        </div>
        <div className="cfg-row" style={wide}>
          <div>
            <div className="cfg-n">Starts</div>
            <div className="cfg-s">First day events count toward this season</div>
          </div>
          <input className="cfg-in" type="date" value={S1.start} onChange={(e) => s.edit((st) => (st.cfg.season.start = e.target.value))} />
        </div>
        <div className="cfg-row" style={wide}>
          <div>
            <div className="cfg-n">Ends</div>
            <div className="cfg-s">Boards freeze and prizes settle after this date</div>
          </div>
          <input className="cfg-in" type="date" value={S1.end} onChange={(e) => s.edit((st) => (st.cfg.season.end = e.target.value))} />
        </div>
        <div className="cfg-row" style={wide}>
          <div>
            <div className="cfg-n">Points per level</div>
            <div className="cfg-s">Every {fmt(S1.levelStep)} points is one level on the XP ring</div>
          </div>
          <input
            className="cfg-in num"
            type="number"
            step={250}
            min={250}
            value={S1.levelStep}
            onChange={(e) => s.edit((st) => (st.cfg.season.levelStep = Math.max(250, +e.target.value || 2500)))}
          />
        </div>
        <div className="cfg-row" style={wide}>
          <div>
            <div className="cfg-n">Weekly reset day</div>
            <div className="cfg-s">When weekly quests and the week chart roll over</div>
          </div>
          <select className="cfg-in" value={S1.resetDay} onChange={(e) => s.edit((st) => (st.cfg.season.resetDay = e.target.value))}>
            {days.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="cfg-row" style={wide}>
          <div>
            <div className="cfg-n">Word for points</div>
            <div className="cfg-s">Carverse calls them pointers — change it to match your floor</div>
          </div>
          <input className="cfg-in txt" value={S1.pointsLabel} onChange={(e) => s.edit((st) => (st.cfg.season.pointsLabel = e.target.value))} />
        </div>
      </div>

      <div className="cfg-card">
        <CfgHd t="Game rules" d="Switches that change how the game behaves for everyone. The anti-gaming three are on by default — they are what stops the board being farmed." />
        {Object.entries(s.cfg.rules).map(([k, r]) => (
          <div className="cfg-row" style={{ gridTemplateColumns: 'minmax(0,1fr) 44px' }} key={k}>
            <div>
              <div className="cfg-n">{r.t}</div>
              <div className="cfg-s">{r.d}</div>
            </div>
            <Sw
              on={r.on}
              onToggle={() =>
                s.edit((st) => {
                  st.cfg.rules[k].on = !st.cfg.rules[k].on;
                })
              }
            />
          </div>
        ))}
        <div className="cfg-row" style={{ gridTemplateColumns: 'minmax(0,1fr) 120px' }}>
          <div>
            <div className="cfg-n">Clawback percentage</div>
            <div className="cfg-s">Share of points reversed when a booking is cancelled</div>
          </div>
          <input
            className="cfg-in num"
            type="number"
            min={0}
            max={100}
            step={5}
            value={s.cfg.clawbackPct}
            disabled={!s.cfg.rules.clawback.on}
            onChange={(e) => s.edit((st) => (st.cfg.clawbackPct = Math.max(0, Math.min(100, +e.target.value || 0))))}
          />
        </div>
      </div>
    </>
  );
}
