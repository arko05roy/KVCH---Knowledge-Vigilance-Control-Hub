// Deterministic seeded PRNG so dry runs are reproducible.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
export const randint = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));

const LABEL_ALPHA = 'abcdefghijklmnopqrstuvwxyz0123456789';
export function randLabel(r, len) {
  let s = '';
  for (let i = 0; i < len; i++) s += LABEL_ALPHA[Math.floor(r() * LABEL_ALPHA.length)];
  return s;
}

// base64 alphabet — entropy ~6.0 bits/char, well clear of the check-16
// 5.1 boundary so mock exfil blobs aren't threshold-jitter coin flips.
const B64_ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
export function randBlob(r, len) {
  let s = '';
  for (let i = 0; i < len; i++) s += B64_ALPHA[Math.floor(r() * B64_ALPHA.length)];
  return s;
}
