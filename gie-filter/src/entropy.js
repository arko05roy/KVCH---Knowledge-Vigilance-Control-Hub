// Shannon entropy in bits/byte (bits per character for string input).
// Used by Check 390 (DNS entropy invariant, §3.9 / Theorem 5) and
// Check 16 (negative token entropy floor).

export function shannonBitsPerByte(s) {
  if (!s || s.length === 0) return 0;
  const freq = new Map();
  for (const ch of s) freq.set(ch, (freq.get(ch) || 0) + 1);
  let h = 0;
  for (const c of freq.values()) {
    const p = c / s.length;
    h -= p * Math.log2(p);
  }
  return h;
}
