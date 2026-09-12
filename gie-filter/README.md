# gie-filter

GIE-512 invariant filtration layer — pure-software reference implementation of the
`GENERALIZED_INVARIANT_ENGINE_WHITEPAPER.md` architecture, built to sit between
KVCH extension/system-log outputs and the Redis → Express backend.

```
raw system logs (syslog/journald/docker/access/dns/eBPF JSON/app JSON)
        │                                    any format, 1000s/sec
        ▼
   adapters  ──► normalized event {ts, host, channel, fields}
        │
        ▼
   GieEngine   ──► T(s) ∈ {0,1}^512 tensor, D(s) = ‖1₅₁₂ − T(s)‖₁
        │
        ├── D(s)=0  → dropped (1% sampled to cold store)
        └── D(s)>0  → normalized defect frame → defect stream
                      (this is ALL the backend ever sees)
```

## Why it exists

The current design pipes **all** system logs into the backend. Problems:

1. **Volume** — backend crashes at thousands of logs/sec. Here, only
   `D(s)>0` defect frames are forwarded; everything else is dropped or
   1%-sampled to cold storage.
2. **Heterogeneous formats** — there is no universal input schema, and none
   is needed. Thin per-source adapters extract just the fields each check
   requires; the *output* schema is uniform.
3. **No fixed DB schema** — defect frames have one fixed shape
   (`frame_version: gie-512/1.0`), ready for Postgres/Qdrant/Neo4j.

## Whitepaper mapping

| Whitepaper | Here |
|---|---|
| §3.3 `T(s) ∈ {0,1}^512` | `src/tensor.js` — 8×u64 scalar eval |
| §3.4 `D(s)` defect operator | `src/engine.js` `evaluate()` |
| §4 taxonomy, checks 1–512 | `src/checks.js` — implemented functionals carry real check IDs |
| §4.1 AST baselines (Phase 1) | `src/baseline.js` — shape-hash templates |
| §3.9 DNS entropy bound | Check 390 via `src/entropy.js` |
| App. B `comm`/`filename` convention | checks 258/259/260 lineage edges |
| §6.5 defect → telemetry frame | `src/frame.js` defect frame |

Coverage: ~43 of 512 functionals are implemented with real logic; the rest
are declared ranges that vacuously pass (reported honestly by the bench).

## Run

```bash
cd gie-filter

# dry run at all sizes: 10, 20, 30, 100, 1000, 10000 logs
node src/bench.js

# custom sizes / attack rate / write frames to out/
node src/bench.js --sizes 10,500,10000 --rate 0.08 --dump

# handcrafted attack showcase — 25 attacks + 4 benign, per-input verdicts
node src/demo.js

# filter a real log file: raw lines in, defect frames out
cat /var/log/syslog | node src/service.js > defects.ndjson
```

## Output frame (fixed schema)

```json
{
  "frame_version": "gie-512/1.0",
  "ts": "...", "host": "web-1", "source": "ebpf", "channel": "execve",
  "subspaces": ["H3"],
  "failed_checks": [{"id": 258, "name": "Zero shell from web workers", "severity": "critical"}],
  "defect": 2,
  "group_masks": ["0xffff...", "..."],
  "verdict": "BLOCK_AND_TERMINATE",
  "severity": "critical",
  "evidence": {"comm": "node", "file": "/bin/sh"},
  "raw_ref": "line:4210"
}
```

`verdict`: `BLOCK_AND_TERMINATE` for enforcement-capable channels (eBPF
LSM/XDP classes) — the action was killed inline; `DETECTED_POST_HOC` for
log-derived evidence.

## Next steps toward production

- Replace `DefectStream` with `XADD` to the real Redis stream; backend drains it.
- Point `ColdStore` at S3/disk for full-fidelity forensics (`raw_ref` linkage).
- Add adapters as new log sources appear — output schema never changes.
- Grow implemented check coverage inside `src/checks.js` (same `reg()` API).
