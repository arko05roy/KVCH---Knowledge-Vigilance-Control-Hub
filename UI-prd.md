# Product Requirement Document (PRD): KVCH UI & Design System

**Document Title:** UI Product Requirement Document (`UI-prd.md`)  
**Product:** KVCH — Knowledge, Vigilance & Control Hub  
**Design Aesthetic:** Linear Product Design System Inspired (Near-Black Software Craftsmanship)  
**Version:** 1.0.0-alpha  

---

## 🎨 1. Design Language & Design System Specifications

The KVCH user interface is explicitly modeled after **Linear's software-craft design language** (`DESIGN.md`). It presents a near-black, quietly luxurious, high-density control plane crafted for developers, security auditors, HR directors, and C-level executives.

### 1.1 Color Palette & Surface Ladder
Depth and hierarchy are established through a **four-step surface lift ladder + 1px hairline borders** rather than heavy atmospheric drop shadows.

| Surface Token | Hex Code | Use Case / Component |
| :--- | :--- | :--- |
| **Canvas Anchor** | `#010102` / `#08090a` / `#0f1011` | Deepest background canvas (near-pure black with faint blue tint) |
| **Surface 1 (Charcoal Lift)** | `#141516` / `#1a1b1d` | Default cards, data tables, product UI screenshot containers |
| **Surface 2 (Elevated Lift)** | `#18191a` / `#1e2025` | Active tab headers, hovered card panels, modal dialogs |
| **Surface 3 (Sub-Nav / Elevated)**| `#262729` | Selected pill toggles, secondary button fills |
| **Hairline Border** | `#23252a` / `#2b2c2e` | 1px subtle divider lines & card borders |
| **Hairline Strong** | `#34343a` | Focused inputs, hovered card borders |

### 1.2 Chromatic Accents & Semantic Color Palette

| Role / Function | Token / Color | Hex Code | Usage Rules |
| :--- | :--- | :--- | :--- |
| **Primary Brand Accent** | Linear Lavender-Blue | `#5e6ad2` | Used **scarcely**: active navigation tabs, primary CTAs, focus rings, key metric highlights. Hover: `#828fff`. |
| **Success / Compliant** | Semantic Green | `#27a644` / `#2ea043` | Compliant scorecards, passed controls, mitigated threats, online status. |
| **Warning / Moderate** | Amber Gold | `#f5a623` / `#f2c94c` | Medium risk alerts, audit mode policies, pending approvals. |
| **Critical / Incident** | Critical Red | `#e5484d` / `#eb5757` | SEV-1 incidents, active threats, quarantined PRs, SLA breach warnings. |
| **Text (Ink)** | Light Gray Ink | `#f7f8f8` | Primary headlines, card titles, key values. |
| **Text Muted / Subtle** | Slate Gray | `#8a8f98` / `#858688` | Table headers, metadata labels, timestamps, subtitles. |
| **Code / Hash Tokens** | Linear Mono | Monospace | Hash strings, commit IDs, IP addresses, terminal commands. |

### 1.3 Typography System
Built on **Inter / SF Pro Display** (`--font-sans`) fallback with negative tracking for headers, and **JetBrains Mono / Linear Mono** for code tokens.

* **Display XL / Hero**: `56px–80px`, Weight 600, Tracking `-1.8px` to `-3.0px`, Line Height `1.1`
* **Headline / Card Title**: `22px–28px`, Weight 600, Tracking `-0.6px`, Line Height `1.2`
* **Subhead / Body Large**: `18px–20px`, Weight 400, Tracking `-0.2px`, Line Height `1.4`
* **Body Default**: `14px–16px`, Weight 400, Tracking `-0.05px`, Line Height `1.5`
* **Eyebrow / Monospace**: `11px–13px`, Weight 500/400, Tracking `+0.4px` (Positive for taxonomy), Font: Mono

---

## 🗺️ 2. Complete Website Page Inventory & Data/Graph Specifications

The website consists of **45 static & dynamic routes** structured into **5 distinct role suites**, a root hub landing page, and an extensions workbench.

---

