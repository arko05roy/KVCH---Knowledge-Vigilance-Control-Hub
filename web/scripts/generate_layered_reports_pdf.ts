import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";

const OUTPUT_DIR = path.resolve("d:/SIH/KVCH---Knowledge-Vigilance-Control-Hub/demo report");

interface ReportData {
  incidentId: string;
  timestamp: string;
  layerName: string;
  clearanceLevel: string;
  targetAudience: string;
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
  governanceNotice: string;
  zkProofSeal?: string;
}

// ==========================================
// 1. LAYER 1: EXECUTIVE & BOARD REPORT (25% MASKING)
// ==========================================
const LAYER_1_EXECUTIVE_DATA: ReportData = {
  incidentId: "INC-2026-8891-EXEC-L1",
  timestamp: "2026-09-12 17:12:44 UTC",
  layerName: "LAYER 1: EXECUTIVE & BOARD STRATEGIC BRIEFING",
  clearanceLevel: "TIER-1 INTERNAL STRATEGIC // BOARD & C-SUITE EXCLUSIVE",
  targetAudience: "Chief Executive Officer (CEO), Chief Information Security Officer (CISO), Board Audit Committee",
  threatLevel: "CRITICAL [EXECUTIVE ACTION REQUIRED]",
  classification: "SUPPLY_CHAIN_INFILTRATION & COMPROMISED DEPENDENCY",
  mitre: "T1195.001 (Supply Chain Compromise) | T1059.001 (Node.js/PowerShell Execution)",
  affectedAsset: "Financial Core Database Cluster (Region: AP-South-1 Production)",
  internalIp: "10.0.4.X (Protected Database VPC Enclave)",
  destinationC2: "185.220.101.5:443 (Tor Exit Node / Threat Intel Score: 98/100)",
  responsibleOfficer: "Senior Frontend Engineer (Core Web Team - Access Suspended Pending Review)",
  employeeId: "EMP-4029 (Department: Core Product Engineering)",
  financialImpact: "$4,250,000 USD (Quantified Exposure: $2.1M Downtime + $1.5M Regulatory Reserve + $650k Forensics)",
  dataRiskProfile: "HIGH RISK (42,000 User Records Staged; JWT Signing Keys & AWS Production Credentials Targeted)",
  rootCause: "A compromised third-party npm dependency (@kvch-internal/crypto-utils@1.4.2) was merged via PR #4 without mandatory 2-person security signoff. Automated postinstall hook opened an unauthenticated outbound reverse shell.",
  remediationDiff: `--- a/web/package.json
+++ b/web/package.json
- "@kvch-internal/crypto-utils": "^1.4.2",
+ "@kvch-internal/crypto-utils": "1.4.1",  [REVERTED TO VERIFIED PIN]

--- a/etc/postgresql/15/main/postgresql.conf
+++ b/etc/postgresql/15/main/postgresql.conf
-listen_addresses = '*'
+listen_addresses = 'localhost, 10.0.4.15'  [RESTRICTED TO LOCAL ENCLAVE]`,
  containmentStatus: "HOST AUTO-ISOLATED IN 420ms. Outbound C2 connection severed; AWS production credentials and master session tokens rotated across fleet.",
  policyAgreementTag: "INTERNAL_GOVERNANCE_LAYER_1 // STRICT_CONFIDENTIALITY",
  governanceNotice: "EXECUTIVE BRIEFING: Prepared for Board of Directors and CISO. Contains aggregated financial exposure, root-cause vulnerability analysis, and regulatory liability reserves under DPDP Act 2023 & SEBI CSCRF guidelines.",
};

