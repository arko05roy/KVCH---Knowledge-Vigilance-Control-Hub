# KVCH Financial Cyber Risk Intelligence — Dataset Sources & References

This document specifies the authoritative threat intelligence datasets, vulnerability databases, and financial loss benchmarks integrated into the **KVCH Financial Cyber Risk Intelligence Engine**.

---

## 1. Core Principle: Evidence-Linked Quantification

Per [KVCH_ML_CYBER_RISK_PRD.md](file:///d:/SIH/KVCH---Knowledge-Vigilance-Control-Hub/KVCH_ML_CYBER_RISK_PRD.md) Section 3.2, KVCH **does not train black-box AI models from scratch** on arbitrary customer logs. Training an end-to-end neural network on sparse incident data produces uncalibrated, indefensible monetary figures.

Instead, KVCH joins real-time global security intelligence feeds with customer-controlled asset profiles using **calibrated statistical likelihood models** and **Open FAIR Monte Carlo simulations**.

---

## 2. Global Threat & Vulnerability Feeds

| Dataset Name | Provider / Source | URL / Feed Endpoint | Role in KVCH Engine |
| :--- | :--- | :--- | :--- |
| **FIRST EPSS** | Forum of Incident Response and Security Teams | [api.first.org/epss](https://www.first.org/epss/) | Machine-learning calibrated 30-day wild exploitation probability ($0.0 - 1.0$) for CVEs. |
| **CISA KEV** | US Cybersecurity & Infrastructure Security Agency | [cisa.gov/known-exploited-vulnerabilities](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) | Authoritative catalog of CVEs actively exploited in the wild ($2.5\times$ threat frequency multiplier). |
| **NIST NVD** | National Institute of Standards and Technology | [nvd.nist.gov/vuln/data-feeds](https://nvd.nist.gov/) | Technical vulnerability metadata, CPE package matching, and CVSS v3.1/v4 vectors. |
| **OSV Dev** | Open Source Vulnerabilities (Google Open Source) | [osv.dev](https://osv.dev/) | Package URL (`purl`) vulnerability resolution for software bill of materials (SBOM). |

---

## 3. Financial Loss & Risk Framework Benchmarks

| Framework / Benchmark | Source Organization | Reference Standard | Purpose in KVCH Simulation |
| :--- | :--- | :--- | :--- |
| **Open FAIR** | The Open Group | [Open FAIR Standard](https://www.opengroup.org/open-fair) | Quantitative taxonomy for Threat Event Frequency (TEF) and Loss Event Frequency (LEF). |
| **VERIS / VCDB** | Verizon Risk Team | [veriscommunity.net](https://github.com/vz-risk/VCDB) | Empirical incident loss component breakdown priors (Downtime, IR labor, Data Breach). |

---

## 4. Regulatory & Compliance Evidence Mappings

| Regulatory Body / Standard | Framework Reference | KVCH Mapping Target |
| :--- | :--- | :--- |
| **SEBI** | CSCRF (Cyber Security & Cyber Resilience Framework) | Clause 4.2: Continuous Monetary Risk Assessment & Audit Evidence |
| **RBI** | Master Direction on IT Governance & Cyber Controls | Section 7: Critical Business Service Impact & RTO SLA Enforcement |
| **NIST** | Cybersecurity Framework 2.0 | `GV.RM-01`: Enterprise Risk Strategy & Loss Quantification |
| **CIS** | Critical Security Controls v8.1 | Control 7: Vulnerability Management & Control 15: Third-Party Risk |

---

## 5. Tenant Data Sovereignty & Isolation

- **No Shared Model Training:** Tenant telemetry, asset criticality rates, and business revenue inputs remain isolated in tenant storage. Customer data is **never used to train shared external models**.
- **Cold-Start Reliability:** Every monetary calculation is reproducible from versioned evidence snapshots, parameter definitions, and random seeds (`seed=42`).
