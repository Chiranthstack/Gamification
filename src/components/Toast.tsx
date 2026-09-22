'use client';

import React, { useEffect, useState } from 'react';
import Icon from './Icon';
import { useStore } from '@/lib/store';

const MAP: Record<string, [string, string, string]> = {
  ok: ['--green-g', '--green', 'i-check'],
  warn: ['--gold-g', '--gold', 'i-alert'],
  info: ['--violet-g', '--violet', 'i-info'],
};

export default function Toast() {
  const toast = useStore((s) => s.toast);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!toast) return;
    setOn(true);
    const id = setTimeout(() => setOn(false), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const [bg, fg, icn] = MAP[toast?.kind || 'ok'] || MAP.ok;
  return (
    <div className={`toast ${on ? 'on' : ''}`} id="toast">
      <div className="toast-ic" style={{ background: `var(${bg})`, color: `var(${fg})` }}>
        <Icon name={icn} c="ico ico-m" />
      </div>
      <div>
        <div className="toast-t">{toast?.title}</div>
        <div className="toast-d">{toast?.desc}</div>
      </div>
    </div>
  );
}
