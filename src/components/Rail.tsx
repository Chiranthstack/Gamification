'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './Icon';

/** A horizontal swipe rail with prev/next arrows and edge fades (ports wireRails). */
export function Rail({
  title,
  link,
  linkLabel,
  onLink,
  children,
}: {
  title: React.ReactNode;
  link?: string;
  linkLabel?: React.ReactNode;
  onLink?: () => void;
  children: React.ReactNode;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const maskRef = useRef<HTMLDivElement | null>(null);
  const [hasL, setHasL] = useState(false);
  const [hasR, setHasR] = useState(false);

  const update = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const padL = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const max = el.scrollWidth - el.clientWidth;
    setHasL(el.scrollLeft > padL + 4);
    setHasR(el.scrollLeft < max - 4 && max > padL + 8);
  }, []);

  useEffect(() => {
    update();
    const el = railRef.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  useEffect(() => {
    const m = maskRef.current;
    if (!m) return;
    m.classList.toggle('more-l', hasL);
    m.classList.toggle('more-r', hasR);
  }, [hasL, hasR]);

  const scroll = (dir: number) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.82), behavior: 'smooth' });
  };

  return (
    <>
      <div className="sec">
        <div className="sec-t">{title}</div>
        <div className="sec-ctrl">
          <button className="rail-nav" disabled={!hasL} onClick={() => scroll(-1)} aria-label="Scroll left">
            <Icon name="i-chev-l" c="ico ico-s" />
          </button>
          <button className="rail-nav" disabled={!hasR} onClick={() => scroll(1)} aria-label="Scroll right">
            <Icon name="i-chev-r" c="ico ico-s" />
          </button>
          {link && (
            <a className="sec-a" onClick={onLink} style={{ marginLeft: 4 }}>
              {linkLabel} <Icon name="i-chev-r" c="ico ico-s" />
            </a>
          )}
        </div>
      </div>
      <div className="railmask" ref={maskRef}>
        <div className="rail" ref={railRef}>
          {children}
        </div>
      </div>
    </>
  );
}

export default Rail;
