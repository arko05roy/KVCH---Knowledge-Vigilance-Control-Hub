import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";

const OUTPUT_DIR = path.resolve("d:/SIH/KVCH---Knowledge-Vigilance-Control-Hub/demo report");

interface ReportData {
  incidentId: string;
  timestamp: string;
  title: string;
  threatLevel: string;
  classification: string;
  mitre: string;
  affectedAsset: string;
  internalIp: string;
  destinationC2: string;
  responsibleOfficer: string;
  employeeId: string;
  financialImpact: string;
  dataRiskProfile: string;
  rootCause: string;
  remediationDiff: string;
  containmentStatus: string;
  policyAgreementTag: string;
  zkProofSeal?: string;
}

// 1. DATASET FOR FULL ALLOWANCE (RAW / UNFILTERED)
const FULL_ALLOWANCE_DATA: ReportData = {
  incidentId: "INC-2026-8891-FULL",
  timestamp: "2026-09-12 17:12:44 UTC",
  title: "CRITICAL: Malicious Supply-Chain NPM Infiltration & Outbound C2 Reverse Shell",
  threatLevel: "CRITICAL (Confidence: 95.4%)",
  classification: "REVERSE_SHELL / SUPPLY_CHAIN_COMPROMISE",
  mitre: "T1195.001 (Supply Chain Compromise) | T1059.001 (PowerShell/Node Execution)",
  affectedAsset: "prod-db-primary-01.fin.kvch-internal.corp (PostgreSQL Core Cluster)",
  internalIp: "10.0.4.15 (Subnet: 10.0.4.0/24 - Core Financial Database Enclave)",
  destinationC2: "185.220.101.5:443 (Tor Exit Node / Bulletproof C2 Proxy)",
  responsibleOfficer: "Rohit Debnath (Senior Frontend Engineer, EMP-4029)",
  employeeId: "EMP-4029 (Core Web Team / Node.js Maintainer)",
  financialImpact: "$4,250,000 USD (Direct Outage, Regulatory Fine Reserve, Remediation Costs)",
  dataRiskProfile: "HIGH RISK (Exposed: 42,000 Cardholder Records, JWT Private Keys, AWS Master Keys)",
  rootCause: "Unverified npm package `@kvch-internal/crypto-utils@1.4.2` merged via PR #4 without 2-person security review. Postinstall hook spawned unauthenticated reverse shell socket.",
  remediationDiff: `--- a/web/package.json
+++ b/web/package.json
- "@kvch-internal/crypto-utils": "^1.4.2",
+ "@kvch-internal/crypto-utils": "1.4.1",

--- a/etc/postgresql/15/main/postgresql.conf
+++ b/etc/postgresql/15/main/postgresql.conf
-listen_addresses = '*'
+listen_addresses = 'localhost, 10.0.4.15'`,
  containmentStatus: "HOST AUTO-ISOLATED. Process PID 14209 terminated. Firewall rule DROP 185.220.101.5 applied.",
  policyAgreementTag: "INTERNAL_SOC_EXCLUSIVE // CLEARANCE_LEVEL: TIER-0_FULL_ACCESS",
};

// 2. DATASET FOR STAKEHOLDER AGREEABLE LAYER (FILTERED / ZERO-KNOWLEDGE MASKED)
const STAKEHOLDER_LAYERED_DATA: ReportData = {
  incidentId: "INC-2026-8891-MASKED",
  timestamp: "2026-09-12 17:12:44 UTC",
  title: "INCIDENT DISCLOSURE: Third-Party Package Anomaly & Automated Perimeter Defense",
  threatLevel: "CRITICAL [SEVERITY_CONFIRMED]",
  classification: "SUPPLY_CHAIN_DEPENDENCY_ANOMALY",
  mitre: "T1195.001 (Supply Chain Compromise)",
  affectedAsset: "[PROTECTED-NODE-FIN-01] (Tier-1 Enterprise Infrastructure)",
  internalIp: "10.0.X.X [INTERNAL SUBNET ENCLAVE - MASKED UNDER DPDP ACT]",
  destinationC2: "185.220.101.5:443 (External IOC Shared for Ecosystem Defense)",
  responsibleOfficer: "[REDACTED-OFFICER-A] (Role: Frontend Developer)",
  employeeId: "[REDACTED-IDENTIFIER-DPDP-SEC8]",
  financialImpact: "RISK BAND B ($1,000,000 - $5,000,000 USD Bounded via ZK Range Proof #9921)",
  dataRiskProfile: "CATEGORIZED AS SENSITIVE // COMPREHENSIVE DLP AUDIT UNDERWAY",
  rootCause: "Upstream dependency repository anomaly detected in third-party package. Automated behavior sandbox quarantined anomalous outbound socket.",
  remediationDiff: `--- a/[PROTECTED_CONFIG_FILE]
+++ b/[PROTECTED_CONFIG_FILE]
- [RESTRICTED DEPENDENCY REF v1.4.2]
+ [VERIFIED DEPENDENCY REF v1.4.1]
*** [NETWORK POLICY TIGHTENED TO RESTRICTED LOCAL ENCLAVE] ***`,
  containmentStatus: "CONTAINED. Automated perimeter policy isolated node; external indicators blacklisted fleet-wide.",
  policyAgreementTag: "STAKEHOLDER_AGREEMENT_ALLOWANCE_LAYER_2 // COMPLIANT_DPDP_2023",
  zkProofSeal: "0x8f2a11b934c9e882... (ZK-SNARK Public Input Hash: 0x9921b7c4... Attested on Celo/Local EVM)",
};

