// ── Formatting & tiny helpers (ported from the original app) ──

/** Indian-grouped number formatting, e.g. 73990 → "73,990". */
export const fmt = (n?: number): string => (n || 0).toLocaleString('en-IN');

/** Up-to-two-letter initials from a name. */
export const ini = (n?: string): string =>
  (n || '')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/** classnames joiner. */
export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ');

/** Deterministic pseudo-random generator from a string seed (FNV-1a + xorshift). */
export function seeded(seed: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
