"use client";

import type { RoleSecurityReport } from "@/lib/ai/report-generator";

interface AiReportDisplayCardProps {
  report: RoleSecurityReport;
  roleTitle: string;
}

export function AiReportDisplayCard({ report, roleTitle }: AiReportDisplayCardProps) {
  if (!report) return null;

  const metrics = report.metrics;
  const businessImpact = report.businessImpact;
  const actions = report.recommendedActions || [];
  const compliance = report.complianceMappings || [];
  const scenarios = report.scenarios;

  return (
    <div className="mx-8 mb-6 p-6 bg-[#161922] border border-[#3b82f6]/40 rounded-xl flex flex-col shadow-2xl transition-all">
      {/* Header Badge */}
      <div className="flex items-center justify-between mb-4 border-b border-[#2b354f] pb-3">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-[#2563eb] text-white text-[11px] font-bold rounded uppercase tracking-wider shadow">
            Live AI Risk Economics Briefing ({roleTitle})
          </span>
          <h3 className="text-[15px] font-semibold text-white tracking-tight">{report.title}</h3>
        </div>
        <span className="text-[11px] text-[#858688] font-mono">
          Generated: {new Date(report.generatedAt).toLocaleTimeString()}
        </span>
      </div>

      {/* Summary */}
      <p className="text-[14px] text-[#d1d5db] mb-5 leading-relaxed bg-[#0d111a] p-3.5 rounded-lg border border-[#1e293b]">
        {report.summary}
      </p>

      {/* Financial Risk Metrics Banner */}
      {metrics && (
        <div className="grid grid-cols-4 gap-3 mb-5">
          <div className="bg-[#0f172a] p-3.5 rounded-lg border border-[#1e293b]">
            <span className="text-[11px] font-medium text-[#858688] uppercase tracking-wider">Likelihood Score</span>
            <div className="text-[20px] font-bold text-[#f59e0b] mt-1">{metrics.likelihoodScore} / 100</div>
          </div>
          <div className="bg-[#0f172a] p-3.5 rounded-lg border border-[#1e293b]">
            <span className="text-[11px] font-medium text-[#858688] uppercase tracking-wider">Expected Annual Loss (EAL)</span>
            <div className="text-[20px] font-bold text-[#ef4444] mt-1">{metrics.financialExposure?.eal || "N/A"}</div>
          </div>
          <div className="bg-[#0f172a] p-3.5 rounded-lg border border-[#1e293b]">
            <span className="text-[11px] font-medium text-[#858688] uppercase tracking-wider">Max Financial Exposure</span>
            <div className="text-[20px] font-bold text-[#f43f5e] mt-1">{metrics.financialExposure?.max || "N/A"}</div>
          </div>
          <div className="bg-[#0f172a] p-3.5 rounded-lg border border-[#1e293b]">
            <span className="text-[11px] font-medium text-[#858688] uppercase tracking-wider">Risk Exposure Trend</span>
            <div className="text-[20px] font-bold text-[#38bdf8] mt-1">{metrics.riskTrend}</div>
          </div>
        </div>
      )}

      {/* Business Impact Grid */}
      {businessImpact && (
        <div className="mb-5 bg-[#0d111a] p-4 rounded-lg border border-[#1e293b]">
          <h4 className="text-[12px] font-bold text-[#93c5fd] uppercase tracking-wider mb-2">Business & Monetary Impact</h4>
          <div className="grid grid-cols-2 gap-3 text-[12.5px]">
            <div><strong className="text-[#94a3b8]">Operational:</strong> <span className="text-[#cbd5e1]">{businessImpact.operational}</span></div>
            <div><strong className="text-[#94a3b8]">Financial:</strong> <span className="text-[#cbd5e1]">{businessImpact.financial}</span></div>
            <div><strong className="text-[#94a3b8]">Compliance:</strong> <span className="text-[#cbd5e1]">{businessImpact.compliance}</span></div>
            <div><strong className="text-[#94a3b8]">Reputational:</strong> <span className="text-[#cbd5e1]">{businessImpact.reputational}</span></div>
          </div>
        </div>
      )}

      {/* Action Items with ROSI */}
      {actions.length > 0 && (
        <div className="mb-5 bg-[#0d111a] p-4 rounded-lg border border-[#1e293b]">
          <h4 className="text-[12px] font-bold text-[#34d399] uppercase tracking-wider mb-3">Prioritized Remediation & ROSI</h4>
          <div className="space-y-2.5">
            {actions.map((act, idx) => (
              <div key={idx} className="p-3 bg-[#161e2e] rounded border border-[#23324c] flex items-center justify-between text-[12.5px]">
                <div className="flex flex-col">
                  <span className="font-semibold text-white">{act.action}</span>
                  <span className="text-[#94a3b8] text-[11.5px]">Type: {act.type} · Effort: {act.estimatedEffort} · Cost: {act.estimatedCost}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-[#059669]/20 text-[#34d399] text-[11px] font-bold rounded border border-[#059669]/30">
                    Risk Reduction: {act.riskReductionPercent}%
                  </span>
                  <span className="px-2 py-0.5 bg-[#3b82f6]/20 text-[#60a5fa] text-[11px] font-bold rounded border border-[#3b82f6]/30">
                    ROSI: {act.rosi}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Framework Mappings */}
      {compliance.length > 0 && (
        <div className="mb-5 bg-[#0d111a] p-4 rounded-lg border border-[#1e293b]">
          <h4 className="text-[12px] font-bold text-[#a78bfa] uppercase tracking-wider mb-2">Regulatory Framework Mappings</h4>
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            {compliance.map((item, idx) => (
              <div key={idx} className="p-2.5 bg-[#17162b] rounded border border-[#2b2850] flex items-start justify-between">
                <div>
                  <span className="font-semibold text-[#c084fc]">{item.framework} ({item.controlId})</span>
                  <p className="text-[#94a3b8] text-[11.5px] mt-0.5">{item.impactDescription}</p>
                </div>
                <span className="px-2 py-0.5 bg-[#ef4444]/20 text-[#f87171] text-[10px] font-bold rounded uppercase">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scenario Analysis */}
      {scenarios && (
        <div className="mb-5 grid grid-cols-2 gap-4">
          <div className="bg-[#1c1417] p-3.5 rounded-lg border border-[#4a1d24]">
            <h4 className="text-[12px] font-bold text-[#f87171] uppercase tracking-wider mb-2">Scenario A: No Action Taken</h4>
            <p className="text-[12px] text-[#fca5a5]"><strong>Residual Risk:</strong> {scenarios.scenarioA_NoAction?.residualRisk}</p>
            <p className="text-[12px] text-[#fca5a5]"><strong>Financial Loss:</strong> {scenarios.scenarioA_NoAction?.financialExposure}</p>
          </div>
          <div className="bg-[#12221b] p-3.5 rounded-lg border border-[#1a4d36]">
            <h4 className="text-[12px] font-bold text-[#34d399] uppercase tracking-wider mb-2">Scenario B: Controls Implemented</h4>
            <p className="text-[12px] text-[#6ee7b7]"><strong>Residual Risk:</strong> {scenarios.scenarioB_Remediated?.residualRisk}</p>
            <p className="text-[12px] text-[#6ee7b7]"><strong>Loss Reduction:</strong> {scenarios.scenarioB_Remediated?.expectedLossReduction}</p>
          </div>
        </div>
      )}

      {/* Final Verdict */}
      {report.finalVerdict && (
        <div className="p-3.5 bg-[#0f172a] rounded-lg border border-[#1e293b] mb-4">
          <h4 className="text-[12px] font-bold text-[#fbbf24] uppercase tracking-wider mb-1">Final Risk Economist Verdict</h4>
          <p className="text-[13px] text-[#fef08a] leading-relaxed font-medium">{report.finalVerdict}</p>
        </div>
      )}

      {/* Role Specific Technical Detail */}
      <div className="bg-[#0b0f19] p-4 rounded-lg border border-[#1e293b]">
        <h4 className="text-[12px] font-bold text-[#a78bfa] uppercase tracking-wider mb-1">Role Specific Technical & Action Directive</h4>
        <pre className="text-[12.5px] text-[#e2e8f0] font-mono whitespace-pre-wrap leading-relaxed">{report.roleSpecificDetail}</pre>
      </div>
    </div>
  );
}
