# Product Requirement Document (PRD): KVCH Modular Extension Architecture & `@arko05roy/kvch-extension` SDK

**Document Status**: Official Master Architecture & Product Specification  
**Version**: 1.0.0  
**Target Systems**: KVCH Web Platform, `@arko05roy/kvch-extension` Bridge SDK, 8 Security Extensions, 24/7 EDR Daemon (`kvch-agent`), and KVCH Judge Execution Kernel.

---

## 1. Executive Summary & Architecture Overview

The Knowledge Vigilance Control Hub (KVCH) security ecosystem employs an isolated, deterministic, modular security architecture. The architecture decouples **security detection logic** (written as independent, composable extension packages) from **packaging/validation tooling** (`@arko05roy/kvch-extension`), **endpoint detection daemons** (`kvch-agent`), and **central server evaluation/execution** (KVCH Judge & Next.js Control Hub).

```
+-----------------------------------------------------------------------------------------------------------------+
|                                           EXTENSION BUILDER WORKSTATION                                         |
|                                                                                                                 |
|  +---------------------------+  validate   +------------------------------------+   pack   +-----------------+  |
|  | Extension Source Folder   | -----------> | @arko05roy/kvch-extension SDK / CLI| -------> |  .kvch.tgz      |  |
|  | (src/, extension.yaml,    |              | (Static AST / Schema / Cron check) |          | (Deterministic) |  |
|  |  README.md, package.json) |              +------------------------------------+          +--------+--------+  |
|  +---------------------------+                                                                   |             |
+--------------------------------------------------------------------------------------------------|-------------+
                                                                                                   | Upload Bytes
                                                                                                   v
+-----------------------------------------------------------------------------------------------------------------+
|                                        KVCH WEB PLATFORM & JUDGE ENGINE                                         |
|                                                                                                                 |
|  +---------------------------+  Re-hash   +------------------------+  Queue Job   +--------------------------+  |
|  | Multipart Upload Endpoint | ---------> | ArtifactStorage & DB   | -----------> | pg-boss Worker Daemon    |  |
|  | (/api/extensions/upload)  |            | (SHA-256 Authority)    |              | (scripts/kvch-worker.ts) |  |
|  +---------------------------+            +------------------------+              +------------+-------------+  |
|                                                                                                |                |
|                                                                                                v                |
|  +-----------------------------------------------------------------------------------------------------------+  |
|  |                                  KVCH JUDGE EXECUTION KERNEL (KvchJudge)                                  |  |
|  |                                                                                                           |  |
|  |   1. Verify stored bytes sha256                                                                          |  |
|  |   2. Select Adapter (typescript/node or python/python3)                                                    |  |
|  |   3. Expand tarball to isolated temporary workspace (/tmp/judge-XXXXXX)                                  |  |
|  |   4. Run lifecycle: install -> build -> run (with KVCH_EVALUATION=1 for preflight, =0 for normal run)    |  |
|  |   5. Capture exit codes, bounded stdout/stderr, & parse JSONL findings (kvch.finding/v1)                   |  |
|  |   6. Teardown & clean workspace directory                                                                 |  |
|  +-----------------------------------------------------------------------------------------------------------+  |
|                                                                                                                 |
+-----------------------------------------------------------------------------------------------------------------+
```

---

## 2. Part I: The `@arko05roy/kvch-extension` SDK & CLI ("Arkokvch Package")

### 2.1 Package Overview & Responsibilities
The `@arko05roy/kvch-extension` package (v0.1.2) is an independent, standalone TypeScript/Node.js library and CLI tool published on npm. It acts as the official packaging bridge and structural validator for all KVCH extensions.

* **Key Responsibility**: Convert any extension source directory into an immutable, byte-deterministic `.kvch.tgz` artifact without executing any extension code.
* **Zero Runtime Execution Guarantee**: The SDK never runs extension code, installs external dependencies, executes shell commands, contacts remote servers, or handles database credentials.
* **Engine Prerequisite**: Node.js `>= 22.0.0`.

### 2.2 CLI Commands Specification
The package provides the `kvch-extension` executable (`dist/cli.js`):

```bash
# 1. Structural & Manifest Validation
kvch-extension validate ./my-extension

# 2. Deterministic Packing
kvch-extension pack ./my-extension --output ./artifacts/my-extension.kvch.tgz

# 3. In-Memory Manifest Inspection
kvch-extension inspect ./artifacts/my-extension.kvch.tgz

# 4. SHA-256 Preflight Hashing
kvch-extension hash ./artifacts/my-extension.kvch.tgz
```

