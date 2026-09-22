'use client';

import React from 'react';
import Icon from './Icon';
import { useStore } from '@/lib/store';
import { cfgSnapshot } from '@/lib/config-io';
import { API } from '@/lib/api';

export default function SaveBar() {
  const s = useStore();
  const up = s.cfgDirty > 0 && s.route === 'config';

  const discard = () => {
    if (typeof window !== 'undefined' && window.confirm('Discard every unsaved change and reload the saved configuration?')) location.reload();
  };
  const save = () => {
    const payload = cfgSnapshot(s);
    if (s.offline) {
      s.markSaved();
      s.pushToast('Saved locally', 'Preview mode — connect the backend to persist this ruleset', 'warn');
      return;
    }
    fetch(API + '/v1/engine/parameters', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parameters: s.codes.filter((c) => s.codeOn[c[0]] !== false).map(([c, , , p]) => ({ key: 'action:' + c, enabled: true, weight: p })),
        ruleset: payload,
      }),
    })
      .then((r) => {
        if (!r.ok) throw 0;
        s.markSaved();
        s.pushToast('Configuration saved', 'Leaderboards rebuild from the next event');
      })
      .catch(() => s.pushToast('Could not save', 'The backend did not accept the change', 'warn'));
  };

  return (
    <div className={`savebar ${up ? 'up' : ''}`} id="saveBar">
      <span className="savebar-t">
        <b>{s.cfgDirty === 1 ? '1 change' : s.cfgDirty + ' changes'}</b>
        <span> not yet saved to the engine.</span>
      </span>
      <button className="btn" onClick={discard}>
        Discard
      </button>
      <button className="btn btn-p" onClick={save}>
        <Icon name="i-check" c="ico ico-s" />
        Save ruleset
      </button>
    </div>
  );
}