function createPdfReport(data: ReportData, outputPath: string, isFullAllowance: boolean) {
  const doc = new PDFDocument({ margin: 40, size: "A4" });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Background Header Banner
  const headerBgColor = isFullAllowance ? "#881337" : "#1e1b4b"; // Rose for Internal/Full, Indigo for Stakeholder
  const accentColor = isFullAllowance ? "#e11d48" : "#6366f1";
  
  doc.rect(0, 0, doc.page.width, 95).fill(headerBgColor);

  // Header Text
  doc.fillColor("#ffffff");
  doc.font("Helvetica-Bold").fontSize(18).text(
    isFullAllowance ? "KVCH INTERNAL SOC INCIDENT DOSSIER [TIER-0 RAW]" : "KVCH STAKEHOLDER GOVERNED DISCLOSURE [AGREEMENT LAYER]",
    40,
    22
  );
  
  doc.font("Helvetica").fontSize(10).fillColor("#cbd5e1").text(
    isFullAllowance
      ? "CONFIDENTIAL // RESTRICTED TO INTERNAL SECURITY OPERATIONS & EXECUTIVES ONLY (ZERO FILTERING)"
      : "PRIVACY-PRESERVING STAKEHOLDER SHARING // FILTERED PER BILATERAL DATA GOVERNANCE AGREEMENT",
    40,
    46
  );

  doc.font("Helvetica-Bold").fontSize(9).fillColor(isFullAllowance ? "#fecdd3" : "#c7d2fe").text(
    `INCIDENT ID: ${data.incidentId}  |  TIMESTAMP: ${data.timestamp}  |  GOVERNANCE: ${data.policyAgreementTag}`,
    40,
    64
  );

  let y = 115;

  // Status Badge Block
  doc.rect(40, y, doc.page.width - 80, 48).fillAndStroke("#0f172a", "#334155");
  doc.fillColor("#94a3b8").fontSize(8).font("Helvetica-Bold").text("THREAT VERDICT & CLASSIFICATION", 50, y + 8);
  doc.fillColor(accentColor).fontSize(12).font("Helvetica-Bold").text(data.threatLevel, 50, y + 20);
  doc.fillColor("#f8fafc").fontSize(9).font("Helvetica").text(`MITRE: ${data.mitre}`, 50, y + 34);

  y += 62;

  // Metadata Two-Column Table
  doc.rect(40, y, doc.page.width - 80, 160).fillAndStroke("#1e293b", "#334155");
  
  doc.fillColor("#38bdf8").fontSize(10).font("Helvetica-Bold").text("INCIDENT TELEMETRY & ATTRIBUTION", 50, y + 10);

  const leftColX = 50;
  const rightColX = 300;
  let rowY = y + 30;

  const rows = [
    { label: "Target Host / Asset:", val: data.affectedAsset },
    { label: "Internal Network Enclave:", val: data.internalIp },
    { label: "Destination C2 Endpoint:", val: data.destinationC2 },
    { label: "Committer / Officer Identity:", val: data.responsibleOfficer },
    { label: "Employee / Service ID:", val: data.employeeId },
    { label: "Quantified Financial Exposure:", val: data.financialImpact },
    { label: "Data Asset Sensitivity:", val: data.dataRiskProfile },
  ];

  for (const r of rows) {
    doc.fillColor("#94a3b8").fontSize(8).font("Helvetica-Bold").text(r.label, leftColX, rowY);
    doc.fillColor("#f1f5f9").fontSize(8).font("Helvetica").text(r.val, leftColX + 130, rowY, { width: 360 });
    rowY += 18;
  }

  y += 175;

  // Root Cause & Attack Mechanism Box
  doc.rect(40, y, doc.page.width - 80, 75).fillAndStroke("#0f172a", "#334155");
  doc.fillColor(accentColor).fontSize(9).font("Helvetica-Bold").text("ROOT CAUSE & DETECTED MECHANISM", 50, y + 8);
  doc.fillColor("#e2e8f0").fontSize(8.5).font("Helvetica").text(data.rootCause, 50, y + 22, { width: doc.page.width - 100, lineGap: 3 });

  y += 88;

  // Remediation / Code Diff Section
  doc.rect(40, y, doc.page.width - 80, 110).fillAndStroke("#020617", "#1e293b");
  doc.fillColor("#38bdf8").fontSize(9).font("Helvetica-Bold").text("CODE PATCH & REMEDIATION TELEMETRY", 50, y + 8);
  doc.fillColor("#22c55e").fontSize(7.5).font("Courier").text(data.remediationDiff, 50, y + 24, { width: doc.page.width - 100, lineGap: 2 });

  y += 122;

  // Containment & SOAR Actions
  doc.rect(40, y, doc.page.width - 80, 60).fillAndStroke("#0f172a", "#334155");
  doc.fillColor("#fbbf24").fontSize(9).font("Helvetica-Bold").text("CONTAINMENT & ACTIVE SOAR POLICY", 50, y + 8);
  doc.fillColor("#f1f5f9").fontSize(8.5).font("Helvetica").text(data.containmentStatus, 50, y + 22, { width: doc.page.width - 100, lineGap: 2 });

  y += 72;

  // Zero Knowledge Seal or Internal Attestation Stamp
  if (!isFullAllowance && data.zkProofSeal) {
    doc.rect(40, y, doc.page.width - 80, 50).fillAndStroke("#1e1b4b", "#4338ca");
    doc.fillColor("#a5b4fc").fontSize(8.5).font("Helvetica-Bold").text("ZERO-KNOWLEDGE PRIVACY ATTESTATION & CRYPTOGRAPHIC SEAL", 50, y + 8);
    doc.fillColor("#e0e7ff").fontSize(7.5).font("Courier").text(`ZK-SNARK Policy Proof: ${data.zkProofSeal}\nVerified by Smart Contract Registry (Ethereum / Celo Sepolia Testnet). Masking conforms to DPDP Act 2023 Sec 8.`, 50, y + 20, { width: doc.page.width - 100 });
  } else {
    doc.rect(40, y, doc.page.width - 80, 50).fillAndStroke("#4c0519", "#881337");
    doc.fillColor("#fecdd3").fontSize(8.5).font("Helvetica-Bold").text("INTERNAL COMPLIANCE & LEGAL NOTICE", 50, y + 8);
    doc.fillColor("#ffe4e6").fontSize(7.5).font("Helvetica").text("UNREDACTED DOCUMENT: Contains raw employee identifiers, internal network topologies, and unmasked financial records. Unauthorized distribution outside Tier-0 authorized personnel is strictly prohibited under Enterprise Cyber Policy.", 50, y + 20, { width: doc.page.width - 100 });
  }

  // Footer
  doc.fillColor("#64748b").fontSize(7.5).font("Helvetica").text(
    `KVCH (Knowledge Vigilance Control Hub) v2.0  |  Generated at ${data.timestamp}  |  Page 1 of 1`,
    40,
    doc.page.height - 25,
    { align: "center", width: doc.page.width - 80 }
  );

  doc.end();
  return new Promise<void>((resolve) => stream.on("finish", () => resolve()));
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const fullPdfPath = path.join(OUTPUT_DIR, "KVCH_FULL_ALLOWANCE_INTERNAL_REPORT.pdf");
  const layeredPdfPath = path.join(OUTPUT_DIR, "KVCH_STAKEHOLDER_AGREEABLE_LAYERED_REPORT.pdf");

  console.log("Generating PDF 1: Full Allowance Internal Report (Zero Filtering)...");
  await createPdfReport(FULL_ALLOWANCE_DATA, fullPdfPath, true);
  console.log(`[SUCCESS] Generated: ${fullPdfPath}`);

  console.log("Generating PDF 2: Stakeholder Governed Layered Report (Agreeable Masking)...");
  await createPdfReport(STAKEHOLDER_LAYERED_DATA, layeredPdfPath, false);
  console.log(`[SUCCESS] Generated: ${layeredPdfPath}`);

  console.log("\n==========================================================");
  console.log("  BOTH ENTERPRISE INCIDENT PDF REPORTS GENERATED CLEANLY!  ");
  console.log("==========================================================");
}

main().catch(console.error);
