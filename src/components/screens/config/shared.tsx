'use client';

import React from 'react';
import Icon from '../../Icon';

export function CfgHd({ t, d, action }: { t: React.ReactNode; d: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="cfg-hd">
      <div style={{ minWidth: 0 }}>
        <div className="cfg-hd-t">{t}</div>
        <div className="cfg-hd-d">{d}</div>
      </div>
      {action && <div className="cfg-hd-a">{action}</div>}
    </div>
  );
}

export function Sw({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return <span className={`sw ${on ? 'on' : ''}`} role="switch" aria-checked={on} onClick={onToggle} />;
}

export function DelBtn({ onClick }: { onClick: () => void }) {
  return (
    <span className="cfg-del" onClick={onClick} title="Remove">
      <Icon name="i-x" c="ico ico-s" />
    </span>
  );
}
