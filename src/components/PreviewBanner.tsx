'use client';

import React from 'react';
import Icon from './Icon';
import { useStore } from '@/lib/store';
import { attemptBackend } from '@/lib/api';

export default function PreviewBanner() {
  const offline = useStore((s) => s.offline);
  if (!offline) return null;
  return (
    <div id="pvBanner" className="pvbar">
      <Icon name="i-info" c="ico ico-s" />
      <b>Preview mode</b>
      <span className="pvbar-t">— sample data. Reconnecting to your backend.</span>
      <button onClick={() => attemptBackend(useStore.setState as any, useStore.getState)} className="pvbar-b">
        Retry
      </button>
    </div>
  );
}
