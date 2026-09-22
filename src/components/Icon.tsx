import React from 'react';

/** Mirrors the original `ic(name, class)` helper — references the injected sprite. */
export function Icon({ name, c = 'ico' }: { name: string; c?: string }) {
  return (
    <svg className={c} aria-hidden>
      <use href={`#${name}`} />
    </svg>
  );
}

export default Icon;