| Command | Action / Verification Rules | Output |
| :--- | :--- | :--- |
| `validate` | Validates manifest schema (`kvch.extension-package/v1`), single-line non-empty commands, `entrypoint` existence within bounds, cron schedule syntax (`cron-parser`), npm script references in `package.json` (if node), and rejects symlinks/path traversals (`..`). | Pass: Exit code `0`. Fail: Lists validation errors to stderr and exits `1`. |
| `pack` | Executes `validate` preflight, canonicalizes file order, file permissions (`0644` files, `0755` executable dirs/files), file mtime (`1970-01-01T00:00:00Z`), and UID/GID (`0`). Filters out ignored patterns (`node_modules`, `.git`, `dist`, `.DS_Store`, `*.tgz`). | Generates gzip ustar `.kvch.tgz` file and prints SHA-256 hash & byte size. |
| `inspect` | Reads `.kvch.tgz` bytes from disk, extracts `extension.yaml` in-memory, parses YAML metadata, computes SHA-256, and outputs metadata without extracting files to disk. | JSON/text summary of SHA-256, manifest ID, name, version, adapter key, & schedule. |
| `hash` | Computes SHA-256 digest of specified `.kvch.tgz` file. | Printed SHA-256 hex string. |

### 2.3 `extension.yaml` Manifest Specification (`kvch.extension-package/v1`)
Every extension MUST contain a top-level `extension.yaml` adhering to the following schema:

```yaml
schema_version: kvch.extension-package/v1
id: attack-surface-scanner
name: Network Attack Surface Scanner
version: 1.0.0
description: Scans exposed local and LAN network attack surfaces, open ports, and active web HTTP services.

implementation:
  language: python # python | typescript
  runtime: python3 # python3 | node >=22
  package_manager: pip # pip | npm
  entrypoint: src/1_attack_surface_scanner.py

commands:
  install: pip install -r requirements.txt
  build: python3 -m py_compile src/1_attack_surface_scanner.py
  run: python3 src/1_attack_surface_scanner.py
  test: python3 -m unittest discover tests
  package: npx @arko05roy/kvch-extension pack . --output attack-surface-scanner.kvch.tgz

interface:
  mode: cli # cli | event | service | library
  inputs:
    - name: target_host
      description: Target IP or local network range to inspect.
  outputs:
    - name: findings
      description: JSONL kvch.finding/v1 envelopes emitted on concern.

behavior:
  normal: All listening ports and HTTP response headers match expected security posture.
  concern: Exposed database ports (3306, 5432) or unencrypted HTTP endpoints detected.
  edge_cases:
    - Target host offline or firewall dropping packets.

dependencies:
  runtime: [python3]
  system: [nmap, tshark]
  configuration: []

runtime_compatibility:
  supports_graceful_stop: true
  operation_boundaries: [scan_network, analyze_headers, emit_finding]
  credentials: injected_at_runtime

deployment:
  schedule: "*/5 * * * *" # Creator-declared 5-field cron schedule
```

### 2.4 Programmatic Library API (TypeScript)
Developers and server frameworks import `@arko05roy/kvch-extension` directly:

```typescript
import {
  validateExtension,
  createArtifact,
  inspectArtifactBytes,
  type ExtensionManifest,
  type InspectedArtifact
} from "@arko05roy/kvch-extension";

// Validate source folder
const result = await validateExtension("./extensions/attack-surface-scanner");
if (!result.valid) {
  console.error(result.issues);
}

// Generate deterministic tarball bytes
const artifactBytes: Uint8Array = await createArtifact("./extensions/attack-surface-scanner");

// Inspect tarball bytes in-memory
const inspected: InspectedArtifact = inspectArtifactBytes(artifactBytes);
console.log(`Sha256: ${inspected.artifactSha256}, Schedule: ${inspected.manifest.deployment.schedule}`);
```

---

## 3. Part II: Modular Extension Engines (Extensions 1 to 8)

The system includes 8 specialized security scanning engines built as modular extension packages under `External/extensions/`.

```
External/
├── attack-surface-scanner/         # Ext 1: Network & HTTP Port Auditor
├── vpn-crypto-analyzer/            # Ext 2: VPN Tunnel & Wallet Process Auditor
├── phishing-hunter/                # Ext 3: Host File & Phishing Redirect Hunter
├── threat-hunter-3000/             # Ext 4: Process Persistence & Daemon Auditor
├── malware-analyzer/               # Ext 5: Entropy & Mach-O/ELF Binary Auditor
├── credential-exposure-auditor/    # Ext 6: AST Secret & Crypto Clipper Auditor
├── supply-chain-auditor/           # Ext 7: Dependency Typosquatting & Lockfile Auditor
└── cookie-xss-auditor/             # Ext 8: SQLite Cookie Posture & DOM XSS Auditor
```

