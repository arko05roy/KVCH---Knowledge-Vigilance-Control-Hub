# 005 — Extension Bridge Agile Plan

> Package slices 1–2 are complete in published @arko05roy/kvch-extension@0.1.2. All hosted slices and runtime contracts below are historical and superseded by [006](./006-judge0-eval.md) and [007](./007-kvch-judge-agile-plan.md). Continue building from 007. Hosted adapter keys are typescript/node and python/python3, with separate implementation version 1; interface mode is not part of the key. The artifact owns commands and schedule.

## Goal

Build the npm package and KVCH application capabilities that turn a standalone extension package created with [003 — Extension Design](./003-extension-design.md) into an official, hash-tracked KVCH extension.

`003` stays independent: an AI agent can create a Python, TypeScript, or other language package without having KVCH available. This plan adds the later bridge—package intake, artifact identity, evaluation, approval, runtime adapters, and monitoring—without changing how builders author their code.

## Product boundary

```mermaid
flowchart LR
  A[AI agent uses 003] --> B[Standalone extension folder]
  B --> C[@arko05roy/kvch-extension pack]
  C --> D[KVCH upload and candidate record]
  D --> E[KVCH computes SHA-256]
  E --> F[Evaluate exact artifact]
  F --> G[Whitelist exact hash]
  G --> H[Runtime adapter runs package]
  H --> I[Reports loaded hash and normalized findings]
  I --> J[KVCH monitoring and cases]
```

The bridge does **not** make all languages/runtimes executable on day one. It accepts all valid standalone packages as upload candidates, then runs only packages for which a supported runtime adapter exists. This preserves the language-agnostic builder experience without pretending KVCH can safely execute every possible package immediately.

## Bridge contract

### The npm package

Create one package: `@arko05roy/kvch-extension`. It is both a library and CLI. It must not contain organization permissions, approval rules, database access, or web UI logic.

Initial CLI contract:

```text
kvch-extension validate <extension-folder>
kvch-extension pack <extension-folder> --output <artifact-file>
kvch-extension inspect <artifact-file>
kvch-extension hash <artifact-file>
```

Library responsibilities:

- parse and validate `extension.yaml` from `003`;
- validate the required folder structure and declared entrypoint/commands;
- create deterministic package bytes from the declared source and package files;
- calculate SHA-256 locally for preflight display;
- inspect an artifact without executing it; and
- expose language/runtime adapter interfaces.

KVCH remains the authority: it recomputes SHA-256 after upload. A CLI-provided hash is informative only.

### Artifact and lifecycle model

The application creates these records:

| Record | Purpose |
| --- | --- |
| Extension | Stable conceptual identity from `extension.yaml.id` within a Company. |
| Extension Version | Submitted manifest version and metadata. |
| Artifact | Immutable uploaded package bytes, storage reference, size, SHA-256, and build metadata. |
| Evaluation | Results for one exact artifact hash and selected adapter. |
| Whitelist Decision | Approval/rejection of one exact hash. |
| Activation | Approved artifact assigned to a target/runtime adapter. |
| Installation | One running instance that reports its loaded artifact hash. |

Artifact state is linear: `draft → uploaded → evaluated → whitelisted → active`, with terminal `rejected` and `revoked` states. Any changed byte produces a new Artifact and repeats evaluation and approval.

### Hash and monitoring rules

1. `pack` produces canonical bytes from the extension folder.
2. KVCH stores the uploaded bytes before calculating `SHA-256` itself.
3. The artifact hash is the Extension Tracking ID and is displayed throughout the website.
4. Evaluation runs only the stored bytes for that hash.
5. A runtime adapter calculates/reads the hash of the artifact it loaded and reports it with its installation identity.
6. KVCH accepts a finding only when its installation is active and its reported hash equals the activation's approved hash.
7. A mismatch marks the installation `hash-mismatched`, creates an Audit Event, and prevents that installation from creating trusted findings until corrected or revoked.

The bridge never trusts a hash embedded by extension source code. The package and KVCH compute it independently.

### Runtime adapters and output mapping

An adapter is a versioned component that knows how to build, launch, invoke, or observe one combination of language and interface mode from `extension.yaml`.

```text
Adapter key = implementation.language + implementation.runtime + interface.mode
```

Examples: `typescript/node/event`, `python/python3/cli`, and `python/python3/service`.

Each adapter declares:

- how it validates dependencies;
- how it builds or invokes the package;
- how it identifies the loaded artifact bytes;
- which input it supplies; and
- how the extension's documented outputs are mapped to KVCH's common Finding Envelope.

An artifact with no matching adapter remains a valid uploaded candidate but cannot be evaluated, whitelisted, or activated. The UI must show the missing adapter clearly.

### Deployment, heartbeat, and monitoring

Activation is the approved request to run one artifact for one target; deployment is the adapter-specific act that creates a running Installation. KVCH does not modify the approved artifact while deploying it, because that would change its hash. Instead, the selected runtime adapter/deployment driver receives the immutable artifact and its approved hash as separate inputs.

