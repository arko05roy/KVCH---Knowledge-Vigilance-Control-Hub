# HR & Compliance Governance Audit Report
**Incident ID**: INC-2026-8891  
**Focus**: Code Attribution, Developer Accountability & Regulatory Compliance  

---

## 1. Executive Summary & Code Attribution
This report outlines the human resource governance audit and regulatory compliance mapping for Incident #INC-2026-8891. The investigation traced the introduction of the malicious dependency commit to a developer credentials leak on Git commit hash `7a8f9c1b`.

## 2. Commit & Personnel Accountability Matrix
| Parameter | Forensic Detail |
| :--- | :--- |
| **Committer Name** | Rohit Debnath |
| **Designation** | Senior Frontend Engineer |
| **Employee ID** | EMP-4029 |
| **Department / Team** | Core Product & Web Engineering |
| **Git Commit Hash** | `7a8f9c1b3d2e1f4a5b6c7d8e9f0a1b2c` |
| **Repository File** | `web/package.json` |
| **Pull Request** | PR #4 (`arko05roy/rohit/threat-extensions`) |
| **Approval Status** | Merged without secondary security signoff |

---

## 3. Regulatory Compliance Failure Points
- **ISO/IEC 27001:2022 Control A.8.28 (Secure Coding)**: **Deficient**. Third-party packages were pulled without AST static analysis checks.
- **SEBI CSCRF Section 3.2 (Access Control Governance)**: **Deficient**. Database credentials accessible to unvetted scripts.
- **Digital Personal Data Protection (DPDP) Act 2023 Section 8**: **High Risk**. Personal data exposure risk requires Data Protection Officer oversight.

---

## 4. HR Action Plan & Governance Safeguards
1. **Access Revocation & Credential Rotation**: Rotate SSH & cloud deployment keys associated with EMP-4029.
2. **GitHub Branch Protection Rules**: Enforce mandatory 2-person security review and GPG signed commits across all web repositories.
3. **Engineering Security Training**: Conduct mandatory Secure Supply Chain & Dependency Hygiene workshops for the Web Team.
