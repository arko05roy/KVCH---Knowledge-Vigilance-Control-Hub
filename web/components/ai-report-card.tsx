"use client";

import type { RoleSecurityReport } from "@/lib/ai/report-generator";
import { SimpleMarkdownRenderer } from "./markdown-renderer";

interface AiReportDisplayCardProps {
  report: RoleSecurityReport;
  roleTitle: string;
}

export function AiReportDisplayCard({ report, roleTitle }: AiReportDisplayCardProps) {
  if (!report) return null;

  const isIntern = report.role === "intern";
  const metrics = report.metrics;
  const businessImpact = report.businessImpact;
  const actions = report.recommendedActions || [];
  const compliance = report.complianceMappings || [];
  const scenarios = report.scenarios;

  return (
    <div className="w-full bg-[#0c0d0e] border border-[#232529] rounded-xl p-5 flex flex-col space-y-5 transition-all">
      
      {/* Header Banner - Linear Minimal Style */}
      <div className="flex items-center justify-between border-b border-[#232529] pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#5e6ad2]" />
          <span className="text-[11px] font-mono text-[#8a8f98] uppercase tracking-wider">
            {roleTitle} Intelligence Brief
          </span>
          <span className="text-[#34373c]">·</span>
          <h3 className="text-[14px] font-semibold text-[#f7f8f8] tracking-tight">
            {report.title}
          </h3>
        </div>
        <span suppressHydrationWarning className="text-[11px] text-[#62666d] font-mono">
          {new Date(report.generatedAt).toLocaleTimeString()}
        </span>
      </div>

      {/* Summary Section */}
      <div className="bg-[#121316] border border-[#232529] rounded-lg p-4">
        <p className="text-[13px] text-[#d0d6e0] leading-relaxed">
          {report.summary}
        </p>
      </div>

      {/* Metrics Row - Role Specific (NO MONETARY EXPOSURE FOR INTERN) */}
      {metrics && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-[#121316] border border-[#232529] p-3.5 rounded-lg flex flex-col justify-between">
            <span className="text-[11px] font-medium text-[#8a8f98] uppercase tracking-wider">
              {isIntern ? "Triage Score" : "Likelihood Score"}
            </span>
            <div className="text-[18px] font-semibold text-[#f7f8f8] mt-1 font-mono">
              {metrics.likelihoodScore} <span className="text-[11px] text-[#62666d]">/ 100</span>
            </div>
          </div>

          {!isIntern ? (
            <>
              <div className="bg-[#121316] border border-[#232529] p-3.5 rounded-lg flex flex-col justify-between">
                <span className="text-[11px] font-medium text-[#8a8f98] uppercase tracking-wider">Expected Annual Loss (EAL)</span>
                <div className="text-[18px] font-semibold text-[#f7f8f8] mt-1 font-mono">
                  {metrics.financialExposure?.eal || "N/A"}
                </div>
              </div>
              <div className="bg-[#121316] border border-[#232529] p-3.5 rounded-lg flex flex-col justify-between">
                <span className="text-[11px] font-medium text-[#8a8f98] uppercase tracking-wider">Max Financial Exposure</span>
                <div className="text-[18px] font-semibold text-[#f7f8f8] mt-1 font-mono">
                  {metrics.financialExposure?.max || "N/A"}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-[#121316] border border-[#232529] p-3.5 rounded-lg flex flex-col justify-between">
                <span className="text-[11px] font-medium text-[#8a8f98] uppercase tracking-wider">Learning Focus</span>
                <div className="text-[13px] font-medium text-[#828fff] mt-1 truncate">
                  Supply Chain & Shell
                </div>
              </div>
              <div className="bg-[#121316] border border-[#232529] p-3.5 rounded-lg flex flex-col justify-between">
                <span className="text-[11px] font-medium text-[#8a8f98] uppercase tracking-wider">Triage Status</span>
                <div className="text-[13px] font-medium text-[#2ea043] mt-1">
                  In Progress (50%)
                </div>
              </div>
            </>
          )}

          <div className="bg-[#121316] border border-[#232529] p-3.5 rounded-lg flex flex-col justify-between">
            <span className="text-[11px] font-medium text-[#8a8f98] uppercase tracking-wider">Risk Trend</span>
            <div className="text-[14px] font-medium text-[#f2c94c] mt-1 flex items-center gap-1.5">
              <span>↗</span> {metrics.riskTrend}
            </div>
          </div>
        </div>
      )}

      {/* Business & Operational Impact */}
      {businessImpact && (
        <div className="bg-[#121316] border border-[#232529] p-4 rounded-lg">
          <h4 className="text-[11px] font-semibold text-[#8a8f98] uppercase tracking-wider mb-2.5">
            {isIntern ? "Operational & Learning Impact" : "Business & Operational Impact"}
          </h4>
          <div className="grid grid-cols-2 gap-3 text-[12.5px]">
            <div>
              <strong className="text-[#8a8f98]">Operational:</strong>{" "}
              <span className="text-[#d0d6e0]">{businessImpact.operational}</span>
            </div>
            {!isIntern && (
              <div>
                <strong className="text-[#8a8f98]">Financial:</strong>{" "}
                <span className="text-[#d0d6e0]">{businessImpact.financial}</span>
              </div>
            )}
            <div>
              <strong className="text-[#8a8f98]">Compliance:</strong>{" "}
              <span className="text-[#d0d6e0]">{businessImpact.compliance}</span>
            </div>
            <div>
              <strong className="text-[#8a8f98]">Reputational:</strong>{" "}
              <span className="text-[#d0d6e0]">{businessImpact.reputational}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Items */}
      {actions.length > 0 && (
        <div className="bg-[#121316] border border-[#232529] p-4 rounded-lg space-y-2.5">
          <h4 className="text-[11px] font-semibold text-[#8a8f98] uppercase tracking-wider mb-1">
            {isIntern ? "Guided Triage Actions" : "Prioritized Remediation Actions"}
          </h4>
          <div className="space-y-2">
            {actions.map((act, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#0c0d0e] border border-[#232529] rounded flex items-center justify-between text-[12.5px]"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-[#f7f8f8]">{act.action}</span>
                  <span className="text-[#8a8f98] text-[11px] mt-0.5">
                    Type: {act.type} · Effort: {act.estimatedEffort} {!isIntern && `· Cost: ${act.estimatedCost}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#2ea043]/10 text-[#2ea043] border border-[#2ea043]/30 text-[10.5px] font-mono rounded">
                    Reduction: {act.riskReductionPercent}%
                  </span>
                  {!isIntern && (
                    <span className="px-2 py-0.5 bg-[#5e6ad2]/10 text-[#828fff] border border-[#5e6ad2]/30 text-[10.5px] font-mono rounded">
                      ROSI: {act.rosi}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regulatory Framework Mappings */}
      {compliance.length > 0 && (
        <div className="bg-[#121316] border border-[#232529] p-4 rounded-lg">
          <h4 className="text-[11px] font-semibold text-[#8a8f98] uppercase tracking-wider mb-2">
            Regulatory Framework Coverage
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            {compliance.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-[#0c0d0e] border border-[#232529] rounded flex items-start justify-between"
              >
                <div>
                  <span className="font-medium text-[#f7f8f8]">
                    {item.framework} <span className="text-[#8a8f98] font-mono">({item.controlId})</span>
                  </span>
                  <p className="text-[#8a8f98] text-[11px] mt-0.5">{item.impactDescription}</p>
                </div>
                <span className="px-2 py-0.5 bg-[#ff5555]/10 text-[#ff5555] border border-[#ff5555]/30 text-[10px] font-mono rounded uppercase">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scenario Analysis (Hiding financial values for intern) */}
      {scenarios && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#121316] border border-[#232529] p-3.5 rounded-lg">
            <h4 className="text-[11px] font-semibold text-[#ff5555] uppercase tracking-wider mb-1.5">
              Scenario A: No Action Taken
            </h4>
            <p className="text-[12px] text-[#8a8f98]">
              <strong>Residual Risk:</strong> {scenarios.scenarioA_NoAction?.residualRisk}
            </p>
            {!isIntern && (
              <p className="text-[12px] text-[#8a8f98] mt-0.5">
                <strong>Financial Loss:</strong> {scenarios.scenarioA_NoAction?.financialExposure}
              </p>
            )}
          </div>
          <div className="bg-[#121316] border border-[#232529] p-3.5 rounded-lg">
            <h4 className="text-[11px] font-semibold text-[#2ea043] uppercase tracking-wider mb-1.5">
              Scenario B: Controls Implemented
            </h4>
            <p className="text-[12px] text-[#8a8f98]">
              <strong>Residual Risk:</strong> {scenarios.scenarioB_Remediated?.residualRisk}
            </p>
            <p className="text-[12px] text-[#8a8f98] mt-0.5">
              <strong>Expected Benefit:</strong> {scenarios.scenarioB_Remediated?.expectedLossReduction}
            </p>
          </div>
        </div>
      )}

      {/* Verdict */}
      {report.finalVerdict && (
        <div className="p-3.5 bg-[#121316] border border-[#232529] rounded-lg">
          <h4 className="text-[11px] font-semibold text-[#f2c94c] uppercase tracking-wider mb-1">
            Verdict & Recommendation
          </h4>
          <p className="text-[12.5px] text-[#d0d6e0] leading-relaxed font-medium">
            {report.finalVerdict}
          </p>
        </div>
      )}

      {/* Role Specific Technical Detail - CLEAN MARKDOWN PARSED */}
      {report.roleSpecificDetail && (
        <div className="bg-[#121316] border border-[#232529] p-4 rounded-lg">
          <h4 className="text-[11px] font-semibold text-[#8a8f98] uppercase tracking-wider mb-3 border-b border-[#232529] pb-2">
            Role Technical Directives & Walkthrough
          </h4>
          <SimpleMarkdownRenderer content={report.roleSpecificDetail} />
        </div>
      )}

    </div>
  );
}
