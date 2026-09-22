'use client';

import React, { useRef, useState } from 'react';
import Icon from '../../../Icon';
import { useStore } from '@/lib/store';
import { cfgSnapshot, applyImport } from '@/lib/config-io';
import { CfgHd } from '../shared';

export function CfgData() {
  const s = useStore();
  const snapshot = JSON.stringify(cfgSnapshot(s), null, 2);
  const outRef = useRef<HTMLTextAreaElement | null>(null);
  const [importText, setImportText] = useState('');

  const dlCfg = () => {
    const blob = new Blob([snapshot], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `carverse-ruleset-${s.cfg.season.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    s.pushToast('Ruleset exported', a.download);
  };
  const copyCfg = () => {
    navigator.clipboard
      ?.writeText(snapshot)
      .then(() => s.pushToast('Copied', 'The full ruleset is on your clipboard'))
      .catch(() => {
        outRef.current?.select();
        document.execCommand('copy');
        s.pushToast('Copied', 'The full ruleset is on your clipboard');
      });
  };
  const importCfg = () => {
    const raw = importText.trim();
    if (!raw) {
      s.pushToast('Nothing to load', 'Paste an exported ruleset first', 'warn');
      return;
    }
    let j: any;
    try {
      j = JSON.parse(raw);
    } catch {
      s.pushToast('Could not read that', 'It is not valid JSON', 'warn');
      return;
    }
    let ok = false;
    s.edit((st) => {
      ok = applyImport(st, j);
    });
    if (ok) {
      s.useKraFor(s.viewAs || s.data?.leaderboard.find((p) => p.uid === s.data?.current_uid)?.role || 'DSE');
      s.rebuildNotifs();
      s.pushToast('Ruleset loaded', 'Every screen is now running the imported configuration');
    } else {
      s.pushToast('Could not apply that', 'The document is missing fields the engine needs', 'warn');
    }
  };

  return (
    <>
      <div className="cfg-card">
        <CfgHd
          t="Export the ruleset"
          d="The whole season as one JSON document. Hand this to the backend team to seed the engine, keep it in version control, or carry a tuned configuration from one branch to another."
          action={
            <>
              <button className="btn btn-p" onClick={dlCfg}>
                <Icon name="i-download" c="ico ico-s" />
                Download JSON
              </button>
              <button className="btn" onClick={copyCfg}>
                <Icon name="i-copy" c="ico ico-s" />
                Copy
              </button>
            </>
          }
        />
        <div style={{ padding: '15px 17px' }}>
          <textarea className="cfg-json" ref={outRef} readOnly value={snapshot} />
        </div>
      </div>
      <div className="cfg-card">
        <CfgHd
          t="Import a ruleset"
          d="Paste a previously exported document to load it. The screens re-render immediately so you can check the effect before saving to the backend."
          action={
            <button className="btn" onClick={importCfg}>
              <Icon name="i-upload" c="ico ico-s" />
              Load
            </button>
          }
        />
        <div style={{ padding: '15px 17px' }}>
          <textarea className="cfg-json" placeholder="Paste the exported JSON here" value={importText} onChange={(e) => setImportText(e.target.value)} />
        </div>
      </div>
    </>
  );
}