Every supported adapter supplies three cooperating components:

| Component | Responsibility |
| --- | --- |
| Deployment Driver | Installs, launches, configures, updates, stops, or removes an artifact in its target runtime. |
| Runtime Bridge | Runs beside or wraps the artifact, verifies the loaded bytes, reports the artifact hash, and forwards normalized results. |
| Monitor | Accepts signed heartbeats and findings, derives installation health, records audit events, and renders the website monitoring view. |

The Runtime Bridge is also the future enforcement point for two non-UI guarantees:

1. **Revocation at a tool boundary.** On revocation, KVCH marks the Installation revoked and sends a stop request. The bridge must not begin another declared `operation_boundary`; it requests graceful process termination and force-stops only after a bounded grace period. For adapters that cannot identify a package's internal operation boundary, the adapter boundary is the next invocation, and the UI must state that limitation.
2. **Scoped runtime credentials.** The bridge obtains a short-lived, least-privilege credential for one approved operation/target from the future Action Gateway, injects it only at runtime, and removes it after the operation. Credentials are never embedded in the artifact, manifest, logs, fixtures, or browser.

The package manifest's `runtime_compatibility` section from `003` declares the boundaries and graceful-stop support that the bridge validates before it treats an adapter as managed.

The first driver is a local `typescript/node/event` runner for the demo. It receives an approved artifact, verifies its SHA-256 before launch, runs it in the selected local target, and registers the resulting Installation. VS Code, CI, browser, container, and Python deployment drivers follow the same contract but are independent future adapters.

Heartbeat protocol:

1. During deployment, KVCH creates an Installation and issues a short-lived, single-use registration token.
2. The Runtime Bridge generates an Ed25519 key pair locally, registers its public key, and retains the private key in its runtime-appropriate secure store.
3. At the activation's configured interval, it sends a signed heartbeat with `installation_id`, timestamp, target reference, runtime adapter key, and the SHA-256 of the bytes it actually loaded.
4. KVCH validates the signature and compares the reported hash against the approved activation hash before updating health.
5. A periodic `pg-boss` monitor job marks an Installation `stale` after a late heartbeat and `offline` after its configured grace period. A different reported hash is immediately `hash-mismatched`.
6. Health transitions, failed deployments, revocations, and mismatches create Audit Events and appear in the monitoring dashboard. They do not automatically escalate an employee case.

The monitoring dashboard shows extension ID/version/hash, activation target, adapter, installation state, last heartbeat, last trusted finding, deployment error if any, and controls to revoke or redeploy an Installation.

## Agile delivery plan

### Slice 1 — Bridge package foundation

**Type:** AFK. **Blocked by:** none.

Build `@arko05roy/kvch-extension` with parsing and structural validation for the `003` manifest/folder shape. Include valid TypeScript and Python fixture packages plus invalid-manifest fixtures.

**Acceptance criteria:**

- [ ] `validate` explains actionable manifest, entrypoint, and command failures.
- [ ] The same manifest is parsed identically by CLI and library APIs.
- [ ] No Company, authorization, or web dependency exists in the package.

### Slice 2 — Deterministic artifacts and local hash preflight

**Type:** AFK. **Blocked by:** Slice 1.

Implement deterministic packaging, inspection, and SHA-256 display for a valid standalone extension.

**Acceptance criteria:**

- [ ] Unchanged source produces byte-identical artifacts and hashes.
- [ ] A source or manifest change produces a different hash.
- [ ] `inspect` exposes only package metadata; it never executes package code.
- [ ] README documents pack/inspect/hash workflow.

### Slice 3 — Candidate upload vertical slice

**Type:** AFK. **Blocked by:** Slice 2.

Add a Clerk-authenticated dashboard flow that uploads an artifact, stores the exact bytes through the Storage Adapter, recomputes SHA-256 server-side, and displays a candidate extension/version/artifact page.

**Acceptance criteria:**

- [ ] Uploaded bytes, server hash, manifest, and storage checksum are recorded atomically in Neon.
- [ ] The UI displays the conceptual extension ID, version, artifact hash, and `uploaded` status.
- [ ] Re-uploading identical bytes does not create an ambiguous second artifact.
- [ ] Upload creates an append-only Audit Event.

### Slice 4 — First runtime adapter and real evaluation

**Type:** AFK. **Blocked by:** Slice 3.

Implement `typescript/node/event` as the first adapter. It builds/evaluates a safe fixture extension against normal, concern, and edge-case fixtures using the real local Judge0-compatible Evaluation Gate.

**Acceptance criteria:**

- [ ] KVCH evaluates only the stored bytes whose server hash is shown in the UI.
- [ ] Evaluation records adapter key, scenarios, output, status, and exact artifact hash.
- [ ] A failing scenario leaves the artifact ineligible for whitelisting.
- [ ] The evaluator cannot alter the stored artifact.

### Slice 5 — Whitelist and activation controls

