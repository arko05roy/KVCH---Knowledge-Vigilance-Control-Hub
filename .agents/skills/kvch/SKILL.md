---
name: kvch
description: Operational guide and tool reference for the KVCH Judge Execution Kernel, 10 modular security engines, byte-deterministic .kvch.tgz extension packaging, and the 5-layer hardware attestation MCP server.
---

# KVCH Operational & Extension Development Skill

This skill provides operational workflows and commands for working with the **KVCH (Knowledge Vigilance Control Hub)** platform.

## 1. Five-Layer Hardware & Network Attestation

KVCH uses a 5-layer attestation probe to uniquely fingerprint the host environment:
- **Layer 1 (OS)**: Hardware UUID, kernel release, CPU model.
- **Layer 2 (Network)**: Default network interface, gateway IP, MAC digest.
- **Layer 3 (Transport)**: Active listening socket table hash (`netstat -an`).
- **Layer 4 (Presentation)**: OpenSSL/TLS version, crypto curve profiles.
- **Layer 5 (Memory)**: Physical RAM and memory page allocation profile.

### Test Attestation Probe via MCP
```bash
node -e 'import("./mcp-server/dist/fingerprint/signer.js").then(m => console.log(m.generateHostFingerprint()))'
```

---

## 2. Standalone Modular Security Extensions (10 Core Engines)

All 10 security scanning engines are packaged under `External/`:
1. `attack-surface-scanner` (Port 5432, SMB 445, HSTS)
2. `vpn-crypto-analyzer` (tun0 split-tunnel DNS leaks, crypto wallet process probes)
3. `phishing-hunter` (/etc/hosts hijacking, homograph detection)
4. `threat-hunter-3000` (Process tree auditor, C2 reverse shells, LaunchAgent plists)
5. `malware-analyzer` (Entropy analysis $H > 7.2$, Mach-O/ELF headers, YARA matching)
6. `credential-exposure-auditor` (Secret scraping in .env, clipboard address replacers)
7. `supply-chain-auditor` (Typosquatted packages, malicious postinstall hooks)
8. `cookie-xss-auditor` (DOM XSS sinks, HttpOnly/Secure cookie store audits)
9. `aegisdb-zerotrust` (AST database firewall, unpaginated mass dump interception)
10. `edgeguard-sentinel` (Cloudflare edge proxy probes, origin IP leak prevention)

---

## 3. Byte-Deterministic Extension Packaging

To package any extension deterministically with canonical sorting and normalized timestamps (`1970-01-01`):

```bash
cd kvch-extension
npx kvch-extension pack "../External/attack-surface-scanner" --out "../External/artifacts/attack-surface-scanner.kvch.tgz"
```

---

## 4. Multi-Tier Security Intelligence Reports

Reports generated from sandbox attack runs are archived in `/final reports/`:
- `sr_dev_report.md` / `.json`: Lead developer & SOC technical hotfix directives
- `intern_report.md` / `.json`: Guided incident triage & plain-English concepts
- `hr_report.md` / `.json`: Personnel attribution (Rohit Debnath, EMP-4029), DPDP Act 2023 mandates
- `management_report.md` / `.json`: FAIR financial loss distributions & ROSI (1,436% ROI)
- `sandbox_120min_attack_simulation_master_report.md`: Master 120-minute timeline across all 10 engines

---

## 5. Claude MCP Server Integration

Connect Claude Code or Claude Desktop via stdio:
```bash
claude mcp add kvch -- node /Users/ayush/Desktop/KVCH---Knowledge-Vigilance-Control-Hub/mcp-server/dist/index.js
```
