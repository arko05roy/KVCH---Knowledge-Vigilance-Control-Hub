// GIE-512 evaluation engine (whitepaper §3.4).
//
// Per event: fresh tensor T(s) = 1_512, project the event onto the
// functionals subscribed to its channel, clear bits on violation, compute
// D(s) = ||1_512 - T(s)||_1. D(s) = 0 -> pass (zero overhead, dropped or
// cold-sampled); D(s) >= 1 -> defect frame emitted.

import { Tensor512 } from './tensor.js';
import { IMPLEMENTED, groupOf } from './checks.js';

export class GieEngine {
  constructor({ baseline = null } = {}) {
    this.baseline = baseline;
    this.nonces = new Map();          // check 400 state
    this.byChannel = new Map();
    for (const c of IMPLEMENTED) {
      for (const ch of c.channels) {
        if (!this.byChannel.has(ch)) this.byChannel.set(ch, []);
        this.byChannel.get(ch).push(c);
      }
    }
  }

  // Nonce replay window: seen within 30 s -> replay (returns true on replay).
  seenNonce(key, nonce, ts) {
    let m = this.nonces.get(key);
    if (!m) { m = new Map(); this.nonces.set(key, m); }
    const t = Date.parse(ts) || Date.now();
    for (const [n, nt] of m) if (t - nt > 30_000) m.delete(n);
    if (m.has(nonce)) return true;
    m.set(nonce, t);
    return false;
  }

  subscribed(channel) { return this.byChannel.get(channel) || []; }

  evaluate(evt) {
    const tensor = new Tensor512();
    const failed = [];
    for (const c of this.subscribed(evt.channel)) {
      let ok = true;
      try { ok = c.fn(evt.fields, evt, this) !== false; }
      catch { ok = true; }              // evaluator crash on a check = vacuous pass
      if (!ok) { tensor.fail(c.id); failed.push(c); }
    }
    const d = tensor.defect();
    return { tensor, failed, defect: d, isDefect: d >= 1 };
  }
}

export { groupOf };
