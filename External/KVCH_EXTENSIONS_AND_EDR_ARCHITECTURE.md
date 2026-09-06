# KVCH Security System: 8 Extension Engines, 24/7 EDR Daemon & WebSocket Integration Guide

> **Developer Technical Architecture Specification**  
> This master document provides a comprehensive technical overview of all 8 KVCH security scanning extensions, their data collection sources, report schemas, 24/7 EDR background daemon architecture, and real-time WebSocket telemetry stream integration for dashboard developers.

---

## 1. System Overview

KVCH (Knowledge Vigilance Control Hub) operates a dual-layer security architecture:
1. **Modular Extension Engines (Extensions 1–8)**: Specialized security tools compiled into standard `.kvch.tgz` packages via `@arko05roy/kvch-extension` and generating standardized `kvch.finding/v1` report envelopes.
2. **Always-On EDR Background Agent (`kvch-agent`)**: A continuous 24/7 background process (`External/edr_daemon/`) that monitors filesystem changes, process trees, and network sockets, executing detection passes asynchronously and streaming real-time security findings over WebSockets to the KVCH Web Control Hub.

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
|                 |  (Ext 1-8: Sockets, Entropy, Cookie SQLite,   |                 |
|                 |   AST, Regex Deobfuscator, Lockfile Parsers)  |                 |
|                 +----------------------+------------------------+                 |
|                                        |                                          |
|                                        v (on anomaly / vulnerability)             |
|                 +-----------------------------------------------+                 |
|                 |     Standardized kvch.finding/v1 Envelope     |                 |
|                 +----------------------+------------------------+                 |
|                                        |                                          |
+----------------------------------------|------------------------------------------+
                                         | Real-Time WebSocket (ws:// or wss://)
                                         v
+-----------------------------------------------------------------------------------+
|                       KVCH CENTRAL CONTROL HUB (Web Dashboard)                    |
|                                                                                   |
|  +---------------------+  +-------------------------+  +-----------------------+  |
|  |  WebSocket Gateway  |->|  Prisma Database Store  |->|  Real-Time UI Alert   |  |
|  |  (ws://.../api/ws)  |  |  (FindingEnvelope DB)   |  |  Dashboard / Stream   |  |
|  +---------------------+  +-------------------------+  +-----------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Comprehensive Breakdown of All 8 Extensions

### Extension 1: Attack Surface Scanner (`attack-surface-scanner`)
- **CLI Entrypoint**: `External/extensions/1_attack_surface_scanner.py`
- **Core Purpose**: Scans exposed local and LAN network attack surfaces, open ports, and active web HTTP services.
- **Data Sources**:
  - Local network interfaces (`socket.gethostbyname`, `netstat`/socket listings).
  - Open TCP listening sockets (`22`, `80`, `443`, `3306`, `5432`, `8080`, `27017`).
  - Active HTTP/HTTPS service headers (`Server`, `X-Powered-By`, `Strict-Transport-Security`, `Content-Security-Policy`).
- **Tools & Libraries Used**: Native Python `socket`, `ssl`, `concurrent.futures.ThreadPoolExecutor`, `requests`, `whois`, `dns.resolver`.
- **Detection Heuristics**: Unencrypted HTTP endpoints, missing HSTS headers, database ports exposed to LAN, high response latency.

---

### Extension 2: VPN & Crypto Analyzer (`vpn-crypto-analyzer`)
- **CLI Entrypoint**: `External/extensions/2_vpn_crypto_analyzer.py`
- **Core Purpose**: Audits active VPN tunnel security, DNS leak vulnerabilities, and browser crypto wallet process hooks.
- **Data Sources**:
  - System network interfaces (`tun0`, `tap0`, `wg0`, `ppp0`).
  - System DNS configuration (`/etc/resolv.conf`).
  - Active process table (`ps -ax`) searching for active wallet processes (MetaMask, Phantom, Ledger Live, Exodus, Coinbase Wallet).
- **Tools & Libraries Used**: Python `subprocess`, `re`, `pathlib`, native network interface socket queries.
- **Detection Heuristics**: Split-tunneling DNS leakage, unencrypted DNS resolvers, exposed browser wallet debug ports.

---

### Extension 3: Phishing Hunter (`phishing-hunter`)
- **CLI Entrypoint**: `External/extensions/3_phishing_hunter.py`
- **Core Purpose**: Detects phishing domain redirects, malicious browser extensions, and DNS/hosts tampering.
- **Data Sources**:
  - System hosts file (`/etc/hosts`).
  - Browser profile directories (Chrome, Brave, Edge, Firefox) inspecting installed extension IDs and manifests.
  - Active socket connections matching known phishing IOC domains.
- **Tools & Libraries Used**: `json`, `pathlib`, `re`, `urllib.parse`.
- **Detection Heuristics**: Local hosts overrides redirecting banking/crypto domains to loopback/remote IPs, unverified third-party extension `update_url` targets.

---

### Extension 4: Threat Hunter 3000 (`threat-hunter-3000`)
- **CLI Entrypoint**: `External/extensions/4_threat_hunter_3000.py`
- **Core Purpose**: Monitors system process trees, autostart persistence mechanisms, and unauthorized background daemons.
- **Data Sources**:
  - Process table tree structure (`ps -ax -o pid,ppid,user,command`).
  - System autostart paths (`~/Library/LaunchAgents`, `/Library/LaunchDaemons`, `/etc/launchd.conf`, `/etc/cron.*`).
  - `/var/log` system logs and user execution histories.
- **Tools & Libraries Used**: `os`, `sys`, `subprocess`, `signal`, `pathlib`.
- **Detection Heuristics**: Hidden/orphaned processes running out of `/tmp`, unauthorized LaunchAgents executing obfuscated shell scripts.

---

### Extension 5: Malware Analyzer (`malware-analyzer`)
- **CLI Entrypoint**: `External/extensions/5_malware_analyzer.py`
- **Core Purpose**: Analyzes suspicious binaries, computes cryptographic file hashes, measures entropy, and parses executable headers.
- **Data Sources**:
  - Temporary and download directories (`/tmp`, `~/Downloads`, user temp paths).
  - Binary file headers (Mach-O, ELF, PE magic bytes).
- **Tools & Libraries Used**: `hashlib` (SHA-256, MD5), `math` (Shannon entropy calculation), `struct`.
- **Detection Heuristics**: High binary Shannon entropy (> 7.2) indicating packed/encrypted payloads, executable permission flags (`chmod +x`) on scripts in `/tmp`.

---

### Extension 6: Credential Exposure Auditor (`credential-exposure-auditor`)
- **CLI Entrypoint**: `External/extensions/6_credential_exposure_auditor.py`
- **Core Purpose**: Defensive auditor for credential exposure, multi-chain clipboard clippers, and Web3 drainer signatures.
- **Data Sources**:
  - Browser extension content scripts, manifest files, `.env` files, `~/.ssh/id_*`, `~/.aws/credentials`.
  - System clipboard API hooks and web provider objects (`window.ethereum`, `window.solana`).
- **Tools & Libraries Used**: `re`, `base64`, `Deobfuscator` engine (hex escape `\x65`, unicode `\u0065`, `String.fromCharCode`, computed property normalization `window["ethereum"] -> window.ethereum`).
- **Detection Heuristics**: BIP39 12/24 word mnemonics, raw EVM/BTC/SOL private keys, Permit2/Seaport signature phishing, clipboard `writeText` overriding crypto addresses.

---

### Extension 7: Supply Chain Auditor (`supply-chain-auditor`)
- **CLI Entrypoint**: `External/extensions/7_supply_chain_auditor.py`
- **Core Purpose**: Audits project dependency trees for malicious package injection, typosquatting, and unpinned repository URLs.
- **Data Sources**:
  - Project lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `Pipfile.lock`, `requirements.txt`).
  - Package manifest files (`package.json`, `setup.py`, `pyproject.toml`).
- **Tools & Libraries Used**: `json`, `yaml`, `re`, AST lockfile tree parser.
- **Detection Heuristics**: Typosquatting distance on popular packages (e.g. `reqeusts`, `cross-env-payload`), unpinned HTTP package URLs, lifecycle script hooks (`postinstall` executing curl/eval).

---

### Extension 8: Cookie Security, DOM XSS & Session Hijacking Auditor (`cookie-xss-auditor`)
- **CLI Entrypoint**: `External/extensions/8_cookie_xss_analyzer.py`
- **Core Purpose**: Audits browser cookie posture, sub-domain cookie tossing, DOM-based XSS sinks, and unencrypted session token theft.
- **Data Sources**:
  - SQLite3 cookie databases across installed browser profiles (Chrome, Brave, Edge, Firefox at `~/Library/Application Support/.../Default/Cookies`).
  - Browser extension content scripts and web application JavaScript files.
  - Client web storage (`localStorage` / `sessionStorage`).
- **Tools & Libraries Used**: `sqlite3`, `re`, `json`, `pathlib`.
- **Detection Heuristics**:
  1. **Cookie Posture**: Missing `HttpOnly` flag on sensitive session cookies (exposing cookie to JS theft), missing `Secure` flag (sending over plaintext HTTP).
  2. **Cookie Tossing**: Wildcard domain scoping (`Domain=.domain.com`) enabling sub-domain cookie injection.
  3. **DOM XSS Sinks**: Dangerous DOM assignment sinks (`.innerHTML =`, `document.write()`, `eval(location.hash)`, `setTimeout(string)`).
  4. **Session Theft**: Unencrypted JWT tokens in `localStorage`, `document.cookie` exfiltration patterns over `fetch`/`XMLHttpRequest`.

---

## 3. Standardized Report JSON Envelope Specification (`kvch.finding/v1`)

All 8 extensions format findings into the standardized `kvch.finding/v1` envelope schema:

```json
{
  "schema_version": "kvch.finding/v1",
  "observed_at": "2026-09-06T15:02:23Z",
  "severity": "CRITICAL",
  "category": "cookie_xss_analyzer",
  "title": "Cookie Security Posture, DOM XSS & Session Theft Finding",
  "summary": "Audited browser cookie security and client-side DOM script sinks on MacBook-Air.lan. Detected 125 security findings across cookies, XSS sinks, and session tokens.",
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

---

## 4. 24/7 EDR Background Daemon Architecture

The background daemon agent (`External/edr_daemon/`) runs continuously on the system without requiring manual CLI invocation:

- **Entrypoint**: `External/edr_daemon/agent.py`
- **Control Script**: `External/scripts/kvch_edr_control.sh`

### Background Event Monitors (`event_monitors.py`):
1. **`FileSystemWatcher`**: Asynchronously monitors sensitive paths (`/tmp`, `Downloads`, `~/.ssh`, `~/.aws`, project lockfiles). On file creation or edit, automatically runs Extensions 5, 6, 7, and 8.
2. **`ProcessAndSocketMonitor`**: Polls process table count and socket changes every 10 seconds. On process tree deltas, automatically runs Extensions 2, 3, and 4.
3. **`NetworkSurfaceScanner`**: Runs periodic network surface scans (Extension 1) every 60 seconds.

### Daemon Control Commands:
```bash
# Start background daemon
./External/scripts/kvch_edr_control.sh start

# Check status
./External/scripts/kvch_edr_control.sh status

# View live daemon logs
./External/scripts/kvch_edr_control.sh logs

# Stop background daemon
./External/scripts/kvch_edr_control.sh stop
```

---

## 5. Developer Guide: WebSocket & Dashboard Integration

This section is specifically for the AI / Web Developer building the central KVCH Control Hub dashboard UI:

### WebSocket Endpoint Specification
- **URL**: `ws://<SERVER_HOST>:3000/api/ws` (configurable via `KVCH_WS_URL`).
- **Protocol**: Standard WebSocket (RFC 6455).
- **Handshake Header**: Includes `User-Agent: KVCH-EDR-Agent/1.0`.

### Message Telemetry Stream
Whenever the 24/7 EDR agent detects an anomaly or vulnerability, it pushes a text frame containing the stringified JSON `kvch.finding/v1` envelope over the WebSocket connection.

### How to Implement Dashboard Integration:

1. **Start the WebSocket Gateway Server**:
   Run the Node WebSocket server in the `web` workspace:
   ```bash
   npm run ws:server
   ```

2. **Ingest WebSocket Findings in Backend / API**:
   ```typescript
   // Example WebSocket Client listener in Node/Next.js or React
   const ws = new WebSocket("ws://localhost:3000/api/ws");

   ws.onmessage = (event) => {
     const envelope = JSON.parse(event.data);
     if (envelope.schema_version === "kvch.finding/v1") {
       console.log(`[ALERT ${envelope.severity}] ${envelope.title}`);
       // 1. Store in Prisma database
       // 2. Push live update to React UI state
     }
   };
   ```

3. **Database Schema Storage**:
   Persist incoming envelopes into the Prisma `FindingEnvelope` table matching `severity`, `category`, `title`, `summary`, `resource`, `evidence`, and `recommended_actions`.

4. **Frontend UI Rendering**:
   - Render real-time alert cards color-coded by severity: `CRITICAL` (Red), `HIGH` (Orange), `MEDIUM` (Yellow), `LOW` (Blue).
   - Display recommended remediation actions and evidence lists.