**Type:** HITL. **Blocked by:** Slice 4.

Add the authorized website workflow that whitelists one passing artifact hash and creates an activation for a supported target and adapter.

**Acceptance criteria:**

- [ ] A decision names exactly one artifact hash.
- [ ] Changed code requires a new candidate/evaluation/decision.
- [ ] Activation is impossible for unapproved, failed, or unsupported artifacts.
- [ ] Decisions and activation changes create Audit Events.

### Slice 6 — First deployment driver and Installation lifecycle

**Type:** AFK. **Blocked by:** Slice 5.

Implement the first local `typescript/node/event` Deployment Driver and Runtime Bridge. An approved activation launches the immutable artifact in its selected local target only after verifying its hash, then creates its Installation record.

**Acceptance criteria:**

- [ ] A whitelisted artifact can be deployed to the first supported local target without changing its artifact bytes.
- [ ] The Runtime Bridge verifies the approved hash before launch and refuses a changed artifact.
- [ ] Deployment state is visible as `pending`, `deployed`, `failed`, `revoked`, or `removed`.
- [ ] Stop, redeploy, and revoke operations are audited and affect only the selected Installation/target.

### Slice 6a — Managed runtime controls

**Type:** AFK. **Blocked by:** Slice 6.

Add the Runtime Bridge controls that honor declared operation boundaries, stop a revoked installation before its next boundary, and accept only injected runtime credentials. Initially use a fixture Action Gateway credential issuer; full policy/UI configuration can follow later.

**Acceptance criteria:**

- [ ] A revocation request prevents the next declared external operation and transitions the Installation to revoked.
- [ ] A cooperative package receives graceful stop; a non-cooperative process is recorded and stopped after its bounded grace period.
- [ ] The bridge can run an approved operation only with a short-lived scoped fixture credential.
- [ ] No credential is present in the artifact, manifest, build output, logs, or browser response.

### Slice 7 — Verified heartbeat and monitoring vertical slice

**Type:** AFK. **Blocked by:** Slice 6a.

Add installation registration, Ed25519 signing, heartbeat ingestion, a scheduled liveness monitor, and a dashboard installation-health view for the first adapter.

**Acceptance criteria:**

- [ ] A known installation reporting its approved hash becomes healthy.
- [ ] A different hash is visible as `hash-mismatched` and is audited.
- [ ] Missing heartbeats transition from healthy to stale to offline according to configured intervals.
- [ ] Heartbeat handling is signed, idempotent, and never creates a case by itself.
- [ ] The dashboard exposes hash, target, adapter, last heartbeat, state, and deployment error.

### Slice 8 — First trusted finding to case flow

**Type:** AFK. **Blocked by:** Slice 7.

Map the first adapter's documented output to the Finding Envelope and connect a verified finding to the existing case, group inbox, and notification flow.

**Acceptance criteria:**

- [ ] Only an active installation with the approved hash can create a trusted case.
- [ ] Findings preserve artifact hash, adapter key, and installation ID in the audit trail.
- [ ] A hash-mismatched installation cannot create a trusted finding.
- [ ] The secret-exposure fixture proves safe evidence reaches the role projection without raw values.

### Slice 9 — Python adapter tracer bullet

**Type:** AFK. **Blocked by:** Slices 2, 3, 5, and 7.

Add one `python/python3/cli` adapter using a small fixture extension. This proves the generic package structure is genuinely multi-language rather than TypeScript-only.

**Acceptance criteria:**

- [ ] A Python package validates, uploads, hashes, evaluates, and activates through its adapter.
- [ ] Adapter selection is derived from the manifest, not filename guesses.
- [ ] Unsupported language/mode combinations remain clear candidates, not broken uploads.

### Slice 10 — Builder-to-website documentation and demo

**Type:** AFK. **Blocked by:** Slices 1–9.

Document the handoff from `003` to the bridge CLI and website. Record one end-to-end demo: agent-created package → artifact hash → evaluation → approval → installation hash → finding/case.

**Acceptance criteria:**

- [ ] A new builder can follow the guide without knowing KVCH internals.
- [ ] The demo shows exactly where package authoring ends and official platform governance begins.
- [ ] `002`, `003`, and this plan use consistent manifest, hash, and lifecycle language.

## Delivery order

```text
1 → 2 → 3 → 4 → 5 → 6 → 6a → 7 → 8
      └──────────────────→ 9
1–9 → 10
```

Slices 1–2 are the standalone npm package. Slices 3–8 are the first end-to-end website bridge, including deployment, runtime controls, and monitoring. Slice 9 proves composability across languages. Slice 10 makes the workflow repeatable for future builders.

## Deferred until after the bridge works

- Broad language/runtime support beyond the first TypeScript and Python adapters.
- Remote production hosting and multi-machine runtime orchestration.
- Detailed sandbox hardening beyond the local evaluator baseline.
- Automatic conversion of arbitrary extension outputs; every adapter owns an explicit, tested Finding Envelope mapping.
