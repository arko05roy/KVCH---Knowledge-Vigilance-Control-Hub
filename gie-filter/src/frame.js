// Normalized defect frame — the fixed output schema of the filtration
// layer. Every source format produces the identical shape, which is what
// lets the backend (Express -> Qdrant/Postgres/Neo4j) have a fixed schema.
//
// verdict:
//   BLOCK_AND_TERMINATE — source was an enforcement-capable channel
//                         (eBPF LSM/XDP); the action was killed inline.
//   DETECTED_POST_HOC   — source was log evidence; detection is after the fact.

import { groupOf } from './checks.js';

const SEV_ORDER = { info: 0, low: 1, medium: 2, high: 3, critical: 4 };
const INLINE_CHANNELS = new Set([
  'execve', 'file_write', 'socket', 'connect', 'ptrace', 'module', 'setuid',
  'setgid', 'cap', 'mem', 'mem_write', 'wmi', 'icmp', 'ws', 'syscall',
  'taint', 'canary', 'tpm', 'fd', 'flow',
]);

function worstSeverity(failures) {
  let w = 'info';
  for (const f of failures) if (SEV_ORDER[f.severity] > SEV_ORDER[w]) w = f.severity;
  return w;
}

// Keep evidence small and structured — full raw line lives in cold storage.
function pickEvidence(evt) {
  const f = evt.fields || {};
  const keys = ['comm', 'ppid', 'file', 'args', 'path', 'name', 'query', 'args',
    'qname', 'qtype', 'daddr', 'dport', 'proto', 'host', 'method', 'cap',
    'target', 'op', 'class', 'type', 'ip', 'status'];
  const ev = {};
  for (const k of keys) if (f[k] !== undefined) ev[k] = f[k];
  if (f.params) ev.params = f.params;
  if (f.headers) ev.headers = f.headers;
  return ev;
}

export function buildFrame(evt, tensor, failures) {
  return {
    frame_version: 'gie-512/1.0',
    ts: evt.ts,
    ingest_ts: new Date().toISOString(),
    host: evt.host,
    source: evt.src,
    channel: evt.channel,
    subspaces: [...new Set(failures.map((c) => 'H' + groupOf(c.id)))],
    failed_checks: failures.map((c) => ({ id: c.id, name: c.name, severity: c.severity })),
    defect: tensor.defect(),
    group_masks: [1, 2, 3, 4].map((g) => tensor.groupMaskHex(g)),
    verdict: INLINE_CHANNELS.has(evt.channel) ? 'BLOCK_AND_TERMINATE' : 'DETECTED_POST_HOC',
    severity: worstSeverity(failures),
    evidence: pickEvidence(evt),
    raw_ref: evt.ref,
  };
}