### 3.1 Comprehensive Extension Breakdown

#### 1. Attack Surface Scanner (`attack-surface-scanner`)
* **Entrypoint**: `src/1_attack_surface_scanner.py`
* **Target Domain**: Network boundary, listening ports, and web HTTP headers.
* **Data Sources**: Native TCP sockets, `netstat`/ifconfig socket dumps, active HTTP/HTTPS endpoints.
* **Detection Heuristics**: Unencrypted HTTP interfaces, missing HSTS (`Strict-Transport-Security`) headers, database ports (`3306`, `5432`, `27017`) listening on `0.0.0.0` or LAN interfaces.
* **Default Schedule**: `*/5 * * * *` (Every 5 mins).

#### 2. VPN & Crypto Analyzer (`vpn-crypto-analyzer`)
* **Entrypoint**: `src/2_vpn_crypto_analyzer.py`
* **Target Domain**: Network interface privacy and crypto asset process hooks.
* **Data Sources**: Interface tables (`tun0`, `wg0`, `ppp0`), system DNS resolvers (`/etc/resolv.conf`), process table (`ps -ax`).
* **Detection Heuristics**: Split-tunneling DNS leaks, unencrypted DNS providers, active browser wallet process inspection (MetaMask, Phantom, Exodus, Ledger Live).
* **Default Schedule**: `*/10 * * * *` (Every 10 mins).

#### 3. Phishing Hunter (`phishing-hunter`)
* **Entrypoint**: `src/3_phishing_hunter.py`
* **Target Domain**: Local DNS hijacking and malicious web extensions.
* **Data Sources**: System hosts file (`/etc/hosts`), browser extension manifests (Chrome, Brave, Edge, Firefox profile dirs), remote socket IPs.
* **Detection Heuristics**: Malicious hosts redirects targeting banking/crypto domains, unverified third-party extension `update_url` endpoints, homograph domain patterns.
* **Default Schedule**: `*/15 * * * *` (Every 15 mins).

#### 4. Threat Hunter 3000 (`threat-hunter-3000`)
* **Entrypoint**: `src/4_threat_hunter_3000.py`
* **Target Domain**: System process trees, autostart persistence, and background daemons.
* **Data Sources**: Process tree execution table (`ps -ax -o pid,ppid,user,command`), autostart directories (`~/Library/LaunchAgents`, `/Library/LaunchDaemons`, `/etc/cron.*`).
* **Detection Heuristics**: Hidden processes executing from `/tmp`, unauthorized LaunchAgents executing obfuscated base64 shell scripts, orphan background daemons.
* **Default Schedule**: `*/5 * * * *` (Every 5 mins).

#### 5. Malware Analyzer (`malware-analyzer`)
* **Entrypoint**: `src/5_malware_analyzer.py`
* **Target Domain**: Binary executable analysis, packed code detection, and temporary directory hygiene.
* **Data Sources**: `/tmp`, `~/Downloads`, system temp paths, binary headers (Mach-O, ELF, PE magic bytes).
* **Detection Heuristics**: Shannon entropy calculation ($H > 7.2$) indicating packed/encrypted binaries, executable flags (`chmod +x`) on hidden scripts in `/tmp`.
* **Default Schedule**: `*/5 * * * *` (Every 5 mins).

#### 6. Credential Exposure Auditor (`credential-exposure-auditor`)
* **Entrypoint**: `src/6_credential_exposure_auditor.py`
* **Target Domain**: Secret leaks, Web3 drainer signatures, and multi-chain clipboard clippers.
* **Data Sources**: Source code repositories, `.env` files, `~/.ssh/id_*`, `~/.aws/credentials`, system clipboard API hooks.
* **Detection Heuristics**: AST deobfuscation (hex `\x65`, unicode `\u0065`, `String.fromCharCode`), BIP39 seed phrases, raw EVM/BTC/SOL private keys, Permit2 phishing signatures, clipboard `writeText` address replacers.
* **Default Schedule**: `*/5 * * * *` (Every 5 mins).

#### 7. Supply Chain Auditor (`supply-chain-auditor`)
* **Entrypoint**: `src/7_supply_chain_auditor.py`
* **Target Domain**: Project dependency trees and lockfile integrity.
* **Data Sources**: `package-lock.json`, `pnpm-lock.yaml`, `Pipfile.lock`, `requirements.txt`, `package.json`.
* **Detection Heuristics**: Levenshtein distance typosquatting checks (e.g. `reqeusts`, `cross-env-payload`), unpinned HTTP package tarballs, malicious `postinstall` lifecycle hook execution (`curl | bash`).
* **Default Schedule**: `*/30 * * * *` (Every 30 mins).

