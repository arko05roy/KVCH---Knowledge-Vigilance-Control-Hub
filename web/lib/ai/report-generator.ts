import "server-only";
import { groqPool } from "./groq";
import type { FindingEnvelope } from "../judge/findings";

export interface QuantifiedRiskMetrics {
  likelihoodScore: number; // 0-100
  businessImpactScore: number; // 0-100
  financialExposure: {
    min: string;
    mostLikely: string;
    max: string;
    eal: string; // Expected Annual Loss
  };
  riskTrend: "Increasing" | "Stable" | "Decreasing";
}

export interface ScenarioAnalysis {
  scenarioA_NoAction: {
    residualRisk: string;
    financialExposure: string;
    complianceImpact: string;
  };
  scenarioB_Remediated: {
    residualRisk: string;
    financialExposure: string;
    complianceImpact: string;
    expectedLossReduction: string;
  };
}

export interface RecommendedActionItem {
  action: string;
  riskReductionPercent: number;
  estimatedCost: string;
  estimatedEffort: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  timeToImplement: string;
  rosi: string; // Return on Security Investment (e.g. 340% ROI)
  type: "Quick Win" | "High ROI Action" | "Long-Term Investment";
}

export interface ComplianceMappingItem {
  framework: "ISO/IEC 27001" | "NIST CSF" | "CIS Controls" | "RBI Framework" | "SEBI CSCRF";
  controlId: string;
  status: "Deficient" | "Partial" | "Compliant";
  impactDescription: string;
}

export interface RoleSecurityReport {
  role: "sr-dev" | "intern" | "hr" | "management";
  title: string;
  summary: string; // Executive Summary / Briefing
  metrics?: QuantifiedRiskMetrics;
  keyFindings?: string[];
  businessImpact?: {
    operational: string;
    financial: string;
    compliance: string;
    reputational: string;
  };
  aiInsights?: string[];
  recommendedActions?: RecommendedActionItem[];
  investmentOptimization?: string; // Spend recommendation under budget constraints
  complianceMappings?: ComplianceMappingItem[];
  scenarios?: ScenarioAnalysis;
  finalVerdict?: string;
  keyInsights: string[]; // Backward compatibility helper array
  actionItems: string[]; // Backward compatibility helper array
  roleSpecificDetail: string;
  generatedAt: string;
}

export interface MultiRoleReportPackage {
  findingId?: string;
  findingTitle: string;
  severity: string;
  category: string;
  reports: {
    srDev: RoleSecurityReport;
    intern: RoleSecurityReport;
    hr: RoleSecurityReport;
    management: RoleSecurityReport;
  };
}

/**
 * Generate customized security reports for all 4 roles from a kvch.finding/v1 envelope using Groq AI key pool
 * with enterprise cyber risk economics, asset criticality modeling (Laptop vs Production), financial exposure modeling, and compliance framework mapping.
 */
