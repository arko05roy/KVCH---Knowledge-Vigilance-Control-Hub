#!/usr/bin/env node
// GIE-512 filtration service — the box between "system logs" and Redis.
//
//   cat mixed.log | node src/service.js > defects.ndjson
//
// stdin  : raw heterogeneous log lines (syslog/journald/docker/access/dns/
//          eBPF JSON/app JSON — adapters handle the mix)
// stdout : normalized defect frames, one JSON object per line (NDJSON)
// stderr : final stats
//
// In deployment this reads from the log sources / extension outputs and
// pushes frames to the Redis stream the Express backend consumes.

import readline from 'node:readline';
import { adapt } from './adapters.js';
import { GieEngine } from './engine.js';
import { Baseline } from './baseline.js';
import { buildFrame } from './frame.js';

const baseline = new Baseline();
const engine = new GieEngine({ baseline });

// Baseline templates can be pre-loaded from a file: --baseline templates.txt
const bIdx = process.argv.indexOf('--baseline');
if (bIdx >= 0) {
  const fs = await import('node:fs');
  for (const line of fs.readFileSync(process.argv[bIdx + 1], 'utf8').split('\n')) {
    if (line.trim()) baseline.learn(line.trim());
  }
}

const rl = readline.createInterface({ input: process.stdin });
let seen = 0, defects = 0, deadletters = 0;

rl.on('line', (line) => {
  const evt = adapt(line, `line:${seen}`);
  seen++;
  if (!evt) return;
  if (evt.channel === 'deadletter') { deadletters++; return; }
  const r = engine.evaluate(evt);
  if (r.isDefect) {
    defects++;
    process.stdout.write(JSON.stringify(buildFrame(evt, r.tensor, r.failed)) + '\n');
  }
});

rl.on('close', () => {
  process.stderr.write(`gie-filter: ${seen} lines in, ${deadletters} deadletters, ${defects} defect frames out\n`);
});
