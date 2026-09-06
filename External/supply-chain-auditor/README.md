# Extension Supply-Chain & Integrity Auditor

Defensive Security Extension for KVCH: `supply-chain-auditor`.

Protects endpoints against silent supply-chain takeovers of browser utilities, such as campaigns where threat actors acquire trusted, high-reputation extensions (color pickers, weather monitors with millions of users) and push malicious backend updates.

## 🛡️ Defensive Auditing Capabilities

1. **Manifest Integrity & Provenance Tracking**
   - Audits `manifest.json` for suspicious `update_url` redirects away from the official Chrome Web Store or Edge Add-ons.
   - Detects Content Security Policy (CSP) degradation (e.g. adding `'unsafe-eval'` or dynamic external hosts).

2. **Dynamic & Remote Code Execution Detection**
   - Identifies dynamic script tag injection (`document.createElement('script')`).
   - Flags `eval()`, `new Function()`, and runtime execution of unverified remote strings.

3. **High-Entropy Obfuscation Detection**
   - Calculates mathematical Shannon entropy across script files.
   - Flags suspicious packing or encrypted blobs hidden inside benign utility code.

4. **Unauthorized Telemetry & C2 Beaconing**
   - Detects WebSockets, unverified fetch endpoints, or hardcoded IP beacons connecting to non-standard infrastructure.

## 🚀 Execution

```bash
# Audit installed browser extensions
python src/main.py

# Audit specific directory or extension source
python src/main.py --target /path/to/extension --out supply_chain_finding.json
```
