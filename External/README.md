# KVCH Security Extensions & 24/7 EDR Background Architecture

> For complete technical details, developer specifications, data collection sources, report schemas, and WebSocket integration instructions, see **[KVCH_EXTENSIONS_AND_EDR_ARCHITECTURE.md](./KVCH_EXTENSIONS_AND_EDR_ARCHITECTURE.md)**.

## Quick Summary

- **8 Extension Engines**:
  1. `attack-surface-scanner` (Port scanning & HTTP security headers)
  2. `vpn-crypto-analyzer` (VPN tunnel & DNS leak analyzer)
  3. `phishing-hunter` (Phishing domain redirects & host overrides)
  4. `threat-hunter-3000` (Process tree & autostart LaunchAgents monitor)
  5. `malware-analyzer` (Binary hashing, Shannon entropy & headers)
  6. `credential-exposure-auditor` (Mnemonics, private keys, Permit2 drainers)
  7. `supply-chain-auditor` (Package lockfile AST & typosquatting auditor)
  8. `cookie-xss-auditor` (Cookie HttpOnly/Secure flags, sub-domain tossing, DOM XSS sinks & JWT theft)

- **24/7 EDR Daemon Control**:
  ```bash
  # Start 24/7 background agent
  ./External/scripts/kvch_edr_control.sh start

  # Check status
  ./External/scripts/kvch_edr_control.sh status

  # View live logs
  ./External/scripts/kvch_edr_control.sh logs

  # Stop daemon
  ./External/scripts/kvch_edr_control.sh stop
  ```

- **WebSocket Integration Endpoint**: `ws://localhost:3000/api/ws` emitting stringified `kvch.finding/v1` envelope JSON objects in real time to the Web Control Hub dashboard.