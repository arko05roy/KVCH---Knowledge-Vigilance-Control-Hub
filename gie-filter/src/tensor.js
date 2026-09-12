// GIE-512 invariant tensor — pure-software reference implementation.
// Whitepaper §3.3: T(s) = concat(v1..v4) ∈ {0,1}^512 — 8 × u64 words.
// Bit i (0-indexed, check id i+1) = 1 → functional passed, 0 → defect.
// §3.4: D(s) = ||1_512 − T(s)||_1 = popcount(~T). This is exactly what the
// AVX-512 kernel computes in 4 cycles (XOR against baseline + mask test);
// here it is a scalar 8-word popcount (~tens of ns).

const ONES = 0xFFFFFFFFFFFFFFFFn;

export class Tensor512 {
  constructor() {
    this.w = new BigUint64Array(8).fill(ONES);
  }

  // Mark check `id` (1-based, 1..512) as violated → clear its bit.
  fail(id) {
    const i = id - 1;
    this.w[i >> 6] &= ~(1n << BigInt(i & 63));
  }

  // D(s) = ||1_512 − T(s)||_1 : count of cleared bits.
  defect() {
    let d = 0;
    for (let i = 0; i < 8; i++) {
      let x = ~this.w[i] & ONES;
      while (x) { x &= x - 1n; d++; }
    }
    return d;
  }

  failedIds() {
    const out = [];
    for (let w = 0; w < 8; w++) {
      const x = ~this.w[w] & ONES;
      for (let b = 0; b < 64; b++) {
        if (x & (1n << BigInt(b))) out.push(w * 64 + b + 1);
      }
    }
    return out;
  }

  // Per-subspace 128-bit mask (group g ∈ 1..4 → words 2g-2, 2g-1).
  groupMaskHex(g) {
    const a = (g - 1) * 2;
    return '0x' + this.w[a].toString(16).padStart(16, '0') +
                 this.w[a + 1].toString(16).padStart(16, '0');
  }
}