### 🌐 Hub Landing & Core Overview (`/`)
* **Endpoint**: `/`
* **Layout**: Sticky top nav, hero section, Monte Carlo risk banner, extension registry.
* **Exact Data Shown**:
  * Overall Cyber Risk Index (e.g. `8.9 / 10.0`).
  * Total Financial Expected Annual Loss (EAL: `₹38,40,000`).
  * Real-time VCDB log ingest trigger button.
  * Role quick-selector links (`/sr-dev/dashboard`, `/intern/dashboard`, `/management/dashboard`, `/hr/dashboard`, `/risk-intelligence`).
* **Graphs & Visualizers**:
  * Executive Monte Carlo Loss Probability Bar & Risk Curve.
  * Active Extension Status Grid (8 Security Extensions).

---

### 1. 👨‍💻 Senior Developer Suite (`/sr-dev/*`)
*Focus: Technical gatekeeping, code diff analysis, incident command, and architectural vigilance.*

#### 1.1 Senior Dev Dashboard (`/sr-dev/dashboard`)
* **Data Shown**: Incident `#INC-2026-8891` telemetry, target host `prod-db-primary-01.local`, malicious process PID `14209`, reverse shell IP `185.220.101.5:443`.
* **Graphs & Visualizers**:
  * `MinimalSparklineChart` (Codebase Health vs. Vulnerability Churn).
  * `CodeDiffViewer` (PostgreSQL `postgresql.conf` & `package.json` diff).
  * `TelemetryLogStream` (Live C2 network socket stream).
  * `AiReportDisplayCard` (AI Security Analysis Report).

#### 1.2 Code Reviews (`/sr-dev/reviews`)
* **Data Shown**: Peer review queue, PR author, modified files count, AST vulnerability flags.
* **Graphs & Visualizers**: Multi-file split diff viewer, AST vulnerability flag pills.

#### 1.3 Projects & Health Tree (`/sr-dev/projects`)
* **Data Shown**: Repository health score (e.g. `92/100`), technical debt hot-spot map, dependency tree status.
* **Graphs & Visualizers**: `ProjectsTimeline` component & module dependency graph.

#### 1.4 Approval Queue (`/sr-dev/approvals`)
* **Data Shown**: Pending gatekeeper holds (`APR-8810`, `APR-8809`), author, repo, impact level (`HIGH_PRIVILEGE`, `SCHEMA_MIGRATION`), risk flags.
* **Graphs & Visualizers**: Code snippet preview box, single-click "Approve & Deploy" / "Reject Hold" buttons.

#### 1.5 Team Incidents (`/sr-dev/incidents`)
* **Data Shown**: Active outages (`INC-2026-041`), severity (`SEV-1`, `SEV-2`), commander, MTTR duration (`24m 12s`), impacted users (`14,200`), root-cause analysis (RCA) summary.
* **Graphs & Visualizers**: MTTR SLA Gauge Bar, System Availability Meter (`99.98%`).

#### 1.6 Additional Sr. Dev Pages
* `/sr-dev/pulse`: Real-time developer velocity & code churn sparklines.
* `/sr-dev/inbox`: Triage intelligence inbox with AI issue categorizer.
* `/sr-dev/issues`: Kanban issue board (`KanbanBoard` component).
* `/sr-dev/initiatives`: Strategic engineering initiatives timeline (`InitiativesPage`).
* `/sr-dev/marketplace`: Security extension marketplace (`MarketplacePage`).
* `/sr-dev/custom-extensions`: Custom WASM extension sandbox (`CustomExtensionsPage`).

---

### 2. 👨‍🎓 Intern / Junior Developer Suite (`/intern/*`)
*Focus: Guided onboarding, AI hint engine, step-by-step triage, and skill growth.*

#### 2.1 Intern Dashboard (`/intern/dashboard`)
* **Data Shown**: Onboarding task progress, PR review readiness, assigned mentor feedback, AI educational report.
* **Graphs & Visualizers**: Task completion progress bar, AI educational triage walkthrough card.

#### 2.2 My Tasks & AI Hints (`/intern/tasks`)
* **Data Shown**: Assigned tickets (`TASK-102`), difficulty level, inline AI hints, reference code snippets.
* **Graphs & Visualizers**: Interactive task checklist with AI prompt suggestion engine.

#### 2.3 Reviews (`/intern/reviews`)
* **Data Shown**: Personal PRs submitted, mentor review comments, automated linting passes.
* **Graphs & Visualizers**: Code review feedback breakdown.

