import type { RoleSecurityReport } from "./ai/report-generator";

export const DEMO_REPORTS: Record<"srDev" | "intern" | "hr" | "management", RoleSecurityReport> = {
  "srDev": {
    "role": "sr-dev",
    "title": "CRITICAL: 120-Min Sandbox Multi-Vector Breach Simulation (Incident #INC-2026-8891)",
    "summary": "Forensic post-mortem of a simulated 2-hour advanced persistent threat (APT) campaign executed in the isolated sandbox environment across all 10 KVCH modular extensions. The attack chain initiated with perimeter port reconnaissance on 0.0.0.0:5432 and origin IP exposure via EdgeGuard Sentinel, leveraged a typosquatted npm package (@kvch-internal/crypto-utils@1.4.2) to drop an obfuscated high-entropy binary (/tmp/.system_daemon, H=7.942), established an outbound reverse TLS shell to C2 (185.220.101.5:443, PID 14209), extracted admin JWT tokens via DOM XSS, clipped crypto wallet addresses, and attempted an unpaginated mass database exfiltration before being neutralized by AegisDB Zero-Trust AST socket filters.",
    "metrics": {
      "likelihoodScore": 96,
      "businessImpactScore": 92,
      "financialExposure": {
        "min": "₹15,00,000",
        "mostLikely": "₹48,00,000",
        "max": "₹1,20,00,000",
        "eal": "₹38,40,000"
      },
      "riskTrend": "Increasing"
    },
    "keyFindings": [
      "Perimeter: attack-surface-scanner & edgeguard-sentinel flagged unauthenticated PostgreSQL (0.0.0.0:5432) and origin IP 10.0.4.15 leak.",
      "Infiltration: phishing-hunter detected /etc/hosts redirect to 185.220.101.5; supply-chain-auditor flagged typosquatted package @kvch-internal/crypto-utils@1.4.2 with postinstall curl|sh payload.",
      "Execution & Persistence: malware-analyzer flagged /tmp/.system_daemon (H=7.942, YARA: MALW_JS_REVERSE_SHELL); threat-hunter-3000 detected PID 14209 reverse shell and LaunchAgent persistence plist.",
      "Credential & Exfil: cookie-xss-auditor caught DOM XSS admin JWT theft; credential-exposure-auditor detected leaked AWS/Stripe keys & clipboard clipper; vpn-crypto-analyzer flagged split-tunnel DNS leaks; aegisdb-zerotrust intercepted unpaginated SELECT * mass exfiltration."
    ],
    "businessImpact": {
      "operational": "Production database locked 14 worker threads during exfiltration attempt; 340% query latency spike before automated socket termination.",
      "financial": "Potential financial loss exposure of ₹48,00,000 in regulatory fines and incident recovery if uncontained.",
      "compliance": "Severe deficiencies identified across ISO/IEC 27001 (A.8.28, A.12.6.1, A.13.1.1), NIST CSF (PR.IP-1, DE.CM-1), and SEBI CSCRF Section 4.",
      "reputational": "Immediate exposure risk of customer session hijacking and credential drainer execution."
    },
    "aiInsights": [
      "Correlated MITRE ATT&CK Techniques: T1190 (Exploit Public-Facing App), T1195.001 (Supply Chain Compromise), T1059.001 (JavaScript Execution), T1071.001 (Web Protocols C2), T1053.001 (LaunchAgent Persistence), T1005 (Data from Local System), T1041 (Exfiltration Over C2).",
      "The reverse shell disguised traffic on TCP port 443 with TLS wrapper; deep packet inspection confirmed non-HTTP handshake entropy.",
      "AegisDB Zero-Trust synthetic payload injection successfully neutralized database socket FD 42 before data crossed external gateway."
    ],
    "recommendedActions": [
      {
        "action": "Terminate malicious process PID 14209 and deploy nftables egress block on 185.220.101.5",
        "riskReductionPercent": 98,
        "estimatedCost": "₹0 (Immediate Command)",
        "estimatedEffort": "2 minutes",
        "priority": "HIGH",
        "timeToImplement": "Immediate",
        "rosi": "Infinite (Zero cost, 98% risk reduction)",
        "type": "Quick Win"
      },
      {
        "action": "Purge /tmp/.system_daemon, remove ~/Library/LaunchAgents/com.apple.sync.plist, and rollback @kvch-internal/crypto-utils to 1.4.1",
        "riskReductionPercent": 92,
        "estimatedCost": "₹0",
        "estimatedEffort": "10 minutes",
        "priority": "HIGH",
        "timeToImplement": "Within 15 minutes",
        "rosi": "Infinite",
        "type": "Quick Win"
      },
      {
        "action": "Bind PostgreSQL to 127.0.0.1, enforce AegisDB AST query pagination limit (MAX 500 rows), and sanitize location.hash DOM sinks with DOMPurify",
        "riskReductionPercent": 88,
        "estimatedCost": "₹0 (Code Configuration)",
        "estimatedEffort": "25 minutes",
        "priority": "HIGH",
        "timeToImplement": "Within 1 hour",
        "rosi": "Infinite",
        "type": "High ROI Action"
      }
    ],
    "investmentOptimization": "Execute zero-cost technical remediation immediately (process termination, firewall rule, dependency pinning, AST pagination enforcement).",
    "complianceMappings": [
      {
        "framework": "ISO/IEC 27001",
        "controlId": "A.8.28",
        "status": "Deficient",
        "impactDescription": "Secure coding rules and third-party dependency review validation"
      },
      {
        "framework": "ISO/IEC 27001",
        "controlId": "A.12.6.1",
        "status": "Deficient",
        "impactDescription": "Technical vulnerability management and unauthorized listening port isolation"
      },
      {
        "framework": "NIST CSF",
        "controlId": "PR.IP-1",
        "status": "Deficient",
        "impactDescription": "Baseline network perimeter and host configuration control"
      },
      {
        "framework": "SEBI CSCRF",
        "controlId": "CSCRF-Sec-4.1",
        "status": "Deficient",
        "impactDescription": "Database isolation and outbound C2 egress filtering"
      }
    ],
    "scenarios": {
      "scenarioA_NoAction": {
        "residualRisk": "Critical (Likelihood 96%, Recurrence 100%)",
        "financialExposure": "₹1,20,00,000 Maximum Loss Exposure",
        "complianceImpact": "Mandatory breach investigation under DPDP Act 2023 Sec 8 and regulatory sanctions"
      },
      "scenarioB_Remediated": {
        "residualRisk": "Minimal (Likelihood < 2%)",
        "financialExposure": "₹0 Residual Risk",
        "complianceImpact": "Full technical and regulatory compliance verified",
        "expectedLossReduction": "98% reduction in Expected Annual Loss"
      }
    },
    "finalVerdict": "CRITICAL MULTI-VECTOR BREACH CONTAINED: Terminate PID 14209, drop C2 IP in nftables, remove persistence plist, pin verified package version, and enforce AegisDB AST query limits.",
    "keyInsights": [
      "120-minute sandbox run proved multi-stage attack chaining across all 10 extension detection domains",
      "C2 tunnel disguised on port 443 with TLS wrapper; neutralized by threat-hunter-3000 & AegisDB socket termination",
      "Zero-cost technical remediation eliminates 98% of residual risk within 15 minutes"
    ],
    "actionItems": [
      "sudo kill -9 14209",
      "sudo nft add rule inet filter output ip daddr 185.220.101.5 drop",
      "rm -f /tmp/.system_daemon ~/Library/LaunchAgents/com.apple.sync.plist",
      "Update postgresql.conf: listen_addresses = '127.0.0.1'",
      "Revert package.json: @kvch-internal/crypto-utils to 1.4.1",
      "Deploy DOMPurify.sanitize() on location.hash query parameters"
    ],
    "roleSpecificDetail": `### 120-MINUTE SANDBOX ATTACK FORENSIC STACK TRACE

#### 1. Attack Progression Across 10 Modular Extensions
- **T+05m (attack-surface-scanner)**: Unbound database socket listening on \`0.0.0.0:5432\`.
- **T+18m (edgeguard-sentinel)**: Origin IPv4 \`10.0.4.15\` leaked via \`cf-connecting-ip\` header mismatch.
- **T+29m (phishing-hunter)**: Rogue \`/etc/hosts\` entry mapping \`auth.kvch.internal\` to \`185.220.101.5\`.
- **T+38m (supply-chain-auditor)**: Typosquatted package \`@kvch-internal/crypto-utils@1.4.2\` injected via PR #4.
- **T+54m (malware-analyzer)**: High-entropy payload \`/tmp/.system_daemon\` ($H=7.942$) matched YARA \`MALW_JS_REVERSE_SHELL\`.
- **T+67m (threat-hunter-3000)**: Outbound reverse shell (PID 14209) established to \`185.220.101.5:443\`.
- **T+72m (threat-hunter-3000)**: Persistence plist \`~/Library/LaunchAgents/com.apple.sync.plist\` established.
- **T+82m (cookie-xss-auditor)**: DOM XSS vulnerability triggered via \`location.hash\` extracting admin session JWT.
- **T+91m (credential-exposure-auditor)**: Leaked AWS & Stripe API keys; clipboard address \`0x71C...\` replaced by clipper.
- **T+102m (vpn-crypto-analyzer)**: Split-tunnel DNS leak on \`tun0\` bypassing WireGuard tunnel to foreign resolver.
- **T+111m (aegisdb-zerotrust)**: Unpaginated \`SELECT * FROM users, salaries, private_keys\` intercepted & socket killed!

#### 2. Process Tree & Socket Binding Telemetry
\`\`\`bash
$ netstat -tulpn | grep 5432
tcp        0      0 0.0.0.0:5432            0.0.0.0:*               LISTEN      14209/node
$ ps -ef | grep 14209
node  14209  1044  88.4  4.2  1420912  345012 ? Sl 17:07 24:15 /tmp/.system_daemon --c2=185.220.101.5:443
\`\`\`

#### 3. Code & Configuration Patch Diffs
\`\`\`diff
--- a/etc/postgresql/15/main/postgresql.conf
+++ b/etc/postgresql/15/main/postgresql.conf
-listen_addresses = '*'
+listen_addresses = '127.0.0.1, 10.0.4.15'

--- a/web/package.json
+++ b/web/package.json
- "@kvch-internal/crypto-utils": "^1.4.2",
+ "@kvch-internal/crypto-utils": "1.4.1",

--- a/web/components/dashboard-shell.tsx
+++ b/web/components/dashboard-shell.tsx
- const token = window.location.hash;
- document.getElementById("auth-view").innerHTML = token;
+ import DOMPurify from "dompurify";
+ const token = DOMPurify.sanitize(window.location.hash.replace("#", ""));
\`\`\`

#### 4. Automated SOAR Containment Script
\`\`\`bash
#!/usr/bin/env bash
# 1. Kill malicious worker process
sudo kill -9 14209

# 2. Block C2 IP ingress/egress via nftables
sudo nft add table inet kvch_quarantine
sudo nft add chain inet kvch_quarantine output { type filter hook output priority 0 \\; }
sudo nft add rule inet kvch_quarantine output ip daddr 185.220.101.5 drop

# 3. Purge persistence artifacts
sudo rm -f /tmp/.system_daemon ~/Library/LaunchAgents/com.apple.sync.plist

# 4. Enforce localhost database binding
sudo systemctl restart postgresql
\`\`\``,
    "generatedAt": "2026-09-13T01:45:00.000Z"
  },
  "intern": {
    "role": "intern",
    "title": "Guided Triage & Educational Forensic Walkthrough: 120-Min Sandbox Breach Simulation",
    "summary": "Step-by-step educational incident response guide and triage walkthrough for junior security analysts based on the 120-minute sandbox attack campaign (#INC-2026-8891). This guide explains each attack vector in plain English, teaches how to correlate telemetry logs across all 10 modular extensions, and provides a structured checklist to verify Indicators of Compromise (IOCs) before escalating to senior leads.",
    "metrics": {
      "likelihoodScore": 96,
      "businessImpactScore": 92,
      "financialExposure": {
        "min": "₹15,00,000",
        "mostLikely": "₹48,00,000",
        "max": "₹1,20,00,000",
        "eal": "₹38,40,000"
      },
      "riskTrend": "Increasing"
    },
    "keyFindings": [
      "Concept 1: Attack Surface Reconnaissance — Why exposing database ports on 0.0.0.0 is dangerous.",
      "Concept 2: Supply Chain Poisoning — How an attacker can hide malicious code in package postinstall hooks.",
      "Concept 3: Shannon Entropy — Why entropy scores above 7.2 indicate encrypted or packed malware.",
      "Concept 4: Reverse TCP Shells — How outbound connections on port 443 deceive simple inbound firewall rules.",
      "Concept 5: Zero-Trust AST Parsing — How database firewalls parse abstract syntax trees to stop mass data theft."
    ],
    "businessImpact": {
      "operational": "Educational walkthrough: Learn how multi-stage attack chains navigate enterprise defenses.",
      "financial": "Demonstrates why rapid analyst triage directly prevents ₹48L to ₹1.2Cr in breach liability.",
      "compliance": "Teaches evidence handling and chain-of-custody documentation under CIS Controls v8.",
      "reputational": "Builds team capability in spotting early-stage recon before data exfiltration occurs."
    },
    "aiInsights": [
      "Key Learning Point: Always cross-reference `package-lock.json` hash integrity when dependencies are updated in pull requests.",
      "Triage Tip: A process connecting outbound on port 443 that does not complete a standard TLS HTTP/2 or HTTP/1.1 handshake is highly suspicious."
    ],
    "recommendedActions": [
      {
        "action": "Complete guided verification checklist: Confirm PID 14209, C2 IP 185.220.101.5, and binary hash in sandbox",
        "riskReductionPercent": 60,
        "estimatedCost": "₹0 (Analyst Training)",
        "estimatedEffort": "15 minutes",
        "priority": "HIGH",
        "timeToImplement": "Immediate",
        "rosi": "N/A (Triage Training)",
        "type": "Quick Win"
      },
      {
        "action": "Document MITRE ATT&CK technique IDs (T1190, T1195.001, T1059.001, T1071.001) in internal incident ticket",
        "riskReductionPercent": 40,
        "estimatedCost": "₹0",
        "estimatedEffort": "10 minutes",
        "priority": "MEDIUM",
        "timeToImplement": "Today",
        "rosi": "N/A",
        "type": "Quick Win"
      }
    ],
    "investmentOptimization": "Guided triage protocol builds Junior SOC operational capabilities and speeds up MTTT (Mean Time To Triage).",
    "complianceMappings": [
      {
        "framework": "CIS Controls",
        "controlId": "CIS-2.1",
        "status": "Partial",
        "impactDescription": "Software asset inventory and dependency verification procedures"
      },
      {
        "framework": "NIST CSF",
        "controlId": "DE.CM-1",
        "status": "Partial",
        "impactDescription": "Network perimeter and process anomaly detection training"
      }
    ],
    "scenarios": {
      "scenarioA_NoAction": {
        "residualRisk": "High (Unresolved learner query & missed IOC correlation)",
        "financialExposure": "N/A",
        "complianceImpact": "Incomplete forensic triage log"
      },
      "scenarioB_Remediated": {
        "residualRisk": "Minimal (Triage completed & validated by Senior Lead)",
        "financialExposure": "₹0 Residual Risk",
        "complianceImpact": "Forensic triage log approved and archived",
        "expectedLossReduction": "100% triage task completion"
      }
    },
    "finalVerdict": "Execute guided triage checklist, correlate all 10 extension alerts, verify SHA-256 hash match, and submit documented findings to Senior SOC Lead.",
    "keyInsights": [
      "Supply chain backdoors execute automatically during `npm install` postinstall scripts",
      "Entropy checks ($H > 7.2$) rapidly identify packed reverse shells without needing decompilation",
      "Correlating network sockets with process IDs (`lsof -i :443`) confirms active command-and-control channels"
    ],
    "actionItems": [
      "Run `ps aux | grep node` and identify foreign IP in socket connection",
      "Inspect `/tmp/.system_daemon` hash against YARA rule database",
      "Check `package.json` for unpinned external dependency versions",
      "Submit verified incident worksheet to Senior Developer"
    ],
    "roleSpecificDetail": `### JUNIOR ANALYST GUIDED TRIAGE PLAYBOOK

#### 1. The 120-Minute Attack Chain Simplified
\`\`\`
[1. Port Probe]  ──>  [2. Typosquat npm]  ──>  [3. Dropped Binary]  ──>  [4. Reverse Shell]  ──>  [5. AST Exfil Attempt]
(Port 5432 Open)       (@crypto-utils@1.4.2)     (/tmp/.system_daemon)     (PID 14209 to C2)        (Intercepted by AegisDB)
\`\`\`

#### 2. Junior Analyst Verification Checklist
- [ ] **Step 1: Check Active Listeners**
  Run \`ss -tulpn | grep 5432\` to verify if the port is bound to \`0.0.0.0\` (Dangerous) or \`127.0.0.1\` (Safe).
- [ ] **Step 2: Inspect Suspicious Process**
  Run \`ps aux | grep 14209\` to view command-line arguments and find out where the script is located on disk.
- [ ] **Step 3: Calculate File Entropy**
  Run \`python3 -c "import math; data=open('/tmp/.system_daemon','rb').read(); ..."\` to calculate entropy ($H > 7.2$ = packed).
- [ ] **Step 4: Check Autostart Persistence**
  Inspect \`~/Library/LaunchAgents/\` for newly generated \`.plist\` files created within the last 2 hours.
- [ ] **Step 5: Verify Database Socket Logs**
  Inspect AegisDB logs for queries containing \`SELECT *\` without a \`LIMIT\` clause.

#### 3. MITRE ATT&CK Quick Reference Table
| Technique ID | Name | Extension Catching It | What to Look For |
| :--- | :--- | :--- | :--- |
| **T1190** | Exploit Public App | \`attack-surface-scanner\` | Unbound TCP listeners on external interfaces |
| **T1195.001** | Supply Chain Compromise | \`supply-chain-auditor\` | Unverified postinstall scripts in npm/pip packages |
| **T1059.001** | JavaScript Execution | \`threat-hunter-3000\` | Node.js process spawning \`/bin/sh\` or \`cmd.exe\` |
| **T1071.001** | Web Protocols C2 | \`threat-hunter-3000\` | Continuous outbound TCP connections on port 443 |
| **T1005** | Data from Local System | \`credential-exposure-auditor\` | Accessing \`.env\`, \`~/.ssh\`, or clipboard memory |
| **T1053.001** | LaunchAgent Persistence | \`threat-hunter-3000\` | Auto-executing background plists |`,
    "generatedAt": "2026-09-13T01:45:00.000Z"
  },
  "hr": {
    "role": "hr",
    "title": "Personnel Governance, Access Audit & Regulatory Mandate Brief (120-Min Sandbox Attack)",
    "summary": "Human resource access audit, insider threat assessment, and regulatory compliance brief for the 120-minute sandbox breach simulation (#INC-2026-8891). Forensic attribution traced the vulnerability introduction to a developer credentials leak and unreviewed pull request merge (PR #4). This report details employee attribution, workstation policy non-compliance, statutory compliance breach mandates under the Digital Personal Data Protection (DPDP) Act 2023 and ISO 27001, and an actionable employee retraining roadmap.",
    "metrics": {
      "likelihoodScore": 96,
      "businessImpactScore": 92,
      "financialExposure": {
        "min": "₹15,00,000",
        "mostLikely": "₹48,00,000",
        "max": "₹1,20,00,000",
        "eal": "₹38,40,000"
      },
      "riskTrend": "Increasing"
    },
    "keyFindings": [
      "Committer Attribution: Rohit Debnath (Senior Frontend Engineer - Employee ID: EMP-4029) & Workstation MacBook-Pro-Dev03.lan.",
      "Unauthorized Merge: PR #4 ('implemented ml model') merged without mandatory 2-person security signoff.",
      "Workstation Policy Deviations: Personal USB peripheral connected on Tuesday; unapproved cloud sync on Thursday; split-tunnel VPN socket on Friday.",
      "Regulatory Exposure: Digital Personal Data Protection (DPDP) Act 2023 Sec 8 statutory 72-hour notification protocol required if production data is compromised.",
      "Standard Breaches: Non-compliance flagged under ISO 27001 Control A.8.28 (Secure Coding) & SEBI CSCRF Section 3.2 (Access Governance)."
    ],
    "businessImpact": {
      "operational": "Engineering deployment paused pending mandatory access scope review and branch protection rule rollout.",
      "financial": "Exposure to statutory regulatory penalties up to ₹1,20,00,000 under DPDP Act 2023 if unmitigated data breach occurred in production.",
      "compliance": "Audit observations recorded against ISO 27001 A.8.28 and SEBI CSCRF; corrective action plan required.",
      "reputational": "Internal trust audit required; zero external press exposure as attack was contained within sandbox boundary."
    },
    "aiInsights": [
      "Forensic investigation reveals developer committed code from unhardened personal workstation without mandatory GPG commit signing.",
      "Automating GitHub branch protection rules with mandatory 2-person approval eliminates 95% of human-factor supply chain vulnerabilities."
    ],
    "recommendedActions": [
      {
        "action": "Enforce mandatory GPG signed commits and GitHub branch protection requiring 2 senior security approvals on main branch",
        "riskReductionPercent": 95,
        "estimatedCost": "₹0 (Policy Configuration)",
        "estimatedEffort": "30 minutes",
        "priority": "HIGH",
        "timeToImplement": "Immediate",
        "rosi": "Infinite",
        "type": "Quick Win"
      },
      {
        "action": "Suspend production deployment keys for EMP-4029 and conduct access scope audit",
        "riskReductionPercent": 80,
        "estimatedCost": "₹0",
        "estimatedEffort": "1 hour",
        "priority": "HIGH",
        "timeToImplement": "Within 24 hours",
        "rosi": "High ROI Action",
        "type": "Quick Win"
      },
      {
        "action": "Conduct mandatory Secure Supply Chain & Workstation Hygiene workshop for all 14 engineering department personnel",
        "riskReductionPercent": 75,
        "estimatedCost": "₹50,000 (Internal Workshop)",
        "estimatedEffort": "1 day",
        "priority": "MEDIUM",
        "timeToImplement": "Next 7 Days",
        "rosi": "420% ROI",
        "type": "Long-Term Investment"
      }
    ],
    "investmentOptimization": "Zero-cost immediate HR policy enforcement (branch protection rules & GPG signing) combined with targeted engineering security hygiene training.",
    "complianceMappings": [
      {
        "framework": "ISO/IEC 27001",
        "controlId": "A.8.28",
        "status": "Deficient",
        "impactDescription": "Secure coding rules and peer review mechanisms prior to code integration"
      },
      {
        "framework": "ISO/IEC 27001",
        "controlId": "A.13.1.1",
        "status": "Deficient",
        "impactDescription": "Network boundary controls and restriction of external socket listeners"
      },
      {
        "framework": "SEBI CSCRF",
        "controlId": "CSCRF-Sec-3.2",
        "status": "Deficient",
        "impactDescription": "Access control governance and privilege separation for developer accounts"
      },
      {
        "framework": "RBI Framework",
        "controlId": "RBI-CS-G2",
        "status": "Partial",
        "impactDescription": "Third-party component risk management and vendor package audit"
      }
    ],
    "scenarios": {
      "scenarioA_NoAction": {
        "residualRisk": "Critical (Policy violation unaddressed; high recurrence probability)",
        "financialExposure": "₹1,20,00,000 Maximum Fine Exposure under DPDP Act 2023",
        "complianceImpact": "Formal regulatory audit observation and potential compliance certification suspension"
      },
      "scenarioB_Remediated": {
        "residualRisk": "Compliant (GPG signing, 2-person review & branch protection active)",
        "financialExposure": "₹0 Regulatory Penalty Risk",
        "complianceImpact": "Full regulatory compliance restored and audited",
        "expectedLossReduction": "95% reduction in compliance risk exposure"
      }
    },
    "finalVerdict": "Update access policies, enforce GPG commit signing and 2-reviewer PR protection immediately; schedule developer security retraining.",
    "keyInsights": [
      "Developer EMP-4029 committed malicious dependency without secondary approval",
      "Workstation deviations (USB, unapproved VPN) paved pathway for security control bypass",
      "Branch protection policy enforcement prevents unreviewed code merges"
    ],
    "actionItems": [
      "Audit access scopes for Employee EMP-4029 (Rohit Debnath)",
      "Enable GitHub Branch Protection rule requiring 2 security approvals on main branch",
      "Enforce mandatory GPG signed commits across repository settings",
      "Schedule Secure Supply Chain Security training session"
    ],
    "roleSpecificDetail": `### HR AUDIT, PERSONNEL ATTRIBUTION & REGULATORY COMPLIANCE

#### 1. Code Author & Committer Accountability Matrix
| Attribution Field | Investigation Finding |
| :--- | :--- |
| **Committer Name** | Rohit Debnath |
| **Designation** | Senior Frontend Engineer |
| **Employee ID** | EMP-4029 |
| **Department** | Core Product Web Engineering Team |
| **Host Asset Name** | \`MacBook-Pro-Dev03.lan\` (Assigned Device ID: #WKSTN-0891) |
| **Local IP Address** | \`192.168.31.204\` (VLAN-12 Staging Sandbox) |
| **Pull Request ID** | PR #4 (\`arko05roy/rohit/threat-extensions\`) |
| **Merge Approver** | Automated Merge / Missing mandatory 2-person security review |

#### 2. Workstation Policy Compliance Audit Log
- **Tuesday**: Notice recorded — Personal USB peripheral connected to workstation #WKSTN-0891 (Violation of Policy EP-HW-04).
- **Thursday**: Warning recorded — Unapproved file sync to unauthorized cloud storage bucket (Violation of Policy EP-DATA-07).
- **Friday**: Breach Detected — Split-tunnel external VPN socket initiated during working hours with unencrypted listener on port 5432 (Violation of Policy EP-SEC-09).

#### 3. Statutory Regulatory Mandates
- **Digital Personal Data Protection (DPDP) Act 2023 (Section 8)**: Requires reasonable security safeguards to prevent personal data breach. In production environments, failure to contain triggers mandatory 72-hour notification to the Data Protection Board of India.
- **ISO/IEC 27001:2022 Control A.8.28 (Secure Coding)**: Requires automated code validation and dependency vulnerability verification before production merge.
- **SEBI CSCRF Section 3.2**: Mandates strict separation between development environments and production database connection endpoints.

#### 4. Corrective HR Action Plan
1. **Access Suspension**: Temporarily restrict AWS/SSH production credentials for EMP-4029 pending formal security review.
2. **Policy Enforcement**: Activate GitHub Branch Protection Rule requiring 2 mandatory security reviewer signoffs.
3. **Training Roadmap**: Enroll all 14 engineers in the mandatory 1-day Secure Supply Chain & Dependency Hygiene Workshop.`,
    "generatedAt": "2026-09-13T01:45:00.000Z"
  },
  "management": {
    "role": "management",
    "title": "C-Suite Strategic Risk, FAIR Financial Exposure & Brand Protection Briefing",
    "summary": "Executive cyber risk quantification, financial exposure analysis, and strategic governance briefing for the CEO, CTO, and CMO regarding the 120-minute sandbox attack simulation (#INC-2026-8891). Evaluated using the FAIR (Factor Analysis of Information Risk) framework, this brief outlines potential financial loss distributions, technical debt reduction, Return on Security Investment (ROSI), and proactive brand protection measures.",
    "metrics": {
      "likelihoodScore": 96,
      "businessImpactScore": 92,
      "financialExposure": {
        "min": "₹15,00,000",
        "mostLikely": "₹48,00,000",
        "max": "₹1,20,00,000",
        "eal": "₹38,40,000"
      },
      "riskTrend": "Increasing"
    },
    "keyFindings": [
      "Potential Loss Avoided: ₹72,00,000 saved via automated SOAR & AegisDB socket containment within 30 minutes.",
      "Expected Annual Loss (EAL): ₹38,40,000 without automated CI/CD supply chain guardrails.",
      "Return on Security Investment (ROSI): 1,436% ROI on proposed ₹2,50,000 CI/CD security automation investment.",
      "Business Continuity: Zero customer-facing downtime; 45 minutes of internal developer dashboard latency resolved.",
      "Brand & Reputation: Zero customer data leaked; zero public press disclosure required."
    ],
    "businessImpact": {
      "operational": "Zero customer application downtime; internal developer environment latency resolved in 45 minutes.",
      "financial": "Saved ₹72L in potential breach costs; ₹48L most likely exposure without automated controls.",
      "compliance": "SEBI/RBI/DPDP statutory penalties avoided due to automated containment before production exfiltration.",
      "reputational": "Zero brand damage or customer trust degradation; proactive security posture demonstrated."
    },
    "aiInsights": [
      "Executive Takeaway: A targeted ₹2.5L investment in automated CI/CD dependency security eliminates ₹35.9L in annual Expected Annual Loss (1,436% ROSI).",
      "Board Assurance: KVCH automated zero-trust guardrails successfully prevented high-severity data exfiltration in real time."
    ],
    "recommendedActions": [
      {
        "action": "Approve ₹2,50,000 budget allocation for enterprise CI/CD supply chain firewall & AegisDB socket guardrails",
        "riskReductionPercent": 94,
        "estimatedCost": "₹2,50,000",
        "estimatedEffort": "2 weeks implementation",
        "priority": "HIGH",
        "timeToImplement": "Immediate Approval",
        "rosi": "1,436% ROI",
        "type": "High ROI Action"
      },
      {
        "action": "Authorize updated security policy mandating 2-person security review on all production configuration PRs",
        "riskReductionPercent": 88,
        "estimatedCost": "₹0",
        "estimatedEffort": "1 day",
        "priority": "HIGH",
        "timeToImplement": "24 hours",
        "rosi": "Infinite",
        "type": "Quick Win"
      }
    ],
    "investmentOptimization": "Strategic spend of ₹2,50,000 eliminates ₹38,40,000 in Expected Annual Loss, yielding an annual net savings of ₹35,90,000.",
    "complianceMappings": [
      {
        "framework": "ISO/IEC 27001",
        "controlId": "A.5.1",
        "status": "Compliant",
        "impactDescription": "Information security policies and board governance oversight"
      },
      {
        "framework": "SEBI CSCRF",
        "controlId": "CSCRF-Gov-1",
        "status": "Partial",
        "impactDescription": "Board oversight of cyber risk financial quantification"
      }
    ],
    "scenarios": {
      "scenarioA_NoAction": {
        "residualRisk": "High (92% likelihood of recurring supply chain incident within 6 months)",
        "financialExposure": "₹1,20,00,000 Maximum Loss Exposure",
        "complianceImpact": "Formal regulatory audit observation and potential fine"
      },
      "scenarioB_Remediated": {
        "residualRisk": "Minimal (Residual EAL: ₹2,50,000)",
        "financialExposure": "₹0 Residual Breach Exposure",
        "complianceImpact": "Full regulatory compliance & board assurance",
        "expectedLossReduction": "₹35,90,000 Net Annual Savings"
      }
    },
    "finalVerdict": "Sandbox simulation validated threat engine efficacy; incident contained with zero customer data loss. Approve ₹2.5L CI/CD security automation allocation immediately.",
    "keyInsights": [
      "Immediate automated containment protected the enterprise from a potential ₹72L breach loss",
      "EAL without automated supply chain controls is ₹38.4L per year",
      "Recommended security investment delivers an unprecedented 1,436% ROSI"
    ],
    "actionItems": [
      "CEO: Sign board resolution authorizing updated cyber risk governance policy",
      "CTO: Oversee integration of automated CI/CD dependency firewall into build pipelines",
      "CMO: File proactive zero-trust customer trust assurance briefing"
    ],
    "roleSpecificDetail": `### C-SUITE STRATEGIC RISK & FINANCIAL QUANTIFICATION BRIEF

#### 1. FAIR Framework Financial Loss Distribution
| Loss Category | Value (INR) | Executive Context & Breakdown |
| :--- | :--- | :--- |
| **Minimum Exposure** | **₹15,00,000** | Internal developer time, forensic log auditing, and sandbox teardown |
| **Most Likely Loss** | **₹48,00,000** | Third-party forensic audit, credential overhaul, and GRC remediation |
| **Maximum Loss Exposure** | **₹1,20,00,000** | Statutory penalties under DPDP Act 2023, customer compensation, and legal defense |
| **Expected Annual Loss (EAL)** | **₹38,40,000** | Probabilistic annualized exposure without automated CI/CD guardrails |
| **Loss Avoided by KVCH SOAR** | **₹72,00,000** | Prevented exfiltration of 50,000+ sensitive records via automated socket termination |

#### 2. C-Suite Persona Strategic Alignment
- **For the Chief Executive Officer (CEO)**:
  - *Governance Assurance*: The automated multi-tier SOAR system successfully intercepted the attack before any data crossed external perimeter boundaries.
  - *Board Recommendation*: Authorize formal executive policy requiring mandatory 2-person signoff on all production infrastructure changes.
- **For the Chief Technology Officer (CTO)**:
  - *Technical Debt Reduction*: Allocate ₹2,50,000 for automated CI/CD supply chain firewalls.
  - *Operational Efficiency*: Delivers a **1,436% Return on Security Investment (ROSI)** with net annual savings of ₹35,90,000.
  - *Uptime*: System maintained 100% customer uptime throughout the 120-minute sandbox attack cycle.
- **For the Chief Marketing Officer (CMO)**:
  - *Brand Protection*: Zero customer data compromised; zero negative press exposure.
  - *Market Differentiation*: Package our zero-trust AST detection and automated SOAR capabilities into our enterprise trust narrative (enhancing SOC 2 Type II assurance for enterprise prospects).

#### 3. Strategic Decision Matrix
\`\`\`
Decision Option A: Accept Current Risk Profile
├── Initial Spend: ₹0
├── Residual EAL: ₹38,40,000/year
└── 1-Year Financial Exposure: Up to ₹1,20,00,000

Decision Option B: Implement KVCH Automated Guardrails (RECOMMENDED)
├── Investment: ₹2,50,000 (One-time tooling & automation)
├── Residual EAL: ₹2,50,000/year
└── Net Annualized Benefit: ₹35,90,000 Savings (1,436% ROSI)
\`\`\``,
    "generatedAt": "2026-09-13T01:45:00.000Z"
  }
};
