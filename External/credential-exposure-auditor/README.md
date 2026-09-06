# Digital Asset & Credential Exposure Auditor

Defensive Security Extension for KVCH: `credential-exposure-auditor`.

Protects endpoints and users by defensively inspecting installed browser extensions and local script assets for unauthorized credential scraping, clipboard tampering, and anomalous permission requests.

## 🛡️ Defensive Auditing Capabilities

1. **Credential & Sensitive Input Protection**
   - Scans code assets for patterns attempting to harvest mnemonic seed phrases, private keys, or API tokens.
   - Flags unauthorized listeners attached to password inputs or crypto wallet extension interfaces.

2. **Clipboard Tampering Heuristics**
   - Detects suspicious write/read overrides to `navigator.clipboard` or `document.execCommand('copy')`.
   - Identifies address-substitution logic designed to manipulate digital asset recipient addresses during copy-paste operations.

3. **Web3 Provider & Wallet Security**
   - Verifies whether scripts attempt unauthorized injection or interception of `window.ethereum`, `window.solana`, or related wallet providers.

4. **Least-Privilege Permission Auditing**
   - Cross-references extension metadata (e.g. PDF tools, OCR utilities, color pickers) against requested permissions (`clipboardRead`, `clipboardWrite`, `<all_urls>`, `webRequestBlocking`).

## 🚀 Execution

```bash
# Audit local browser profiles (Chrome, Edge, Brave)
python src/main.py

# Audit a specific directory or unpacked extension folder
python src/main.py --target /path/to/extension --out audit_finding.json
```
