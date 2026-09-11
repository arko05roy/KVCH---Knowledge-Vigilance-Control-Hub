# Cyber Intern / Junior Analyst Triage Walkthrough
**Incident ID**: INC-2026-8891  
**Target Category**: Supply Chain Poisoning & Reverse Shell  
**Role Scope**: Junior Security Triage & Educational Walkthrough  

---

## 1. Educational Overview
This report provides a step-by-step triage guide for Incident #INC-2026-8891. A malicious package (`@kvch-internal/crypto-utils`) was accidentally installed during a build step. Its postinstall script launched a background reverse shell back to an attacker's server (`185.220.101.5:443`).

## 2. Key Cyber Concepts for Junior Analysts
- **Typosquatting / Package Confusion**: Attackers publish packages with names closely matching legitimate internal libraries.
- **Reverse Shell**: Unlike standard inbound connections, a reverse shell originates from inside the network outward to bypass naive ingress firewalls.
- **Binary & Script Hashing**: Using SHA-256 signatures to match malware against YARA rule databases.

---

## 3. Step-by-Step Triage Checklist

```markdown
- [ ] 1. Identify suspicious Node processes using `ps aux | grep node`
- [ ] 2. Match active sockets to process IDs using `lsof -i :443` or `ss -tupn`
- [ ] 3. Extract SHA-256 hash of suspicious JS files and query threat feeds
- [ ] 4. Check `package-lock.json` to verify resolved tarball download URLs
```

## 4. Attack Lifecycle & MITRE ATT&CK Mapping
1. **Initial Access**: `T1195.001` (Supply Chain Compromise) via npm dependency injection.
2. **Execution**: `T1059.001` (JavaScript / Node.js Runtime execution).
3. **Exfiltration**: `T1041` (Exfiltration over C2 TCP channel `185.220.101.5:443`).

## 5. Verification Commands for Analysts
```bash
# Verify process PID & parent hierarchy
pstree -p 14209

# Inspect open network file descriptors
lsof -p 14209 -i

# Compute hash of suspicious payload
shasum -a 256 /app/node_modules/@kvch-internal/crypto-utils/dist/telemetry_worker.js
```
