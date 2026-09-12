# KVCH Security Intelligence Report: HR & Regulatory Compliance
**Document Reference**: `KVCH-HR-2026-8891`  
**Target Role**: HR Director / Chief Compliance Officer / Corporate Risk Auditor  
**Classification**: Privileged & Confidential / Human Resource Records  
**Incident Reference**: `#INC-2026-8891`  
**Severity**: **CRITICAL**  
**Simulation Window**: 120-Minute Sandbox Attack Run  

---

## 1. Executive Summary & Context
This personnel governance and statutory compliance audit evaluates the vulnerability introduction and lateral privilege progression observed during the 120-minute sandbox attack simulation (#INC-2026-8891). Forensic attribution traced the initial entry vector to an unreviewed pull request merge (PR #4) committed by an employee workstation that had repeatedly deviated from endpoint security hygiene standards. This report establishes employee accountability, documents workstation audit findings, details statutory reporting mandates under India's Digital Personal Data Protection (DPDP) Act 2023, ISO/IEC 27001, and SEBI CSCRF, and defines a corrective retraining and policy enforcement roadmap.

---

## 2. Personnel Accountability & Attribution Matrix

| Attribution Parameter | Forensic Finding & Personnel Record |
| :--- | :--- |
| **Committer Name** | **Rohit Debnath** |
| **Employee ID** | `EMP-4029` |
| **Corporate Designation** | Senior Frontend Engineer |
| **Organizational Unit** | Core Product Web Engineering Team |
| **Assigned Hardware Asset** | `MacBook-Pro-Dev03.lan` (Asset Tag: `#WKSTN-0891`) |
| **Network IP Assignment** | `192.168.31.204` (VLAN-12 Staging Subnet) |
| **Pull Request Identifier** | PR #4 (`arko05roy/rohit/threat-extensions`) — "implemented ml model" |
| **Peer Review Status** | **NON-COMPLIANT**: Merged directly without mandatory 2-person security review |
| **Git Commit Signature** | **UNSIGNED**: Commit lacked required GPG cryptographic verification |

---

## 3. Workstation Compliance Audit Log (#WKSTN-0891)

An automated audit of device `#WKSTN-0891` revealed a progressive pattern of policy deviations leading up to the incident:

- **Tuesday (11:24 AM)**: *Policy Deviation EP-HW-04 (Hardware Hygiene)*  
  Unregistered external USB storage device connected to the physical workstation without prior authorization from IT Security.
- **Thursday (03:45 PM)**: *Policy Deviation EP-DATA-07 (Data Loss Prevention)*  
  Unapproved file synchronization client initiated data transfers to a non-sanctioned personal cloud storage bucket.
- **Friday (04:02 PM)**: *Policy Breach EP-SEC-09 (Network & Perimeter Boundaries)*  
  A split-tunnel VPN connection on interface `tun0` was active during development hours, allowing local network services (PostgreSQL port 5432) to listen openly on external interfaces (`0.0.0.0`) while bypassing the corporate WireGuard secure DNS resolver.

---

## 4. Statutory Compliance & Regulatory Mandates

If an unmitigated attack of this nature were to occur in production, the organization would be subject to strict statutory penalties and mandatory reporting requirements:

### 1. India Digital Personal Data Protection (DPDP) Act 2023 (Section 8)
- **Mandate**: Section 8(6) requires data fiduciaries to implement reasonable security safeguards and report every personal data breach to the **Data Protection Board of India (DPBI)** and affected data principals within **72 hours**.
- **Financial Penalties**: Section 33 Schedule states penalties of up to **₹250 Crores** for failure to take reasonable security safeguards to prevent personal data breaches.

### 2. ISO/IEC 27001:2022 Controls
- **Control A.8.28 (Secure Coding)**: Requires organizations to establish secure coding rules and automated pre-merge vulnerability scans. PR #4 directly breached this requirement.
- **Control A.5.15 (Access Control)**: Developers must not have unconstrained direct write or merge permissions to main branches.
- **Control A.13.1.1 (Network Boundary Controls)**: Local machines must enforce strict perimeter controls and prohibit unauthenticated socket exposure.

### 3. SEBI CSCRF (Cybersecurity & Cyber Resilience Framework)
- **Section 3.2**: Mandates air-gapped segregation between developer staging environments and sensitive client financial records.

---

## 5. Corrective Action Plan & HR Directives

1. **Immediate Access Suspension**:
   - Temporarily suspend production AWS, database, and SSH deployment keys for Rohit Debnath (`EMP-4029`) pending completion of formal security review.
2. **Branch Protection Enforcement**:
   - Mandate GitHub repository branch protection rules requiring at least **two independent senior security reviews** before any code can merge to `main`.
3. **Mandatory GPG Commit Signing**:
   - Enforce cryptographic commit verification (`git config commit.gpgsign true`) across all developer repositories.
4. **Mandatory Engineering Retraining Workshop**:
   - Enroll all 14 engineers in the engineering team into a mandatory 1-day **Secure Supply Chain & Workstation Hygiene Training Program** covering dependency verification, package lockfile integrity, and local socket hardening.