#### 8. Cookie Security, DOM XSS & Session Auditor (`cookie-xss-auditor`)
* **Entrypoint**: `src/8_cookie_xss_analyzer.py`
* **Target Domain**: Client-side web security posture, cookie hijacking, and DOM XSS vector analysis.
* **Data Sources**: SQLite3 browser cookie databases (`~/Library/Application Support/.../Default/Cookies`), browser content scripts, `localStorage` / `sessionStorage`.
* **Detection Heuristics**: Sensitive session cookies missing `HttpOnly`/`Secure` flags, sub-domain cookie tossing (`Domain=.domain.com`), dangerous DOM sinks (`innerHTML`, `document.write`, `eval(location.hash)`), unencrypted JWT storage.
* **Default Schedule**: `*/15 * * * *` (Every 15 mins).

### 3.2 Master Automated Build Pipeline (`build_all.sh`)
The master packaging script `External/scripts/build_all.sh` automates validating, packing, inspecting, and hashing all 8 extensions using `@arko05roy/kvch-extension`:

```bash
#!/usr/bin/env bash
# Runs: validate -> pack -> inspect -> hash for all 8 extensions
# Outputs: External/artifacts/*.kvch.tgz and External/artifacts/build_summary.json
./External/scripts/build_all.sh
```

---

---

## 4. Part III: Unified Master Security Engine & Consolidated Single Report Architecture

### 4.1 Unified Master Security Engine Executable (`unified_kvch_security_engine.py`)
To provide a seamless, single-entrypoint deployment experience, all 8 security extensions are combined into one unified 24/7 background security daemon: **`External/unified_kvch_security_engine.py`**.

* **Single Executable / Daemon File**: `External/unified_kvch_security_engine.py`
* **Coverage**: Integrates 100% of features across all 8 security scanning modules:
  1. Attack Surface Scanner (Open TCP ports, HTTP response headers, SSL/TLS, subdomains).
  2. VPN & Crypto Analyzer (System network interfaces `tun0`/`wg0`, split-tunnel DNS, MetaMask/Phantom/Exodus process hooks).
  3. Phishing Hunter (`/etc/hosts` DNS overrides, browser extension profile manifests, homograph domain checks).
  4. Threat Hunter 3000 (Process tree execution, hidden processes in `/tmp`, LaunchAgents/Daemons autostart entries).
  5. Malware Analyzer (Shannon entropy calculation $H > 7.2$, Mach-O/ELF/PE binary header parsing, `/tmp` executable flags).
  6. Credential Exposure Auditor (AST deobfuscation, BIP39 seed phrase detector, raw EVM/BTC/SOL private keys, Permit2 signatures, clipboard crypto clippers).
  7. Supply Chain Auditor (`package-lock.json`, `pnpm-lock.yaml`, `requirements.txt` typosquatting, unpinned HTTP tarballs, `postinstall` `curl | bash`).
  8. Cookie Security & DOM XSS Auditor (SQLite3 cookie DB posture, missing `HttpOnly`/`Secure` flags, sub-domain cookie tossing, dangerous DOM sinks `innerHTML`/`eval`).

### 4.2 One Single Consolidated Master Report (`report.json`)
Instead of fragmented outputs or multiple report files, the Unified Engine parses, aggregates, and outputs **EXACTLY ONE SINGLE CONSOLIDATED MASTER REPORT FILE**:

$$\text{Canonical Master Report File}: \mathbf{External/reports/report.json}$$

