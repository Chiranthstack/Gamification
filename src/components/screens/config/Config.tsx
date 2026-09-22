'use client';

import React from 'react';
import Icon from '../../Icon';
import { useStore } from '@/lib/store';
import { CFG_SECTIONS } from '@/lib/constants';
import { CfgSeason } from './sections/Season';
import { CfgRoles } from './sections/Roles';
import { CfgTiers } from './sections/Tiers';
import { CfgCodes } from './sections/Codes';
import { CfgKras } from './sections/Kras';
import { CfgDepts } from './sections/Depts';
import { CfgBoards } from './sections/Boards';
import { CfgContests } from './sections/Contests';
import { CfgQuests } from './sections/Quests';
import { CfgBadges } from './sections/Badges';
import { CfgData } from './sections/Data';

const SECTIONS: Record<string, React.FC> = {
  season: CfgSeason,
  roles: CfgRoles,
  tiers: CfgTiers,
  codes: CfgCodes,
  kras: CfgKras,
  depts: CfgDepts,
  boards: CfgBoards,
  contests: CfgContests,
  quests: CfgQuests,
  badgecfg: CfgBadges,
  data: CfgData,
};

export default function Config() {
  const sec = useStore((s) => s.cfgSec) || 'season';
  const Body = SECTIONS[sec] || CfgSeason;
  return (
    <div className="wide">
      <div className="page-hd">
        <div className="page-t">Configuration</div>
        <div className="page-d">Scoring, targets, tiers, boards, contests and quests. Changes apply on the next render.</div>
      </div>
      <div className="cfg-wrap">
        <div className="cfg-nav">
          {CFG_SECTIONS.map((x) => (
            <a key={x.k} className={x.k === sec ? 'on' : ''} onClick={() => useStore.setState({ cfgSec: x.k })}>
              <Icon name={x.i} c="ico ico-m" />
              <span>{x.t}</span>
            </a>
          ))}
        </div>
        <div id="cfgBody">
          <Body />
        </div>
      </div>
      <div style={{ height: 30 }} />
    </div>
  );
}
