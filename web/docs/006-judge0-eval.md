# 006 — KVCH Judge and Artifact Intake

## Status

Draft. This document defines the website-side intake and evaluation flow for an immutable KVCH extension artifact. It follows [003 — Extension Design](./003-extension-design.md) and [005 — Extension Bridge Agile Plan](./005-extension-bridge-plan.md).

## Goal

Accept a builder-created `.kvch.tgz` artifact through the KVCH website, establish KVCH's authoritative artifact identity, and verify that the exact stored bytes can be deployed and run through the KVCH Judge.

## Confirmed boundary

The builder's local responsibility ends with a valid `.kvch.tgz` file and an informative local SHA-256 value. The KVCH website owns every subsequent step.

```text
Builder workstation
  → writes extension
  → @arko05roy/kvch-extension packs .kvch.tgz
  → uploads artifact file to KVCH website

KVCH website and backend
  → stores exact uploaded bytes
  → computes authoritative SHA-256 / Extension Tracking ID
  → selects a supported evaluation adapter
  → evaluates stored bytes through the KVCH Judge
  → records immutable evaluation evidence
  → deploys the passing hash on its declared schedule
```

The browser does not run extension code. KVCH's Next.js backend owns the website workflow and hosts the KVCH Judge on the same server. The KVCH Judge is a narrow internal service, not an external Judge0 API or a reimplementation of a general-purpose online compiler.

## V1 deployment target

V1 does not deploy extensions into VS Code, CI, browsers, or employee machines. An approved extension deploys as a KVCH-managed, low-frequency cron-style analysis job.

An extension's use case remains open: it may inspect server logs, poll a service, check configuration, or perform another bounded analysis. The immutable artifact owns its target links, service logic, thresholds, and normal baseline; KVCH does not configure those use-case-specific inputs. A run reports a normalized result against its declared normal condition and creates a Finding only when it observes a concern.

The KVCH website reads the creator-declared `deployment.schedule` from the immutable manifest, owns scheduling/execution/run monitoring, and invokes the approved artifact only at that low-frequency cron interval. The schedule is part of the artifact hash: a schedule change is a new artifact submission. V1 does not provide continuous processes, warm worker pools, or high-frequency execution; those are future runtime tiers.

Editor and distributed-runtime adapters remain future work. They require their own Runtime Bridge, installation registration, hash reporting, and heartbeat protocol.

## V1 hosted runtime contract

KVCH's deployment control plane retains the passing artifact reference and schedule. It creates a Scheduled Extension Run at each due time and dispatches it to the KVCH Judge. The KVCH Judge performs both the pre-deployment evaluation and each short-lived scheduled invocation; the website captures execution records and publishes findings.

Every V1 hosted extension follows one small platform contract while retaining arbitrary analysis logic:

1. KVCH invokes the manifest-declared `commands.run` command for each Scheduled Extension Run.
2. During a normal run, KVCH launches the extension without use-case-specific input or deployment configuration; the artifact's own code supplies that behavior.
3. The extension emits detailed structured findings as newline-delimited JSON (JSONL) only when it observes a concern. A successful normal run emits no finding output; each non-empty stdout line is one Finding Envelope.
4. KVCH records command exit status, duration, captured logs, and parsed findings. A non-zero exit or invalid output is a failed run, not a trusted finding.

This contract standardizes invocation and results; it does not constrain what an extension can inspect. The same artifact continues to be independently runnable outside KVCH using its own documented commands.

KVCH stores the complete emitted Finding Envelope with its artifact hash and Scheduled Extension Run. The extension supplies detection evidence and context, not audience-specific prose reports. KVCH later feeds an authorized projection of that structured finding to AI to generate the required reports.

### Finding Envelope shape

Every JSONL finding has this stable header plus open detail:

```json
{
  "schema_version": "kvch.finding/v1",
  "observed_at": "2026-09-04T14:00:00Z",
  "severity": "high",
  "category": "extension-defined category",
  "title": "Short issue title",
  "summary": "Human-readable overview",
  "resource": { "type": "server", "id": "api-1", "name": "production-api" },
  "evidence": [],
  "indicators": [],
  "baseline": {},
  "recommended_actions": [],
  "details": {}
}
```

`details` preserves arbitrary extension-specific fields, such as log excerpts, thresholds, observed metrics, packet metadata, configuration values, or baseline comparisons. KVCH retains the full record and uses the stable header to list, filter, notify, and report on findings.

### Supported V1 adapters

V1 supports these hosted adapters:

| Manifest implementation | Hosted adapter |
| --- | --- |
| `typescript` with a Node runtime | `typescript/node` |
| `python` with a Python runtime | `python/python3` |

The adapter is selected from `implementation.language` and `implementation.runtime`, never from a filename. Other language artifacts remain valid upload candidates, but KVCH displays them as runtime-unsupported and does not evaluate or deploy them.

### Server-side execution lifecycle

KVCH's own server-side backend is the control plane: it uploads the artifact, starts Judge evaluation, records the result, and schedules later runs. The browser never executes an artifact.

For every low-frequency Scheduled Extension Run, the KVCH Judge materializes the exact stored artifact into its run workspace, builds, and invokes the package afresh. KVCH retains the source `.kvch.tgz`, the resulting execution record, logs, and findings; V1 does not retain prepared bundles, warm workers, or a separate execution fleet.

The Next.js backend uses the existing Postgres-backed `pg-boss` queue to register due schedules and dispatch runs. It is the scheduler and durable run queue, not a second execution system: each dispatched job simply invokes KVCH Judge for the immutable artifact hash.

### KVCH Judge preflight invocation

To verify deployment readiness without contacting a real target, Judge invokes `commands.run` once with `KVCH_EVALUATION=1` and `{}` on standard input. A passing artifact exits `0` and emits no finding output.

This is a protocol check only. It does not test the extension's detection accuracy, require a live service, or convert author-provided fixtures into KVCH's judgment of cybersecurity correctness.

## Evaluation result

A passing Judge evaluation establishes that one exact artifact hash is deployable by KVCH. Deployment and later runs always use those exact stored bytes.

Judge evaluation has only these responsibilities:

1. Evaluation verifies that the artifact builds, runs, exits safely, and satisfies the hosted runtime/output contract.
2. KVCH records the adapter, command outcomes, duration, stdout/stderr, and parsed output against that exact hash.
3. The scheduler later invokes that same hash at its immutable declared interval.

An artifact with an unsupported adapter, a failed command, or invalid finding output is not deployable until its author packages and uploads a corrected artifact.

Judge evaluation does not assess whether a cybersecurity rule correctly detects DDoS, secret exposure, log anomalies, or another domain concern. That behavior belongs to the extension author and remains independently testable through the artifact's own documented commands.

## Integrity rules

- The uploaded `.kvch.tgz` bytes are stored before KVCH calculates SHA-256.
- The server-computed SHA-256 is the Extension Tracking ID for this candidate; a builder-supplied hash is comparison-only.
- Judge evaluation receives only the stored artifact identified by that hash.
- Evaluation output, policy/scenario versions, adapter version, timestamps, and failure evidence are immutable evaluation records tied to that hash.
- Any byte change creates a different artifact that repeats upload, evaluation, and deployment.

## Explicitly deferred

- Deployment screens, recipient selection, and dashboard notification presentation.
- Email, SMS, Slack, escalation, and AI-generated reports.
- Continuous processes, high-frequency execution, warm worker pools, and distributed runtimes.

## Open execution decisions

- Low-frequency schedule limits.
- Upload idempotency, artifact retention, and evaluator-job retry semantics.