export async function generateAllRoleReports(finding: FindingEnvelope): Promise<MultiRoleReportPackage> {
  const userPrompt = `Analyze the following standardized 'kvch.finding/v1' telemetry finding envelope and generate 4 role-specific security intelligence reports for:
1. Senior Developer ('srDev'): Lead Developer / SOC Technical Lead
2. Cyber Intern ('intern'): Junior Security Analyst / Guided Triage Trainee
3. HR & Compliance ('hr'): Auditor / Regulatory Compliance Lead
4. Executive Management ('management'): CISO / Board of Directors

---------------------------------------------------
INPUT TELEMETRY ENVELOPE (kvch.finding/v1):
---------------------------------------------------
${JSON.stringify(finding, null, 2)}

---------------------------------------------------
ASSET CRITICALITY & FINANCIAL SCALING RULES (CRITICAL):
---------------------------------------------------
Inspect the 'resource' object in the finding envelope:
1. LOW CRITICALITY ASSET (Developer Laptop / Local Workstation):
   - Trigger: resource.type is 'laptop', 'workstation', 'desktop', OR name contains 'MacBook', 'dev-pc', '.lan', OR local IP (192.168.x.x, 10.x.x.x, 127.0.0.1).
   - Financial Scale: Keep monetary loss realistic for a local machine! 
   - Financial Exposure Range MUST be between ₹0 to ₹10,000 MAX (e.g. Min: ₹0, Most Likely: ₹2,500, Max: ₹10,000, EAL: ₹1,250).
   - Operational/Compliance impact MUST state: "Local developer machine scope; zero direct customer data or production system exposure."

2. HIGH CRITICALITY ASSET (Production Server / Enterprise Database / Cloud Infra):
   - Trigger: resource.type is 'production_server', 'database', 'cloud_storage', 'api_gateway', OR public domain/IP.
   - Financial Scale: Enterprise breach & regulatory fine scale.
   - Financial Exposure Range: ₹10,00,000 to ₹1,00,00,000+ (EAL: ₹2,00,000 - ₹25,00,000+).

---------------------------------------------------
QUANTIFICATION & ANALYSIS INSTRUCTIONS:
---------------------------------------------------
For each role, translate the technical finding into concrete monetary and operational risk:
- Likelihood Score (0-100) & Business Impact Score (0-100)
- Financial Exposure Range (Min, Most Likely, Max, Expected Annual Loss / EAL in ₹ or USD, scaled by Asset Criticality above)
- Regulatory & Compliance Mapping (ISO/IEC 27001, NIST CSF, CIS Controls, RBI Cyber Security Framework, SEBI CSCRF)
- ROSI (Return on Security Investment = Risk Reduction % ÷ Estimated Cost)
- Scenario Analysis: Scenario A (No Action) vs. Scenario B (Recommended Action Implemented)

---------------------------------------------------
ROLE TARGETING:
---------------------------------------------------
- 'srDev': Focus on root cause, precise code/config patch diffs, netstat/port bindings, firewall rules, and technical steps.
- 'intern': Focus on step-by-step educational triage checklist, evidence verification, and learning notes.
- 'hr': Focus on access governance, policy audit alignment, control deficiencies, regulatory exposure, and framework coverage.
- 'management': Focus on business disruption, EAL, financial exposure, board-level ROSI, and strategic investment priority.

---------------------------------------------------
OUTPUT FORMAT:
---------------------------------------------------
Return strictly a single JSON object with keys "srDev", "intern", "hr", "management". Do NOT include markdown codeblocks or outer text.

Required JSON Structure per role:
{
  "srDev": {
    "title": "Technical Root Cause & Remediation",
    "summary": "High-level summary of technical issue...",
    "metrics": {
      "likelihoodScore": 35,
      "businessImpactScore": 20,
      "financialExposure": {
        "min": "₹0",
        "mostLikely": "₹2,500",
        "max": "₹10,000",
        "eal": "₹1,250"
      },
      "riskTrend": "Stable"
    },
    "keyFindings": ["Open port 5432 exposed", "Unauthenticated SMB listener"],
    "businessImpact": {
      "operational": "Local developer machine scope; zero direct customer data or production system exposure.",
      "financial": "Estimated Expected Annual Loss of ₹1,250 in local IT support overhead.",
      "compliance": "Minor local workstation configuration deviation from baseline.",
      "reputational": "Zero public exposure or customer brand impact."
    },
    "aiInsights": ["Pattern indicates default database configuration exposed on local developer laptop"],
    "recommendedActions": [
      {
        "action": "Bind PostgreSQL to 127.0.0.1 and block port 445 on external interface",
        "riskReductionPercent": 95,
        "estimatedCost": "₹0 (In-house configuration)",
        "estimatedEffort": "10 minutes",
        "priority": "HIGH",
        "timeToImplement": "Immediate",
        "rosi": "Infinite (Zero cost, 95% risk reduction)",
        "type": "Quick Win"
      }
    ],
    "investmentOptimization": "Zero-budget 10-minute local config fix eliminates local exposure.",
    "complianceMappings": [
      {
        "framework": "ISO/IEC 27001",
        "controlId": "A.13.1.1",
        "status": "Deficient",
        "impactDescription": "Local host network perimeter control check"
      }
    ],
    "scenarios": {
      "scenarioA_NoAction": {
        "residualRisk": "Low (Likelihood 35%)",
        "financialExposure": "₹10,000 Max Exposure",
        "complianceImpact": "Local policy gap"
      },
      "scenarioB_Remediated": {
        "residualRisk": "Minimal (Likelihood < 2%)",
        "financialExposure": "₹0 Residual Risk",
        "complianceImpact": "Full compliance restored",
        "expectedLossReduction": "95% reduction in Expected Annual Loss"
      }
    },
    "finalVerdict": "Developer laptop asset is safe; 10-minute port binding eliminates local finding.",
    "keyInsights": ["Insight 1", "Insight 2"],
    "actionItems": ["Action 1", "Action 2"],
    "roleSpecificDetail": "Exact code fix, shell command, or step-by-step checklist..."
  },
  "intern": { ... },
  "hr": { ... },
  "management": { ... }
}`;

  try {
    const response = await groqPool.createCompletion({
      model: "groq/compound",
      messages: [
        {
          role: "system",
          content:
            "You are the KVCH Cyber Risk Economics & Financial Quantification Engine. You translate technical telemetry into monetary risk (EAL, ROSI), regulatory compliance (ISO 27001, NIST, CIS, RBI, SEBI), asset criticality modeling (Developer Laptop ₹0-₹10,000 vs Production Server ₹10L+), and actionable 4-role security reports. Output strictly valid raw JSON without markdown codeblocks or conversational text."
        },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    const now = new Date().toISOString();

    // Detect asset criticality for fallbacks
    const resourceStr = String(finding.resource?.type || finding.resource?.id || finding.resource?.name || "").toLowerCase();
    const isLocalLaptop = resourceStr.includes("laptop") || resourceStr.includes("workstation") || resourceStr.includes("macbook") || resourceStr.includes(".lan") || resourceStr.includes("192.168.");

    const defaultMetrics = isLocalLaptop
      ? {
          likelihoodScore: finding.severity === "high" ? 35 : 20,
          businessImpactScore: 20,
          financialExposure: {
            min: "₹0",
            mostLikely: "₹2,500",
            max: "₹10,000",
            eal: "₹1,250"
          },
          riskTrend: "Stable" as const
        }
      : {
          likelihoodScore: finding.severity === "high" ? 75 : 50,
          businessImpactScore: 80,
          financialExposure: {
            min: "₹1,00,000",
            mostLikely: "₹25,00,000",
            max: "₹1,00,00,000",
            eal: "₹12,50,000"
          },
          riskTrend: "Increasing" as const
        };

    const defaultImpact = isLocalLaptop
      ? {
          operational: "Local developer machine scope; zero direct customer data or production system exposure.",
          financial: "Estimated Expected Annual Loss of ₹1,250 in local IT support overhead.",
          compliance: "Minor local workstation configuration deviation from baseline.",
          reputational: "Zero public exposure or customer brand impact."
        }
      : {
          operational: "Potential production database service degradation",
          financial: "Estimated EAL based on enterprise breach & regulatory exposure",
          compliance: "ISO/IEC 27001 & SEBI CSCRF framework review required",
          reputational: "Potential customer data breach liability"
        };

    // Helper to format fallback fields if missing
    const formatRoleReport = (roleKey: "srDev" | "intern" | "hr" | "management", raw: any): RoleSecurityReport => {
      const roleMap = {
        srDev: "sr-dev",
        intern: "intern",
        hr: "hr",
        management: "management"
      } as const;

      const actions = raw?.recommendedActions || [
        {
          action: finding.recommended_actions?.[0] || "Remediate local configuration",
          riskReductionPercent: 90,
          estimatedCost: "₹0",
          estimatedEffort: "15 mins",
          priority: "HIGH",
          timeToImplement: "Immediate",
          rosi: "Infinite ROI",
          type: "Quick Win"
        }
      ];

      return {
        role: roleMap[roleKey],
        title: raw?.title || `${roleKey.toUpperCase()} Security Briefing`,
        summary: raw?.summary || finding.summary,
        metrics: raw?.metrics || defaultMetrics,
        keyFindings: raw?.keyFindings || [finding.title, finding.category],
        businessImpact: raw?.businessImpact || defaultImpact,
        aiInsights: raw?.aiInsights || ["Automated AI threat correlation complete"],
        recommendedActions: actions,
        investmentOptimization: raw?.investmentOptimization || "Zero-cost local configuration fix recommended.",
        complianceMappings: raw?.complianceMappings || [
          {
            framework: "ISO/IEC 27001",
            controlId: "A.13.1.1",
            status: "Deficient",
            impactDescription: "Local workstation network control baseline check"
          }
        ],
        scenarios: raw?.scenarios || {
          scenarioA_NoAction: {
            residualRisk: isLocalLaptop ? "Low local risk" : "High Production Loss",
            financialExposure: isLocalLaptop ? "₹10,000 Max Exposure" : "₹1,00,00,000 Max",
            complianceImpact: "Audit observation"
          },
          scenarioB_Remediated: {
            residualRisk: "Minimal residual risk",
            financialExposure: "₹0 Residual Risk",
            complianceImpact: "Fully compliant",
            expectedLossReduction: "95% loss reduction"
          }
        },
        finalVerdict: raw?.finalVerdict || (isLocalLaptop ? "Developer laptop asset is safe; local configuration fix recommended." : "Prompt production patch recommended."),
        keyInsights: raw?.keyInsights || raw?.keyFindings || [finding.category, `Severity: ${finding.severity}`],
        actionItems: raw?.actionItems || actions.map((a: any) => typeof a === "string" ? a : a.action) || ["Review finding details"],
        roleSpecificDetail: raw?.roleSpecificDetail || JSON.stringify(finding.details, null, 2),
        generatedAt: now
      };
    };

    return {
      findingTitle: finding.title || "Security Finding",
      severity: finding.severity || "medium",
      category: finding.category || "security",
      reports: {
        srDev: formatRoleReport("srDev", parsed.srDev),
        intern: formatRoleReport("intern", parsed.intern),
        hr: formatRoleReport("hr", parsed.hr),
        management: formatRoleReport("management", parsed.management)
      }
    };
  } catch (error) {
    console.error("AI Report Generation Error:", error);
    const now = new Date().toISOString();
    const resourceStr = String(finding.resource?.type || finding.resource?.id || finding.resource?.name || "").toLowerCase();
    const isLocalLaptop = resourceStr.includes("laptop") || resourceStr.includes("workstation") || resourceStr.includes("macbook") || resourceStr.includes(".lan") || resourceStr.includes("192.168.");

    const fallbackMetrics = isLocalLaptop
      ? { likelihoodScore: 25, businessImpactScore: 15, financialExposure: { min: "₹0", mostLikely: "₹2,500", max: "₹10,000", eal: "₹1,250" }, riskTrend: "Stable" as const }
      : { likelihoodScore: 50, businessImpactScore: 50, financialExposure: { min: "₹50,000", mostLikely: "₹2,50,000", max: "₹1,000,000", eal: "₹1,25,000" }, riskTrend: "Stable" as const };

    return {
      findingTitle: finding.title,
      severity: finding.severity,
      category: finding.category,
      reports: {
        srDev: {
          role: "sr-dev",
          title: `Technical Remediation: ${finding.title}`,
          summary: finding.summary,
          metrics: fallbackMetrics,
          keyFindings: [finding.category, `Severity: ${finding.severity}`],
          businessImpact: {
            operational: isLocalLaptop ? "Local developer machine scope; no production impact." : "Potential service degradation",
            financial: isLocalLaptop ? "₹1,250 local IT support overhead" : "Potential breach exposure",
            compliance: "ISO/IEC 27001 baseline observation",
            reputational: "Zero brand impact"
          },
          aiInsights: ["Fallback offline assessment generated"],
          recommendedActions: [
            {
              action: "Bind socket listener to localhost 127.0.0.1",
              riskReductionPercent: 95,
              estimatedCost: "₹0",
              estimatedEffort: "10 mins",
              priority: "HIGH",
              timeToImplement: "Immediate",
              rosi: "Infinite",
              type: "Quick Win"
            }
          ],
          investmentOptimization: "Execute zero-cost local fix.",
          complianceMappings: [
            { framework: "ISO/IEC 27001", controlId: "A.13.1.1", status: "Deficient", impactDescription: "Local host control check" }
          ],
          scenarios: {
            scenarioA_NoAction: { residualRisk: "Low", financialExposure: isLocalLaptop ? "₹10,000" : "₹1,000,000", complianceImpact: "Audit finding" },
            scenarioB_Remediated: { residualRisk: "Minimal", financialExposure: "₹0", complianceImpact: "Compliant", expectedLossReduction: "95%" }
          },
          finalVerdict: "Developer laptop asset is safe; 10-minute local binding recommended.",
          keyInsights: [finding.category, `Severity: ${finding.severity}`],
          actionItems: finding.recommended_actions?.map(String) || ["Review technical logs"],
          roleSpecificDetail: JSON.stringify(finding.details, null, 2),
          generatedAt: now
        },
        intern: {
          role: "intern",
          title: `Guided Triage: ${finding.title}`,
          summary: finding.summary,
          metrics: fallbackMetrics,
          keyFindings: ["Collect telemetry", "Verify baseline"],
          businessImpact: { operational: "Triage required", financial: "Minimal", compliance: "Verification needed", reputational: "None" },
          aiInsights: ["Educational triage guided flow"],
          recommendedActions: [
            {
              action: "Verify finding against baseline",
              riskReductionPercent: 50,
              estimatedCost: "₹0",
              estimatedEffort: "15 mins",
              priority: "MEDIUM",
              timeToImplement: "Today",
              rosi: "N/A",
              type: "Quick Win"
            }
          ],
          investmentOptimization: "Guided analyst verification.",
          complianceMappings: [
            { framework: "CIS Controls", controlId: "CIS-1", status: "Partial", impactDescription: "Inventory baseline check" }
          ],
          scenarios: {
            scenarioA_NoAction: { residualRisk: "Unverified", financialExposure: "Minimal", complianceImpact: "Pending" },
            scenarioB_Remediated: { residualRisk: "Verified clean", financialExposure: "₹0", complianceImpact: "Verified", expectedLossReduction: "50%" }
          },
          finalVerdict: "Perform step-by-step triage checklist.",
          keyInsights: ["Verify baseline threshold", "Collect evidence"],
          actionItems: ["Inspect evidence array", "Compare against baseline"],
          roleSpecificDetail: "Verify if finding observation exceeds baseline thresholds.",
          generatedAt: now
        },
        hr: {
          role: "hr",
          title: `Compliance Audit: ${finding.title}`,
          summary: finding.summary,
          metrics: fallbackMetrics,
          keyFindings: ["Access policy compliance", "Framework audit"],
          businessImpact: { operational: "Local workstation policy check", financial: "₹0 regulatory penalty", compliance: "Local policy gap", reputational: "None" },
          aiInsights: ["Governance review required"],
          recommendedActions: [
            {
              action: "Audit developer workstation access policies",
              riskReductionPercent: 80,
              estimatedCost: "₹0",
              estimatedEffort: "15 mins",
              priority: "HIGH",
              timeToImplement: "24 hours",
              rosi: "High",
              type: "Quick Win"
            }
          ],
          investmentOptimization: "Policy enforcement check.",
          complianceMappings: [
            { framework: "SEBI CSCRF", controlId: "CSCRF-Sec-3", status: "Partial", impactDescription: "Developer workstation baseline" }
          ],
          scenarios: {
            scenarioA_NoAction: { residualRisk: "Policy gap", financialExposure: "₹10,000", complianceImpact: "Minor observation" },
            scenarioB_Remediated: { residualRisk: "Compliant", financialExposure: "₹0", complianceImpact: "Passed", expectedLossReduction: "95%" }
          },
          finalVerdict: "Update access policy records for developer workstation.",
          keyInsights: ["Check employee access scope", "Review policy alignment"],
          actionItems: ["Audit privileged accounts"],
          roleSpecificDetail: "Confirm user access level adheres to enterprise security policy.",
          generatedAt: now
        },
        management: {
          role: "management",
          title: `Financial Risk Briefing: ${finding.title}`,
          summary: finding.summary,
          metrics: fallbackMetrics,
          keyFindings: ["Developer Laptop finding evaluated", "Zero net budget required"],
          businessImpact: { operational: "Zero production service impact", financial: "Expected Loss: ₹1,250/yr (Minimal)", compliance: "Local device baseline", reputational: "Zero brand impact" },
          aiInsights: ["High Return on Security Investment (ROSI) quick win"],
          recommendedActions: [
            {
              action: "Apply zero-cost local socket binding patch",
              riskReductionPercent: 95,
              estimatedCost: "₹0",
              estimatedEffort: "10 mins",
              priority: "HIGH",
              timeToImplement: "Immediate",
              rosi: "Infinite",
              type: "Quick Win"
            }
          ],
          investmentOptimization: "Zero-cost local fix eliminates 95% of risk.",
          complianceMappings: [
            { framework: "ISO/IEC 27001", controlId: "A.13.1.1", status: "Deficient", impactDescription: "Workstation endpoint security" }
          ],
          scenarios: {
            scenarioA_NoAction: { residualRisk: "Low (Local Machine)", financialExposure: "₹10,000 Max", complianceImpact: "Minor" },
            scenarioB_Remediated: { residualRisk: "Minimal Loss", financialExposure: "₹0 Residual", complianceImpact: "Fully Compliant", expectedLossReduction: "95% Loss Reduction" }
          },
          finalVerdict: "Developer laptop asset is safe; 10-minute zero-cost fix eliminates local exposure.",
          keyInsights: [`Severity ${finding.severity.toUpperCase()}`, `Asset: ${finding.resource?.name || "Host"}`],
          actionItems: ["Monitor remediation status"],
          roleSpecificDetail: "Security finding evaluated by AI Financial Risk Quantification Engine.",
          generatedAt: now
        }
      }
    };
  }
}