```json
{
  "schema_version": "kvch.finding/v1",
  "observed_at": "2026-09-12T19:32:05.123456Z",
  "severity": "CRITICAL",
  "category": "unified_master_security_audit",
  "title": "KVCH Unified Master Security Audit Report - MacBook-Air.lan",
  "summary": "Consolidated 24/7 security audit across all 8 KVCH extension engines on MacBook-Air.lan (192.168.31.204). Detected 125 total security findings across attack surface, VPN/crypto, phishing, threat hunting, malware, credential exposure, supply chain, and cookie XSS.",
  "resource": {
    "type": "unified_endpoint_host",
    "id": "192.168.31.204",
    "name": "MacBook-Air.lan",
    "interface": "en0"
  },
  "evidence": [
    "[ATTACK_SURFACE_SCANNER] Open ports: 445/SMB, 5432/PostgreSQL",
    "[VPN_CRYPTO_ANALYZER] Unencrypted DNS resolver detected during active VPN tunnel",
    "[PHISHING_HUNTER] Unverified third-party extension update_url target detected",
    "[THREAT_HUNTER_3000] Process executing out of /tmp directory",
    "[MALWARE_ANALYZER] Binary Shannon entropy H=7.8 (> 7.2 threshold) in /tmp/payload.bin",
    "[CREDENTIAL_EXPOSURE_AUDITOR] Raw EVM private key detected in unencrypted .env file",
    "[SUPPLY_CHAIN_AUDITOR] Typosquatted package 'reqeusts' detected in package-lock.json",
    "[COOKIE_XSS_AUDITOR] Sensitive session cookie missing HttpOnly flag and DOM XSS sink innerHTML detected"
  ],
  "indicators": [
    "OPEN_PORT_5432",
    "UNENCRYPTED_DNS",
    "OBFUSCATED_LAUNCH_AGENT",
    "HIGH_ENTROPY_BINARY",
    "RAW_PRIVATE_KEY_EXPOSURE",
    "TYPOSQUATTED_PACKAGE",
    "COOKIE_MISSING_HTTPONLY",
    "DOM_XSS_SINK"
  ],
  "baseline": {
    "max_allowed_open_ports": 0,
    "expected_cookie_flags": ["HttpOnly", "Secure"],
    "expected_xss_sinks": 0
  },
  "recommended_actions": [
    "Restrict open ports to authorized IP ranges using firewall rules",
    "Enforce HttpOnly and Secure flags on all session cookies",
    "Remove raw credentials from unencrypted environment files and rotate keys",
    "Replace innerHTML and eval() sinks with safe textContent and DOM APIs",
    "Replace typosquatted dependency 'reqeusts' with verified package 'requests'"
  ],
  "details": {
    "engine_version": "1.0.0-unified",
    "total_extensions_executed": 8,
    "total_threats_detected": 125,
    "overall_system_severity": "CRITICAL",
    "scan_timestamp": "2026-09-12T19:32:05.123456Z",
    "host_metadata": {
      "hostname": "MacBook-Air.lan",
      "ip": "192.168.31.204",
      "interface": "en0",
      "os": "darwin"
    },
    "extensions_breakdown": {
      "extension_1_attack_surface_scanner": { "status": "SUCCESS", "threat_count": 2 },
      "extension_2_vpn_crypto_analyzer": { "status": "SUCCESS", "threat_count": 1 },
      "extension_3_phishing_hunter": { "status": "SUCCESS", "threat_count": 1 },
      "extension_4_threat_hunter_3000": { "status": "SUCCESS", "threat_count": 2 },
      "extension_5_malware_analyzer": { "status": "SUCCESS", "threat_count": 1 },
      "extension_6_credential_exposure_auditor": { "status": "SUCCESS", "threat_count": 5 },
      "extension_7_supply_chain_auditor": { "status": "SUCCESS", "threat_count": 3 },
      "extension_8_cookie_xss_auditor": { "status": "SUCCESS", "threat_count": 110 }
    }
  }
}
```

### 4.3 Time-Interval & Event-Driven Master Report Lifecycle
The single consolidated master report file (`External/reports/report.json`) is dynamically updated in-place with **fresh ISO-8601 timestamps** across two triggers:

```
+---------------------------------------------------------------------------------------------------------+
|                               CONSOLIDATED MASTER REPORT LIFECYCLE                                      |
|                                                                                                         |
|  TRIGGER 1: Time-Interval Loop (Cron)                                                                   |
|  [Every 15s / 30s / Cron Schedule] ---+                                                                 |
|                                       |                                                                 |
|                                       v                                                                 |
|                          +------------------------+    Overwrites    +-------------------------------+  |
|                          | Unified Security Engine| ---------------> | Single Master Report          |  |
|                          | (Scans all 8 engines)  |   New Timestamps | External/reports/report.json  |  |
|                          +------------------------+   Fresh Telemetry+-------------------------------+  |
|                                       ^                                                                 |
|                                       |                                                                 |
|  TRIGGER 2: Event-Driven Watchers     |                                                                 |
|  [FileSystem / Process / Network] ----+                                                                 |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
```