// ==========================================
// 2. LAYER 2: STAKEHOLDER AGREEABLE REPORT (70% MASKING / ZK-SNARK)
// ==========================================
const LAYER_2_STAKEHOLDER_DATA: ReportData = {
  incidentId: "INC-2026-8891-STAKEHOLDER-L2",
  timestamp: "2026-09-12 17:12:44 UTC",
  layerName: "LAYER 2: STAKEHOLDER & INSURER AGREEABLE DISCLOSURE",
  clearanceLevel: "TIER-2 BILATERAL SHARING // GOVERNED DATA ALLOWANCE AGREEMENT",
  targetAudience: "Cyber Insurance Underwriters, Key Supply Chain Partners, External Regulatory Auditors",
  threatLevel: "CRITICAL [CONTAINED & MITIGATED]",
  classification: "SUPPLY_CHAIN_DEPENDENCY_ANOMALY",
  mitre: "T1195.001 (Supply Chain Compromise)",
  affectedAsset: "[PROTECTED-NODE-FIN-01] (Tier-1 Enterprise Infrastructure Asset)",
  internalIp: "10.0.X.X [INTERNAL NETWORK ENCLAVE - MASKED UNDER DPDP ACT SEC 8]",
  destinationC2: "185.220.101.5:443 (External Indicator of Compromise Shared for Global Defense)",
  responsibleOfficer: "[REDACTED-OFFICER-A] (Role: Frontend Developer)",
  employeeId: "[REDACTED-IDENTIFIER-DPDP-2023-COMPLIANT]",
  financialImpact: "RISK BAND B ($1,000,000 - $5,000,000 USD Proven via ZK-SNARK Range Proof #9921)",
  dataRiskProfile: "CATEGORIZED AS SENSITIVE // COMPREHENSIVE ZERO-LEAKAGE DLP AUDIT COMPLETED",
  rootCause: "Upstream third-party package anomaly intercepted by KVCH Endpoint Watchdog. Automated sandboxing detected abnormal outbound telemetry and enforced immediate isolation.",
  remediationDiff: `--- a/[PROTECTED_CONFIG_FILE]
+++ b/[PROTECTED_CONFIG_FILE]
- [RESTRICTED THIRD-PARTY DEPENDENCY REF v1.4.2]
+ [CRYPTOGRAPHICALLY VERIFIED DEPENDENCY PIN v1.4.1]
*** [NETWORK POLICY ENFORCED: STRICT LOCAL ENCLAVE BINDING] ***`,
  containmentStatus: "CONTAINED & QUARANTINED. Automated perimeter policy isolated target host; external C2 signatures blacklisted across all partner gateways.",
  policyAgreementTag: "STAKEHOLDER_AGREEMENT_ALLOWANCE_LAYER_2 // COMPLIANT_DPDP_2023",
  governanceNotice: "PRIVACY-PRESERVING DISCLOSURE: Generated in compliance with Bilateral Cyber Data Sharing Agreements. Sensitive employee identities and internal network topologies are cryptographically masked. Financial loss is verified via Zero-Knowledge Range Proofs.",
  zkProofSeal: "0x8f2a11b934c9e882... (ZK-SNARK Public Input Hash: 0x9921b7c4... Attested on Celo/Local EVM)",
};