#### 2.4 Projects & API Specs (`/intern/projects`)
* **Data Shown**: Assigned module sandboxes, OpenAPI / GraphQL schema references, architectural docs.
* **Graphs & Visualizers**: Interactive schema viewer.

#### 2.5 Personal Pulse & Growth (`/intern/pulse`)
* **Data Shown**: Completed milestones, lines of code contributed, YARA hash comparison exercises.
* **Graphs & Visualizers**: Personal contribution sparklines & skill progression radar.

#### 2.6 Additional Intern Pages
* `/intern/inbox`: Personal notification stream.
* `/intern/issues`: Personal issue ticket board.
* `/intern/initiatives`: Student/Intern project initiatives.
* `/intern/marketplace`: Extension marketplace.

---

### 3. 👔 Management & Tech Leads Suite (`/management/*`)
*Focus: Executive engineering KPIs, FAIR model risk exposure, ROSI calculations, and blocker escalations.*

#### 3.1 Management Dashboard (`/management/dashboard`)
* **Data Shown**: FAIR financial loss model (Min: `₹15L`, Likely: `₹48L`, Max: `₹1.2Cr`, EAL: `₹38.4L`), loss avoided (`₹72L`), ROSI (`1,436%`).
* **Graphs & Visualizers**:
  * Executive Financial Loss Distribution Gauge.
  * Sprint Velocity vs Risk Paydown Trend.
  * Executive AI Summary Report.

#### 3.2 Escalation Matrix (`/management/escalations`)
* **Data Shown**: Active blockers (`ESC-901`), department (`Digital Payments`), severity (`CRITICAL`), financial risk (`₹45,00,000`), SLA breach countdown (`12h`).
* **Graphs & Visualizers**: Total At-Risk Exposure gauge (`₹63 Lakhs`), Executive Exemption Grant buttons.

#### 3.3 Business Impact & Capital Investment (`/management/investment`)
* **Data Shown**: FY26 Q3 Budget allocation (`₹10.00 Cr`), R&D spend (`45%`), Tech Debt paydown (`25%`), Risk Shielding (`20%`), DevEx (`10%`), ROI multipliers.
* **Graphs & Visualizers**: Capital Distribution Progress Bars & ROSI return matrix.

#### 3.4 Team Pulse (`/management/pulse`)
* **Data Shown**: Sprint velocity metrics, team capacity utilization (`88%`), cross-functional delivery speed.
* **Graphs & Visualizers**: Team velocity charts & workload capacity bars.

#### 3.5 Executive Inbox (`/management/inbox`)
* **Data Shown**: High-level approval requests, budget threshold warnings, staffing changes.
* **Graphs & Visualizers**: Triage list & one-click approval buttons.

---

### 4. 🏢 HR & Organization Suite (`/hr/*`)
*Focus: Employee accountability, work pattern sentiment, burnout risk, and policy compliance.*

#### 4.1 HR Dashboard (`/hr/dashboard`)
* **Data Shown**: Committer ID (`EMP-4029` Rohit Debnath), commit hash `7a8f9c1b`, PR #4, compliance failure under ISO 27001 (A.8.28) & DPDP Act 2023.
* **Graphs & Visualizers**: Organization Retention Index, HR AI Governance Report Card.

#### 4.2 Sentiment Pulse (`/hr/pulse`)
* **Data Shown**: Workload sentiment score, burnout risk flags, survey response rates.
* **Graphs & Visualizers**: Sentiment trend charts & team satisfaction gauges.

#### 4.3 Pattern Analysis (`/hr/patterns`)
* **Data Shown**: Team work patterns, after-hours commit ratio (`28%` in Core Backend), burnout risk level (`HIGH`), skill gap identification.
* **Graphs & Visualizers**: Org Burnout Risk Index, After-hours commit ratio gauge, 1-on-1 check-in trigger.

#### 4.4 Policy Governance (`/hr/policies`)
* **Data Shown**: Enterprise IP Protection policy (`HRP-101`), acknowledgment rate (`98%`), pending employee signature count (`3`), last updated date.
* **Graphs & Visualizers**: Policy acknowledgment progress meters, automated email reminder buttons.

#### 4.5 HR Inbox (`/hr/inbox`)
* **Data Shown**: Developer onboarding tickets, equipment requests, internal grievance escalations.
* **Graphs & Visualizers**: Action queue list.