1. **Continuous 24/7 Time-Interval Rescan**: The engine background loop executes a full scan pass across all 8 extensions periodically, updating `External/reports/report.json` in-place with fresh timestamps (`observed_at`, `scan_timestamp`).
2. **Real-Time Event-Driven Triggers**: Integrated `FileSystemWatcher`, `ProcessAndSocketMonitor`, and `NetworkSurfaceScanner` monitor endpoint events. Upon detecting any change (such as a file drop in `/tmp`, SSH key edit, or open port delta), the engine immediately re-scans, updates `External/reports/report.json` with a new timestamp, and streams the updated JSON live over WebSockets (`ws://localhost:3000/api/ws`).

### 4.4 Master Unified Control Daemon Script (`run_unified_engine.sh`)
```bash
./External/scripts/run_unified_engine.sh start       # Start 24/7 background daemon
./External/scripts/run_unified_engine.sh run-once     # Execute 1-shot unified pass & print report
./External/scripts/run_unified_engine.sh status       # Query running status & PID
./External/scripts/run_unified_engine.sh logs         # Tail live daemon logs
./External/scripts/run_unified_engine.sh stop         # Stop background daemon
```

### 4.5 `kvch.finding/v1` Standardized Envelope Specification
All 8 extensions emit newline-delimited JSON (JSONL) lines matching this standard:
```json
{
  "schema_version": "kvch.finding/v1",
  "observed_at": "2026-09-12T18:30:00Z",
  "severity": "CRITICAL",
  "category": "cookie_xss_analyzer",
  "title": "Cookie Security Posture, DOM XSS & Session Theft Finding",
  "summary": "Audited browser cookie security and client-side DOM script sinks on local host. Detected 125 security findings.",
  "resource": {
    "type": "browser_profile_web_posture",
    "id": "browser_profile_web_posture",
    "name": "MacBook-Air.lan"
  },
  "evidence": [
    "Sensitive session cookie 'session_id' on '.auth-service.io' lacks HttpOnly flag (vulnerable to XSS theft).",
    "Detected DOM XSS vector in content_script_main.js: innerHTML direct assignment DOM XSS sink",
    "Detected document.cookie exfiltration hook forwarding session cookies to external endpoint."
  ],
  "indicators": [
    "COOKIE_MISSING_HTTPONLY",
    "DOM_XSS_SINK",
    "COOKIE_EXFILTRATION_HOOK"
  ],
  "baseline": {
    "expected_cookie_flags": ["HttpOnly", "Secure", "SameSite=Strict"],
    "expected_xss_sinks": 0
  },
  "recommended_actions": [
    "Enforce HttpOnly and Secure flags on all session cookies",
    "Replace innerHTML and eval() sinks with safe textContent and DOM APIs",
    "Store JWT session tokens in HttpOnly cookies instead of localStorage"
  ],
  "details": {
    "total_threats_detected": 125,
    "severity": "CRITICAL",
    "extension_id": "cookie-xss-auditor",
    "version": "1.0.0"
  }
}
```

### Severity Classification Rules
* **`CRITICAL`**: Active secret leak, clipboard crypto clipper hijack, unauthenticated remote command execution, active DOM XSS cookie exfiltration hook.
* **`HIGH`**: Missing `HttpOnly` on sensitive session cookies, packed binary executable in `/tmp` with `chmod +x`, exposed database port on public/LAN interface.
* **`MEDIUM`**: Typosquatted dependency package name, unpinned HTTP package download URL, split-tunnel DNS leakage during active VPN connection.
* **`LOW`**: Missing HSTS headers, non-critical launch agent autostart entry, unencrypted local storage usage.

---

## 5. Part IV: 24/7 EDR Background Agent (`kvch-agent`)

The endpoint agent `kvch-agent` (`External/edr_daemon/`) runs as a 24/7 background process on target hosts:

```
+-----------------------------------------------------------------------------------+
|                        ENDPOINT HOST (24/7 EDR Daemon Agent)                       |
|                                                                                   |
|  +---------------------+  +-------------------------+  +-----------------------+  |
|  | FileSystem Watcher  |  | Process & Socket Monitor|  | Network Port Scanner  |  |
|  | (/tmp, Downloads,   |  | (ps -ax, autostart,     |  | (socket TCP probes,   |  |
|  | ~/.ssh, lockfiles)  |  | network sockets)        |  | HTTP header audit)    |  |
|  +----------+----------+  +------------+------------+  +-----------+-----------+  |
|             |                          |                          |               |
|             +--------------------------+--------------------------+               |
|                                        v                                          |
|                 +-----------------------------------------------+                 |
|                 |    8 KVCH Security Detection Engines          |                 |
|                 +----------------------+------------------------+                 |
|                                        |                                          |
|                                        v (on anomaly / vulnerability)             |
|                 +-----------------------------------------------+                 |
|                 |     Standardized kvch.finding/v1 Envelope     |                 |
|                 +----------------------+------------------------+                 |
|                                        |                                          |
+----------------------------------------|------------------------------------------+
                                         | Real-Time WebSocket Stream (ws://.../api/ws)
                                         v
+-----------------------------------------------------------------------------------+
|                       KVCH CENTRAL CONTROL HUB (Web Dashboard)                    |
|  +---------------------+  +-------------------------+  +-----------------------+  |
|  |  WebSocket Gateway  |->|  Prisma Database Store  |->|  Real-Time UI Alert   |  |
|  |  (ws://.../api/ws)  |  |  (FindingEnvelope DB)   |  |  Dashboard / Stream   |  |
|  +---------------------+  +-------------------------+  +-----------------------+  |
+-----------------------------------------------------------------------------------+
```