function generatePdf(data: ReportData, filename: string, isLayer1: boolean) {
  const doc = new PDFDocument({ margin: 38, size: "A4" });
  const outputPath = path.join(OUTPUT_DIR, filename);
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Theme Colors
  const headerBg = isLayer1 ? "#1e1b4b" : "#0f172a";      // Dark Indigo vs Dark Slate
  const accentColor = isLayer1 ? "#818cf8" : "#38bdf8";   // Indigo-400 vs Sky-400
  const bannerBorder = isLayer1 ? "#4338ca" : "#0284c7";

  // Top Header Box
  doc.rect(0, 0, doc.page.width, 100).fill(headerBg);

  // Title & Layer Pill
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(16).text(data.layerName, 38, 20);
  
  doc.font("Helvetica").fontSize(8.5).fillColor("#cbd5e1").text(
    `CLEARANCE: ${data.clearanceLevel}`,
    38,
    42
  );
  
  doc.font("Helvetica").fontSize(7.5).fillColor("#94a3b8").text(
    `AUDIENCE: ${data.targetAudience}`,
    38,
    55,
    { width: doc.page.width - 76 }
  );

  doc.font("Helvetica-Bold").fontSize(8).fillColor(accentColor).text(
    `INCIDENT ID: ${data.incidentId}  |  TIMESTAMP: ${data.timestamp}  |  TAG: ${data.policyAgreementTag}`,
    38,
    78
  );

  let y = 115;

  // Verdict & Classification Header Card
  doc.rect(38, y, doc.page.width - 76, 46).fillAndStroke(isLayer1 ? "#0f1016" : "#080d1a", bannerBorder);
  doc.fillColor("#94a3b8").fontSize(7.5).font("Helvetica-Bold").text("THREAT SEVERITY & MITRE ATT&CK MAPPING", 48, y + 7);
  doc.fillColor(accentColor).fontSize(11).font("Helvetica-Bold").text(data.threatLevel, 48, y + 18);
  doc.fillColor("#f1f5f9").fontSize(8).font("Helvetica").text(`Classification: ${data.classification}  |  ${data.mitre}`, 48, y + 31);

  y += 58;

  // Metadata Table
  doc.rect(38, y, doc.page.width - 76, 155).fillAndStroke("#111827", "#374151");
  doc.fillColor(accentColor).fontSize(9).font("Helvetica-Bold").text("TELEMETRY ATTRIBUTION & RISK METRICS", 48, y + 8);

  const leftX = 48;
  const valX = 180;
  let rowY = y + 26;

  const fields = [
    { label: "Affected Asset / Cluster:", val: data.affectedAsset },
    { label: "Internal Network Enclave:", val: data.internalIp },
    { label: "External Threat Endpoint:", val: data.destinationC2 },
    { label: "Attributed Employee / Role:", val: data.responsibleOfficer },
    { label: "Employee Identifier / Unit:", val: data.employeeId },
    { label: "Quantified Financial Impact:", val: data.financialImpact },
    { label: "Data Asset Sensitivity Profile:", val: data.dataRiskProfile },
  ];

  for (const f of fields) {
    doc.fillColor("#9ca3af").fontSize(7.5).font("Helvetica-Bold").text(f.label, leftX, rowY);
    doc.fillColor("#f3f4f6").fontSize(7.5).font("Helvetica").text(f.val, valX, rowY, { width: 360 });
    rowY += 17.5;
  }

  y += 168;

  // Root Cause & Attack Mechanism Box
  doc.rect(38, y, doc.page.width - 76, 75).fillAndStroke("#0f172a", "#334155");
  doc.fillColor(accentColor).fontSize(8.5).font("Helvetica-Bold").text("ROOT CAUSE & DETECTED INFILTRATION VECTOR", 48, y + 8);
  doc.fillColor("#e2e8f0").fontSize(8).font("Helvetica").text(data.rootCause, 48, y + 22, { width: doc.page.width - 96, lineGap: 2.5 });

  y += 87;

  // Remediation / Code Diff Box
  doc.rect(38, y, doc.page.width - 76, 105).fillAndStroke("#030712", "#1f2937");
  doc.fillColor("#22d3ee").fontSize(8.5).font("Helvetica-Bold").text("REMEDIATION PATCH & CONFIGURATION DIFF", 48, y + 7);
  doc.fillColor("#4ade80").fontSize(7).font("Courier").text(data.remediationDiff, 48, y + 22, { width: doc.page.width - 96, lineGap: 1.8 });

  y += 116;

  // Containment & SOAR Action Box
  doc.rect(38, y, doc.page.width - 76, 55).fillAndStroke("#0f172a", "#334155");
  doc.fillColor("#facc15").fontSize(8.5).font("Helvetica-Bold").text("CONTAINMENT STATUS & SOAR AUTOMATION", 48, y + 7);
  doc.fillColor("#f8fafc").fontSize(8).font("Helvetica").text(data.containmentStatus, 48, y + 20, { width: doc.page.width - 96, lineGap: 2 });

  y += 66;

  // Governance / Cryptographic Seal Card
  if (!isLayer1 && data.zkProofSeal) {
    doc.rect(38, y, doc.page.width - 76, 52).fillAndStroke("#1e1b4b", "#4f46e5");
    doc.fillColor("#a5b4fc").fontSize(8).font("Helvetica-Bold").text("ZERO-KNOWLEDGE PRIVACY SEAL & PROOF ATTESTATION", 48, y + 6);
    doc.fillColor("#e0e7ff").fontSize(7).font("Courier").text(
      `ZK-SNARK Range Proof: ${data.zkProofSeal}\n` +
      `Verified on Ethereum/Celo Sepolia. Compliant with Digital Personal Data Protection (DPDP) Act 2023 Sec 8.`,
      48,
      y + 19,
      { width: doc.page.width - 96, lineGap: 1.5 }
    );
  } else {
    doc.rect(38, y, doc.page.width - 76, 52).fillAndStroke("#1e293b", "#475569");
    doc.fillColor("#93c5fd").fontSize(8).font("Helvetica-Bold").text("BOARD EXECUTIVE GOVERNANCE & COMPLIANCE MANDATE", 48, y + 6);
    doc.fillColor("#e2e8f0").fontSize(7.5).font("Helvetica").text(
      data.governanceNotice,
      48,
      y + 19,
      { width: doc.page.width - 96, lineGap: 2 }
    );
  }

  // Footer
  doc.fillColor("#64748b").fontSize(7).font("Helvetica").text(
    `KVCH v2.0 (Knowledge Vigilance Control Hub)  |  ${data.incidentId}  |  Generated at ${data.timestamp}  |  Page 1 of 1`,
    38,
    doc.page.height - 22,
    { align: "center", width: doc.page.width - 76 }
  );

  doc.end();
  return new Promise<void>((resolve) => stream.on("finish", () => resolve()));
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("Generating Layer 1: Executive & Board Governance Report...");
  await generatePdf(LAYER_1_EXECUTIVE_DATA, "KVCH_LAYER_1_EXECUTIVE_BOARD_REPORT.pdf", true);
  console.log(`[SUCCESS] Generated: ${path.join(OUTPUT_DIR, "KVCH_LAYER_1_EXECUTIVE_BOARD_REPORT.pdf")}`);

  console.log("Generating Layer 2: Stakeholder Agreeable Layered Report (ZK-Proof Masked)...");
  await generatePdf(LAYER_2_STAKEHOLDER_DATA, "KVCH_LAYER_2_STAKEHOLDER_AGREEABLE_REPORT.pdf", false);
  console.log(`[SUCCESS] Generated: ${path.join(OUTPUT_DIR, "KVCH_LAYER_2_STAKEHOLDER_AGREEABLE_REPORT.pdf")}`);

  console.log("\n==========================================================");
  console.log("  LAYER 1 & LAYER 2 PDF REPORTS GENERATED CLEANLY!        ");
  console.log("==========================================================");
}

main().catch(console.error);
