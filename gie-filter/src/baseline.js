// Pre-compiled AST/grammar baselines (whitepaper §4.1 Checks 1–2,
// rollout Phase 1: CI/CD static baselining).
//
// A query "shape" is the template with all literals projected to
// placeholders — the software stand-in for a normalized AST whose leaf
// values are erased. Two queries with the same shape are AST-isomorphic
// for our purposes; an injected clause changes the shape hash.

export function shapeOf(query) {
  return String(query)
    .replace(/'[^']*'/g, '?')            // string literals → placeholder
    .replace(/"[^"]*"/g, '?')
    .replace(/\b\d+(\.\d+)?\b/g, '#')    // numeric literals → placeholder
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

// FNV-1a 32-bit — deterministic shape fingerprint (no crypto dep needed for demo).
export function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export class Baseline {
  constructor() { this.shapes = new Set(); }
  learn(query) { this.shapes.add(fnv1a(shapeOf(query))); }
  has(query) { return this.shapes.has(fnv1a(shapeOf(query))); }
  size() { return this.shapes.size; }
}