### 5.1 Event Triggers
1. **FileSystem Events**:
   * Creation/modification in `/tmp` or `~/Downloads` triggers `malware-analyzer`.
   * Modification in `~/.ssh` or `~/.aws` triggers `credential-exposure-auditor`.
   * Lockfile edits (`package-lock.json`) trigger `supply-chain-auditor`.
2. **Process & Socket Events**:
   * New execution in `/tmp` triggers `threat-hunter-3000`.
   * Launch of crypto wallet process triggers `vpn-crypto-analyzer`.
3. **Network Events**:
   * New open TCP port delta triggers `attack-surface-scanner`.

### 5.2 Control Daemon Script (`kvch_edr_control.sh`)
```bash
./External/scripts/kvch_edr_control.sh start   # Start daemon background process
./External/scripts/kvch_edr_control.sh status  # Display running PID & status
./External/scripts/kvch_edr_control.sh logs    # Tail daemon real-time logs
./External/scripts/kvch_edr_control.sh stop    # Stop background agent
```

---

## 6. Part V: Web Platform Bridge, KVCH Judge & DB Engine

The Next.js web application (`web/`) hosts the server-side artifact intake pipeline, the KVCH Judge execution kernel, the `pg-boss` background worker, and the `/extensions` management UI.

```
web/
├── app/
│   ├── api/extensions/...       # Authenticated upload, evaluation, deployment APIs
│   └── extensions/...           # UI Dashboard for Extensions, Deployments, Runs & Findings
├── lib/
│   ├── extensions/              # Artifact intake, storage, & evaluation services
│   ├── judge/                   # Adapters (node, python), kernel execution, JSONL parser
│   └── queue/                   # pg-boss queue registration & job handlers
├── prisma/
│   └── schema.prisma            # PostgreSQL Database Schema
└── scripts/
    └── kvch-worker.ts           # Durable background worker process
```

### 6.1 Server-Side Execution & Hosted Runtime Contract
1. **Preflight Evaluation Protocol (`mode = evaluation`)**:
   * Web server launches extension command `commands.run` with environment variable `KVCH_EVALUATION=1` and `{}` on stdin.
   * **Passing Criteria**: Exit code MUST be `0` AND standard output MUST be completely empty.
   * If any stdout line is emitted or exit code is non-zero, evaluation FAILS and artifact is marked `evaluation_failed`.
2. **Normal Scheduled Run Protocol (`mode = run`)**:
   * Web server launches extension command `commands.run` with `KVCH_EVALUATION=0`.
   * Exit code `0` + Empty stdout $\rightarrow$ Status: `healthy`.
   * Exit code `0` + Valid JSONL lines $\rightarrow$ Status: `finding` (persists rows in `Finding` table).
   * Non-zero exit code or timeout $\rightarrow$ Status: `failed`.

### 6.2 Database Schema (Prisma PostgreSQL)

