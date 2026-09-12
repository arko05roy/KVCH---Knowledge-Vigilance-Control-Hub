// Sinks: where the filter's two output classes go.
//   defects       -> SimStream (stands in for Redis stream -> Express backend)
//   sampled pass  -> ColdStore (stands in for S3/disk forensic storage)
// The backend only ever sees DefectStream traffic — bounded volume.

import fs from 'node:fs';
import path from 'node:path';

export class DefectStream {
  constructor() { this.pushed = 0; this.consumed = 0; this.frames = []; }
  push(frame) { this.frames.push(frame); this.pushed++; }
  // Simulated backend drain: Express consumes the stream.
  drain() { this.consumed += this.frames.length; this.frames.length = 0; }
}

export class NdjsonWriter {
  constructor(filePath) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    this.fd = fs.openSync(filePath, 'w');
    this.n = 0;
  }
  write(obj) { fs.writeSync(this.fd, JSON.stringify(obj) + '\n'); this.n++; }
  close() { fs.closeSync(this.fd); }
}

export class ColdStore {
  constructor(writer, sampleRate = 0.01) {
    this.w = writer || null; this.rate = sampleRate; this.stored = 0; this.dropped = 0;
  }
  offer(evt, rand01) {
    if (rand01 < this.rate) { this.stored++; this.w?.write({ sampled_pass: true, raw: evt.raw, ref: evt.ref }); }
    else this.dropped++;
  }
}