---

### 5. 🛡️ Risk Intelligence & Security Suite (`/risk-intelligence/*`)
*Focus: Financial cyber risk quantification, threat mitigation, cryptographic audit streams, and compliance.*

#### 5.1 Overview & Monte Carlo Calculator (`/risk-intelligence`)
* **Data Shown**: Scenario ID (`SCENARIO-PAYMENT-001`), CVE-2026-3891 (`pay-auth-crypto`), EPSS score (`0.72`), CISA KEV status, Monte Carlo simulation parameters.
* **Graphs & Visualizers**:
  * 3-Step Intake → Loss → Optimization Process Indicator.
  * Candidate Mitigation ROI Comparison Matrix.
  * Ingest Real VCDB Logs trigger button.

#### 5.2 Real-Time Threat Monitor (`/risk-intelligence/threats`)
* **Data Shown**: Active threat alarms (`THREAT-9941`), category (`Secret Leak`, `Rogue Package`), active threat index (`8.9 / 10.0`), mean time to quarantine (`1.8 min`).
* **Graphs & Visualizers**: Active Threat Index Gauge Bar, Single-click remediation action buttons ("Auto-Revoke Key & Block PR").

#### 5.3 Forensic Audits (`/risk-intelligence/audits`)
* **Data Shown**: Immutable Merkle hash chain logs (`AUD-2026-9812`), actor IP (`10.244.12.98`), event types (`ai_prompt_execution`, `code_modification`), governance result (`QUARANTINED`).
* **Graphs & Visualizers**: Expandable drawer with raw code diffs, AI model prompt logs, cryptographic ZIP export trigger.

#### 5.4 Compliance Scorecards (`/risk-intelligence/compliance`)
* **Data Shown**: Continuous scores for **SOC 2** (`94%`), **ISO 27001** (`88%`), **GDPR** (`98%`), **NIST 800-53** (`82%`), failed control SLA countdowns (`CTL-SOC2-CC6.1`).
* **Graphs & Visualizers**: Framework Readiness Progress Bars, Automated Fix Trigger, Certified Auditor PDF generator.

#### 5.5 Security Guardrail Policies (`/risk-intelligence/policies`)
* **Data Shown**: Guardrail rules (`POL-001`), mode toggle matrix (`ENFORCE`, `AUDIT`, `DISABLED`), severity on trigger (`BLOCK_PR`, `QUARANTINE`).
* **Graphs & Visualizers**: Policy Rule Mode Toggle Buttons, Policy Evaluation Simulator, Rule Creation Modal.

---

### 🧩 6. Extensions Workbench Suite (`/extensions` & `/extensions/[artifactId]`)
* **Endpoints**: `/extensions` and `/extensions/[artifactId]`
* **Data Shown**: Active security extensions (Supply Chain Auditor, Credential Scanner, WASM Sandbox), evaluation metrics, deployment logs.
* **Graphs & Visualizers**: `IntelligentPerformanceStage` component & extension execution charts.

---

## 📊 3. Summary Matrix of Dashboard Telemetry & Visualizers

| Role Suite | Primary Dashboard Route | Key Data / Metadata Received | Primary Graphs & Charts |
| :--- | :--- | :--- | :--- |
| **Senior Dev** | `/sr-dev/dashboard` | Incident #INC-2026-8891, PID 14209, C2 IP 185.220.101.5:443 | Sparkline charts, Code diff viewer, Telemetry log stream |
| **Intern** | `/intern/dashboard` | Guided triage tasks, SHA-256 hash e3b0c442, YARA rules | Task progress bars, Attack lifecycle flow diagram |
| **Management**| `/management/dashboard` | FAIR model loss (Min ₹15L, Likely ₹48L, EAL ₹38.4L), ROSI 1,436% | Loss distribution gauge, Sprint velocity vs risk curve |
| **HR** | `/hr/dashboard` | Committer ID EMP-4029, commit hash 7a8f9c1b, ISO 27001 deficiency | Retention index chart, Policy acknowledgment meters |
| **Risk Intel** | `/risk-intelligence` | Monte Carlo risk loss, EPSS score 0.72, VCDB real logs | Risk loss curves, Threat index gauge, Compliance bars |