```prisma
enum ArtifactState {
  uploaded
  evaluating
  deployable
  evaluation_failed
  runtime_unsupported
}

enum EvaluationStatus {
  queued
  running
  passed
  failed
}

enum DeploymentStatus {
  active
  paused
  failed
}

enum RunStatus {
  queued
  running
  healthy
  finding
  failed
}

model Extension {
  id         String     @id @default(cuid())
  companyId  String
  manifestId String
  name       String
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  artifacts  Artifact[]

  @@unique([companyId, manifestId])
  @@index([companyId, createdAt])
}

model Artifact {
  id          String        @id @default(cuid())
  extensionId String
  companyId   String
  sha256      String
  storageKey  String
  size        Int
  manifest    Json
  adapterKey  String?
  state       ArtifactState @default(uploaded)
  createdAt   DateTime      @default(now())
  extension   Extension     @relation(fields: [extensionId], references: [id], onDelete: Restrict)
  evaluations Evaluation[]
  deployments Deployment[]
  runs        ScheduledExtensionRun[]
  findings    Finding[]

  @@unique([companyId, sha256])
  @@unique([storageKey])
  @@index([extensionId, createdAt])
}

model Evaluation {
  id             String           @id @default(cuid())
  artifactId     String
  adapterKey     String?
  adapterVersion String?
  status         EvaluationStatus @default(queued)
  startedAt      DateTime?
  finishedAt     DateTime?
  commandResults Json?
  stdout         String?
  stderr         String?
  createdAt      DateTime         @default(now())
  artifact       Artifact         @relation(fields: [artifactId], references: [id], onDelete: Restrict)

  @@index([artifactId, createdAt])
}

model Deployment {
  id         String           @id @default(cuid())
  artifactId String
  schedule   String
  status     DeploymentStatus @default(active)
  nextRunAt  DateTime?
  createdAt  DateTime         @default(now())
  updatedAt  DateTime         @updatedAt
  artifact   Artifact         @relation(fields: [artifactId], references: [id], onDelete: Restrict)
  runs       ScheduledExtensionRun[]

  @@index([artifactId, status])
  @@index([status, nextRunAt])
}

model ScheduledExtensionRun {
  id           String     @id @default(cuid())
  deploymentId String
  artifactId   String
  dueAt        DateTime
  startedAt    DateTime?
  finishedAt   DateTime?
  status       RunStatus  @default(queued)
  exitCode     Int?
  commandResults Json?
  stdout       String?
  stderr       String?
  createdAt    DateTime   @default(now())
  deployment   Deployment @relation(fields: [deploymentId], references: [id], onDelete: Restrict)
  artifact     Artifact   @relation(fields: [artifactId], references: [id], onDelete: Restrict)
  findings     Finding[]

  @@unique([deploymentId, dueAt])
  @@index([artifactId, createdAt])
}

model Finding {
  id         String                @id @default(cuid())
  runId      String
  artifactId String
  envelope   Json
  severity   String
  category   String
  title      String
  observedAt DateTime
  createdAt  DateTime              @default(now())
  run        ScheduledExtensionRun @relation(fields: [runId], references: [id], onDelete: Restrict)
  artifact   Artifact              @relation(fields: [artifactId], references: [id], onDelete: Restrict)

  @@index([artifactId, observedAt])
  @@index([runId])
}
```

---

## 7. Part VI: Verification & Operations Guide

### 7.1 Running Automated Unit & Integration Tests
```bash
# 1. Test @arko05roy/kvch-extension SDK & CLI
cd kvch-extension
npm run check
npm test

# 2. Test Web KVCH Judge Kernel & Fixtures
cd web
npm run test:judge
```

### 7.2 Running Background Worker Daemon
```bash
# In production / dev background:
cd web
npm run worker
```

---

## 8. Summary Matrix

| Subsystem | Responsibilities | Key Technologies / Libraries | Output / Artifact |
| :--- | :--- | :--- | :--- |
| **`@arko05roy/kvch-extension`** | Manifest validation, canonical ustar packaging, hash computation, zero-execution preflight inspection. | Node.js 22+, `yaml`, `cron-parser`, TypeScript. | Immutable `.kvch.tgz` file & SHA-256 preflight hash. |
| **Extensions 1–8** | Modular security scanning (Ports, VPN, Phishing, Processes, Malware, Credentials, Dependencies, Cookies/XSS). | Python 3, `socket`, `sqlite3`, `hashlib`, AST parsers. | Newline-delimited `kvch.finding/v1` JSON objects. |
| **`kvch-agent` EDR Daemon** | 24/7 endpoint filesystem/process/network monitoring, anomaly detection, WebSocket streaming. | Python 3, `watchdog`, WebSockets, launchd/systemd. | Real-time WebSocket findings to KVCH Web Control Hub. |
| **KVCH Judge Kernel** | Sandboxed workspace expansion (`tar.x`), process execution (`install->build->run`), JSONL parsing. | Next.js server-side, `tar`, `node:crypto`, `node:child_process`. | Auditable `Evaluation`, `ScheduledExtensionRun`, & `Finding` DB records. |
| **KVCH Control Hub UI** | Extension registry, upload intake, evaluation inspection, deployment pause/resume, findings viewer. | Next.js 15, TailwindCSS, Prisma, `pg-boss`. | Operational Dashboard at `/extensions`. |

---
**Copyright © 2026 KVCH Security Engineering Team.**
