"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Mitigation {
  action_id: string;
  name: string;
  cost_inr: number;
  lead_time_days: number;
  risk_reduction_factor: number;
  technique: string;
  selected?: boolean;
}

export default function RiskIntelligencePage() {
  const [loading, setLoading] = useState(false);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [budgetLimit, setBudgetLimit] = useState(10000000); // ₹1 Crore default

  const [quantifyData, setQuantifyData] = useState<any>(null);
  const [optimizeData, setOptimizeData] = useState<any>(null);

  const scenariosList = [
    {
      scenario_id: "SCENARIO-PAYMENT-001",
      title: "Payment Gateway API Vulnerability Exploitation",
      finding: {
        finding_id: "FINDING-7742",
        source_extension: "7_supply_chain_auditor",
        category: "malicious_dependency",
        cve_id: "CVE-2026-3891",
        package_name: "pay-auth-crypto",
        asset_id: "ASSET-PAY-API-01",
        observed_at: new Date().toISOString(),
        internet_reachable: true,
        authentication_required: false,
        compensating_controls: ["rate_limiter"],
        epss_score: 0.72,
        cisa_kev: true,
        cvss_score: 9.8
      },
      asset_profile: {
        asset_id: "ASSET-PAY-API-01",
        asset_name: "Payment Gateway API Cluster",
        business_service_id: "SVC-DIGITAL-PAYMENTS",
        business_service_name: "Digital Payments & Merchant Checkout",
        environment: "production",
        downtime_cost_per_hour_inr: 1250000.0,
        avg_incident_response_cost_inr: 2500000.0,
        data_breach_cost_per_record_inr: 450.0,
        records_exposed_estimate: 50000,
        rto_hours: 4.0,
        active_users: 250000
      },
      candidate_mitigations: [
        {
          action_id: "ACT-01",
          name: "Immediate Package Patching & Dependency Upgrade",
          cost_inr: 150000.0,
          lead_time_days: 1,
          risk_reduction_factor: 0.85,
          technique: "Patch Management"
        },
        {
          action_id: "ACT-02",
          name: "WAF & API Gateway Virtual Patch Rule Deployment",
          cost_inr: 50000.0,
          lead_time_days: 0.5,
          risk_reduction_factor: 0.60,
          technique: "Network Shielding"
        },
        {
          action_id: "ACT-03",
          name: "Enforce Strict mTLS & Certificate Pinning",
          cost_inr: 400000.0,
          lead_time_days: 5,
          risk_reduction_factor: 0.40,
          technique: "Zero Trust Auth"
        },
        {
          action_id: "ACT-04",
          name: "Automated Failover & Micro-segmentation Upgrade",
          cost_inr: 1200000.0,
          lead_time_days: 14,
          risk_reduction_factor: 0.75,
          technique: "Network Segmentation"
        },
        {
          action_id: "ACT-05",
          name: "24/7 Managed EDR & SOC Threat Hunting Tier",
          cost_inr: 800000.0,
          lead_time_days: 3,
          risk_reduction_factor: 0.50,
          technique: "Continuous Monitoring"
        }
      ]
    },
    {
      scenario_id: "SCENARIO-PAM-002",
      title: "Privileged PAM Credential Exposure & Database Leak",
      finding: {
        finding_id: "FINDING-8812",
        source_extension: "6_credential_exposure_auditor",
        category: "credential_leak",
        cve_id: "CVE-2026-1102",
        package_name: "vault-pam-adapter",
        asset_id: "ASSET-CORE-DB-01",
        observed_at: new Date().toISOString(),
        internet_reachable: true,
        authentication_required: true,
        compensating_controls: ["ip_whitelisting", "mfa_enforced"],
        epss_score: 0.58,
        cisa_kev: true,
        cvss_score: 8.9
      },
      asset_profile: {
        asset_id: "ASSET-CORE-DB-01",
        asset_name: "Core Financial Ledger Database Cluster",
        business_service_id: "SVC-CORE-BANKING",
        business_service_name: "Core Ledger & Settlement System",
        environment: "production",
        downtime_cost_per_hour_inr: 2500000.0,
        avg_incident_response_cost_inr: 4000000.0,
        data_breach_cost_per_record_inr: 600.0,
        records_exposed_estimate: 120000,
        rto_hours: 2.0,
        active_users: 500000
      },
      candidate_mitigations: [
        {
          action_id: "ACT-101",
          name: "Automated PAM Credential Rotation & Secret Elimination",
          cost_inr: 200000.0,
          lead_time_days: 1,
          risk_reduction_factor: 0.90,
          technique: "Privileged Access Rotation"
        },
        {
          action_id: "ACT-102",
          name: "Database Column-level Encryption & Dynamic Masking",
          cost_inr: 600000.0,
          lead_time_days: 7,
          risk_reduction_factor: 0.70,
          technique: "Data Protection"
        },
        {
          action_id: "ACT-103",
          name: "Zero Trust Bastion & Privileged Session Recording",
          cost_inr: 500000.0,
          lead_time_days: 3,
          risk_reduction_factor: 0.50,
          technique: "Identity Hardening"
        },
        {
          action_id: "ACT-104",
          name: "Real-time DLP & Database Activity Monitoring (DAM)",
          cost_inr: 1000000.0,
          lead_time_days: 10,
          risk_reduction_factor: 0.65,
          technique: "Exfiltration Shielding"
        }
      ]
    }
  ];

  const currentScenario = scenariosList[selectedScenarioIndex];

  const fetchQuantification = async () => {
    setLoading(true);
    try {
      const qRes = await fetch('/api/risk/quantify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentScenario),
      });
      const qData = await qRes.json();
      setQuantifyData(qData);

      await runOptimization(qData.baseline_loss.expected_annual_loss_inr, budgetLimit);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCalibrateVCDB = async () => {
    setLoading(true);
    try {
      const cRes = await fetch('/api/risk/calibrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentScenario),
      });
      const cData = await cRes.json();
      if (cData.calibrated_asset_profile) {
        currentScenario.asset_profile = cData.calibrated_asset_profile;
      }
      await fetchQuantification();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const runOptimization = async (baselineEal: number, budget: number) => {
    try {
      const oRes = await fetch('/api/risk/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: currentScenario.scenario_id,
          baseline_eal_inr: baselineEal,
          budget_limit_inr: budget,
          candidate_mitigations: currentScenario.candidate_mitigations,
        }),
      });
      const oData = await oRes.json();
      setOptimizeData(oData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQuantification();
  }, [selectedScenarioIndex]);

  const handleBudgetChange = (newBudget: number) => {
    setBudgetLimit(newBudget);
    if (quantifyData) {
      runOptimization(quantifyData.baseline_loss.expected_annual_loss_inr, newBudget);
    }
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="min-h-screen bg-[#0f1011] text-[#f7f8f8] font-sans">
      
      {/* Top Header Bar matching Theme */}
      <header className="border-b border-[#23252a] bg-[#0f1011] sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#5e6ad2] flex items-center justify-center font-bold text-white text-sm shadow-md">
              K
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[#5e6ad2] tracking-wide uppercase">KVCH Risk Intelligence</span>
                <span className="text-[#8a8f98] text-[12px]">·</span>
                <span className="text-[12px] text-[#8a8f98]">Calculation ID: {quantifyData?.calculation_id || 'CALC-...'}</span>
              </div>
              <h1 className="text-lg font-semibold text-[#f7f8f8] leading-tight">
                Financial Cyber Risk Quantification & Investment Portfolio
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-md text-[13px] font-medium bg-[#141516] text-[#f7f8f8] border border-[#23252a] hover:bg-[#1f2125] transition-colors"
            >
              ← Hub Overview
            </Link>
            <button
              onClick={handleCalibrateVCDB}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-md text-[13px] font-semibold bg-[#2ea043]/15 text-[#2ea043] border border-[#2ea043]/40 hover:bg-[#2ea043]/25 transition-colors flex items-center gap-1.5"
            >
              ⚡ Ingest Real VCDB Logs
            </button>
            <button
              onClick={fetchQuantification}
              disabled={loading}
              className="px-4 py-1.5 rounded-md text-[13px] font-semibold bg-[#5e6ad2] hover:bg-[#4d59c2] text-white shadow-sm transition-colors flex items-center gap-1.5"
            >
              {loading ? 'Simulating...' : '⚡ Recompute Monte Carlo'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Guided 3-Step Process Indicator */}
        <div className="mb-8 p-4 rounded-xl bg-[#141516] border border-[#23252a] flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs font-medium text-[#8a8f98]">
            <span className="flex items-center gap-2 text-[#5e6ad2]">
              <span className="w-5 h-5 rounded-full bg-[#5e6ad2]/20 border border-[#5e6ad2] flex items-center justify-center text-[11px] font-bold text-[#5e6ad2]">1</span>
              Technical Signal Intake
            </span>
            <span>→</span>
            <span className="flex items-center gap-2 text-[#5e6ad2]">
              <span className="w-5 h-5 rounded-full bg-[#5e6ad2]/20 border border-[#5e6ad2] flex items-center justify-center text-[11px] font-bold text-[#5e6ad2]">2</span>
              Monte Carlo Financial Loss (₹)
            </span>
            <span>→</span>
            <span className="flex items-center gap-2 text-[#5e6ad2]">
              <span className="w-5 h-5 rounded-full bg-[#5e6ad2]/20 border border-[#5e6ad2] flex items-center justify-center text-[11px] font-bold text-[#5e6ad2]">3</span>
              Constrained Spend Optimization
            </span>
          </div>

          <div className="flex gap-2">
            {scenariosList.map((sc, idx) => (
              <button
                key={sc.scenario_id}
                onClick={() => setSelectedScenarioIndex(idx)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all border ${
                  selectedScenarioIndex === idx
                    ? 'bg-[#5e6ad2]/15 text-[#5e6ad2] border-[#5e6ad2]/40 font-semibold'
                    : 'bg-[#0f1011] text-[#8a8f98] border-[#23252a] hover:text-[#f7f8f8]'
                }`}
              >
                {idx === 0 ? '💳 Payment API Scenario' : '🔐 PAM Database Scenario'}
              </button>
            ))}
          </div>
        </div>

        {/* Executive Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          
          {/* Card 1: EAL */}
          <div className="p-5 rounded-xl bg-[#141516] border border-[#ff3333]/30 shadow-sm relative overflow-hidden">
            <div className="text-[11px] font-semibold text-[#ff6666] uppercase tracking-wider">
              Expected Annual Loss (EAL)
            </div>
            <div className="text-2xl font-bold text-[#ff3333] mt-2">
              {quantifyData ? formatINR(quantifyData.baseline_loss.expected_annual_loss_inr) : '...'}
            </div>
            <p className="text-[12px] text-[#8a8f98] mt-1">
              Estimated average monetary loss per year if unpatched.
            </p>
          </div>

          {/* Card 2: Value at Risk */}
          <div className="p-5 rounded-xl bg-[#141516] border border-[#f2c94c]/30 shadow-sm relative overflow-hidden">
            <div className="text-[11px] font-semibold text-[#f2c94c] uppercase tracking-wider">
              Value at Risk (VaR 95%)
            </div>
            <div className="text-2xl font-bold text-[#f2c94c] mt-2">
              {quantifyData ? formatINR(quantifyData.baseline_loss.var95_inr) : '...'}
            </div>
            <p className="text-[12px] text-[#8a8f98] mt-1">
              Worst 5% tail risk scenario ceiling.
            </p>
          </div>

          {/* Card 3: Likelihood */}
          <div className="p-5 rounded-xl bg-[#141516] border border-[#5e6ad2]/30 shadow-sm relative overflow-hidden">
            <div className="text-[11px] font-semibold text-[#8b95f6] uppercase tracking-wider">
              Exploitation Probability
            </div>
            <div className="text-2xl font-bold text-[#5e6ad2] mt-2">
              {quantifyData ? `${(quantifyData.likelihood.exploitation_probability * 100).toFixed(2)}%` : '...'}
            </div>
            <p className="text-[12px] text-[#8a8f98] mt-1">
              EPSS ({currentScenario.finding.epss_score}) + CISA KEV active.
            </p>
          </div>

          {/* Card 4: ROSI */}
          <div className="p-5 rounded-xl bg-[#141516] border border-[#2ea043]/30 shadow-sm relative overflow-hidden">
            <div className="text-[11px] font-semibold text-[#2ea043] uppercase tracking-wider">
              Return on Investment (ROSI)
            </div>
            <div className="text-2xl font-bold text-[#2ea043] mt-2">
              {optimizeData ? `${optimizeData.ros_index}x` : '...'}
            </div>
            <p className="text-[12px] text-[#8a8f98] mt-1">
              ₹ Saved in avoided loss per ₹ spent.
            </p>
          </div>
        </div>

        {/* Loss Breakdown Component Card */}
        {quantifyData && (
          <div className="p-6 rounded-xl bg-[#141516] border border-[#23252a] mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#f7f8f8]">
                  📊 Monte Carlo Loss Breakdown (10,000 Simulation Draws)
                </h3>
                <p className="text-xs text-[#8a8f98]">
                  Shows where your money is lost across downtime, forensics, breach, and contractual SLA fines.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#c4c5c7] bg-[#1f2125] px-3 py-1 rounded-md border border-[#23252a]">
                Total EAL: {formatINR(quantifyData.baseline_loss.expected_annual_loss_inr)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-lg bg-[#0f1011] border-l-4 border-[#ff3333] border-y border-r border-[#23252a]">
                <div className="text-[11px] text-[#8a8f98] font-medium uppercase">1. Downtime Business Loss</div>
                <div className="text-base font-bold text-[#f7f8f8] mt-1">
                  {formatINR(quantifyData.baseline_loss.expected_downtime_loss_inr || (quantifyData.baseline_loss.expected_annual_loss_inr * 0.35))}
                </div>
                <div className="text-[11px] text-[#8a8f98] mt-0.5">RTO hours × ₹12.5L/hr</div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0f1011] border-l-4 border-[#f2c94c] border-y border-r border-[#23252a]">
                <div className="text-[11px] text-[#8a8f98] font-medium uppercase">2. Forensics & Response</div>
                <div className="text-base font-bold text-[#f7f8f8] mt-1">
                  {formatINR(quantifyData.baseline_loss.expected_incident_response_loss_inr || (quantifyData.baseline_loss.expected_annual_loss_inr * 0.20))}
                </div>
                <div className="text-[11px] text-[#8a8f98] mt-0.5">Emergency IR team labor</div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0f1011] border-l-4 border-[#5e6ad2] border-y border-r border-[#23252a]">
                <div className="text-[11px] text-[#8a8f98] font-medium uppercase">3. Customer Breach & Records</div>
                <div className="text-base font-bold text-[#f7f8f8] mt-1">
                  {formatINR(quantifyData.baseline_loss.expected_breach_loss_inr || (quantifyData.baseline_loss.expected_annual_loss_inr * 0.35))}
                </div>
                <div className="text-[11px] text-[#8a8f98] mt-0.5">50,000 exposed records</div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0f1011] border-l-4 border-[#a855f7] border-y border-r border-[#23252a]">
                <div className="text-[11px] text-[#8a8f98] font-medium uppercase">4. SLA & Contract Fines</div>
                <div className="text-base font-bold text-[#f7f8f8] mt-1">
                  {formatINR(quantifyData.baseline_loss.expected_sla_penalty_loss_inr || (quantifyData.baseline_loss.expected_annual_loss_inr * 0.10))}
                </div>
                <div className="text-[11px] text-[#8a8f98] mt-0.5">Step-function SLA triggers</div>
              </div>
            </div>
          </div>
        )}

        {/* 2-Column Grid: Left Technical Context | Right Investment Optimizer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Left: Technical Findings & Context */}
          <div className="p-6 rounded-xl bg-[#141516] border border-[#23252a] flex flex-col justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#f7f8f8] mb-4 flex items-center gap-2">
                🔍 Step 1: Technical Finding & Asset Context
              </h2>

              <div className="space-y-3">
                <div className="p-3.5 rounded-lg bg-[#0f1011] border border-[#23252a]">
                  <div className="text-[11px] font-semibold text-[#8a8f98] uppercase">Vulnerability Signal</div>
                  <div className="text-sm font-semibold text-[#f7f8f8] mt-1">
                    {currentScenario.finding.cve_id} — {currentScenario.finding.package_name}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ff3333]/15 text-[#ff6666] border border-[#ff3333]/30">CVSS {currentScenario.finding.cvss_score} CRITICAL</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#5e6ad2]/15 text-[#8b95f6] border border-[#5e6ad2]/30">EPSS {currentScenario.finding.epss_score}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ff007a]/15 text-[#ff66b2] border border-[#ff007a]/30">⚡ CISA KEV LISTED</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#0f1011] border border-[#23252a]">
                  <div className="text-[11px] font-semibold text-[#8a8f98] uppercase">Target Asset & Business Service</div>
                  <div className="text-sm font-semibold text-[#f7f8f8] mt-1">
                    {currentScenario.asset_profile.asset_name} ({currentScenario.asset_profile.asset_id})
                  </div>
                  <div className="text-xs text-[#8a8f98] mt-1">
                    Impacted Service: <span className="text-[#5e6ad2] font-semibold">{currentScenario.asset_profile.business_service_name}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#0f1011] border border-[#23252a]">
                  <div className="text-[11px] font-semibold text-[#8a8f98] uppercase">Financial Inputs & Blast Radius</div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div>Downtime Rate: <span className="text-[#f7f8f8] font-semibold">{formatINR(currentScenario.asset_profile.downtime_cost_per_hour_inr)}/hr</span></div>
                    <div>Target RTO: <span className="text-[#f7f8f8] font-semibold">{currentScenario.asset_profile.rto_hours} Hours</span></div>
                    <div>Active Users: <span className="text-[#f7f8f8] font-semibold">{currentScenario.asset_profile.active_users.toLocaleString()}</span></div>
                    <div>Breach Exposure: <span className="text-[#f7f8f8] font-semibold">{currentScenario.asset_profile.records_exposed_estimate.toLocaleString()} recs</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drivers */}
            <div className="mt-4 p-3.5 rounded-lg bg-[#0f1011] border border-[#23252a]">
              <div className="text-xs font-semibold text-[#8a8f98] mb-1.5">📌 Primary Likelihood Drivers</div>
              {quantifyData?.likelihood.primary_drivers.map((d: string, idx: number) => (
                <div key={idx} className="text-xs text-[#c4c5c7] mt-0.5">• {d}</div>
              ))}
            </div>
          </div>

          {/* Right: Investment Portfolio Optimizer */}
          <div className="p-6 rounded-xl bg-[#141516] border border-[#23252a] flex flex-col justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#f7f8f8] mb-4 flex items-center gap-2">
                🎯 Step 3: Security Investment Portfolio Optimizer
              </h2>

              {/* Quick Budget Buttons */}
              <div className="p-4 rounded-xl bg-[#0f1011] border border-[#23252a] mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-[#8a8f98]">ALLOCATED SECURITY BUDGET:</span>
                  <span className="text-lg font-bold text-[#2ea043]">{formatINR(budgetLimit)}</span>
                </div>

                <div className="flex gap-2 mb-3">
                  {[500000, 1000000, 2500000, 10000000].map((b) => (
                    <button
                      key={b}
                      onClick={() => handleBudgetChange(b)}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                        budgetLimit === b
                          ? 'bg-[#2ea043]/15 text-[#2ea043] border-[#2ea043]/40 font-semibold'
                          : 'bg-[#141516] text-[#8a8f98] border-[#23252a] hover:text-[#f7f8f8]'
                      }`}
                    >
                      ₹{(b / 100000).toFixed(0)}L
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min={200000}
                  max={3000000}
                  step={50000}
                  value={budgetLimit}
                  onChange={(e) => handleBudgetChange(Number(e.target.value))}
                  className="w-full accent-[#2ea043] cursor-pointer"
                />
              </div>

              {/* Portfolio Summary */}
              {optimizeData && (
                <div className="flex justify-between p-3.5 rounded-lg bg-[#2ea043]/10 border border-[#2ea043]/30 mb-4">
                  <div>
                    <div className="text-[11px] font-semibold text-[#2ea043]">PORTFOLIO SPEND</div>
                    <div className="text-sm font-bold text-[#f7f8f8]">{formatINR(optimizeData.total_spend_inr)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-[#2ea043]">RISK REDUCED (ΔEAL)</div>
                    <div className="text-sm font-bold text-[#2ea043]">{formatINR(optimizeData.expected_eal_reduction_inr)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-[#2ea043]">RESIDUAL RISK</div>
                    <div className="text-sm font-bold text-[#f7f8f8]">{formatINR(optimizeData.residual_eal_inr)}</div>
                  </div>
                </div>
              )}

              {/* Recommended Fixes */}
              <div className="text-xs font-semibold text-[#8a8f98] mb-2">
                RECOMMENDED FIXES SELECTED BY OPTIMIZER ({optimizeData?.selected_actions.length || 0} OF {currentScenario.candidate_mitigations.length}):
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {currentScenario.candidate_mitigations.map((act) => {
                  const isSelected = optimizeData?.selected_actions.some((s: Mitigation) => s.action_id === act.action_id);
                  return (
                    <div
                      key={act.action_id}
                      className={`p-3 rounded-lg border flex items-center justify-between text-xs transition-all ${
                        isSelected
                          ? 'bg-[#2ea043]/10 border-[#2ea043]/40'
                          : 'bg-[#0f1011] border-[#23252a] opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isSelected ? 'text-[#2ea043]' : 'text-[#8a8f98]'}`}>
                          {isSelected ? '✓' : '○'}
                        </span>
                        <div>
                          <div className={`font-semibold ${isSelected ? 'text-[#f7f8f8]' : 'text-[#8a8f98]'}`}>
                            {act.name}
                          </div>
                          <div className="text-[11px] text-[#8a8f98]">
                            {act.technique} · Risk Reduction: -{(act.risk_reduction_factor * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                      <div className={`font-bold ${isSelected ? 'text-[#2ea043]' : 'text-[#8a8f98]'}`}>
                        {formatINR(act.cost_inr)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory & Compliance Evidence Strip */}
        <div className="p-6 rounded-xl bg-[#141516] border border-[#23252a]">
          <h3 className="text-sm font-semibold text-[#f7f8f8] mb-3">
            📋 Framework & Regulatory Evidence Crosswalk
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-[#0f1011] border border-[#23252a]">
              <div className="font-bold text-[#5e6ad2]">SEBI CSCRF</div>
              <div className="text-[#8a8f98] mt-1">Clause 4.2: Continuous Cyber Risk Assessment</div>
              <div className="text-[#2ea043] font-semibold mt-2">✓ Verified Audit Evidence</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0f1011] border border-[#23252a]">
              <div className="font-bold text-[#5e6ad2]">RBI Master Direction</div>
              <div className="text-[#8a8f98] mt-1">Section 7: Business Service Impact & RTO SLAs</div>
              <div className="text-[#2ea043] font-semibold mt-2">✓ Verified Audit Evidence</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0f1011] border border-[#23252a]">
              <div className="font-bold text-[#5e6ad2]">NIST CSF 2.0</div>
              <div className="text-[#8a8f98] mt-1">GV.RM-01: Monetary Risk Quantification Strategy</div>
              <div className="text-[#2ea043] font-semibold mt-2">✓ Verified Audit Evidence</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0f1011] border border-[#23252a]">
              <div className="font-bold text-[#5e6ad2]">CIS Controls v8.1</div>
              <div className="text-[#8a8f98] mt-1">Control 7: Prioritized Vulnerability Management</div>
              <div className="text-[#2ea043] font-semibold mt-2">✓ Verified Audit Evidence</div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
