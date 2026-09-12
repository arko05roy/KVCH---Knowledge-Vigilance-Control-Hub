"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Cpu,
  RefreshCw,
  Terminal,
  Activity,
  ArrowRight,
  Database,
  Lock,
  Unlock,
  AlertTriangle,
  Server,
  FileText,
  UserCheck,
  Radio,
  Sliders,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Send,
  Layers,
  ChevronRight,
  Flame,
  Globe,
  Award,
  Sparkles,
  Info
} from "lucide-react";
import { ScenarioDefinition } from "@/lib/threat-engine/scenarios";
import { FusedContextVector, DetectionVerdict } from "@/lib/threat-engine/types";
import ThreatFlowDiagram from "@/components/threat-flow-diagram";

export default function ThreatStudioPage() {
  const [activeView, setActiveView] = useState<"diagram" | "sandbox">("diagram");
  const [scenarios, setScenarios] = useState<ScenarioDefinition[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("SCENARIO-1-C2");
  const [selectedOptionKey, setSelectedOptionKey] = useState<string>("rev_shell");
  const [vectorJson, setVectorJson] = useState<string>("");
  
  const [loading, setLoading] = useState<boolean>(false);
  const [verdict, setVerdict] = useState<DetectionVerdict | null>(null);
  const [fusedVector, setFusedVector] = useState<FusedContextVector | null>(null);
  const [activeStage, setActiveStage] = useState<number>(0);
  
  const [feedbackNotes, setFeedbackNotes] = useState<string>("");
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState<string | null>(null);

  // Load predefined scenarios on mount
  useEffect(() => {
    async function fetchScenarios() {
      try {
        const res = await fetch("/api/threat-engine/scenarios");
        const data = await res.json();
        if (data.scenarios && data.scenarios.length > 0) {
          setScenarios(data.scenarios);
          const firstScen = data.scenarios[0];
          setSelectedScenarioId(firstScen.id);
          const firstOpt = firstScen.options[0];
          setSelectedOptionKey(firstOpt.key);
          setVectorJson(JSON.stringify(firstOpt.vector, null, 2));
        }
      } catch (err) {
        console.error("Failed to fetch scenarios:", err);
      }
    }
    fetchScenarios();
  }, []);

  const currentScenario = scenarios.find((s) => s.id === selectedScenarioId);
  const currentOption = currentScenario?.options.find((o) => o.key === selectedOptionKey);

  const handleScenarioChange = (scenId: string) => {
    setSelectedScenarioId(scenId);
    const scen = scenarios.find((s) => s.id === scenId);
    if (scen && scen.options.length > 0) {
      const opt = scen.options[0];
      setSelectedOptionKey(opt.key);
      setVectorJson(JSON.stringify(opt.vector, null, 2));
      setVerdict(null);
      setFusedVector(null);
      setFeedbackSuccessMsg(null);
    }
  };

  const handleOptionChange = (optKey: string) => {
    setSelectedOptionKey(optKey);
    const opt = currentScenario?.options.find((o) => o.key === optKey);
    if (opt) {
      setVectorJson(JSON.stringify(opt.vector, null, 2));
      setVerdict(null);
      setFusedVector(null);
      setFeedbackSuccessMsg(null);
    }
  };

  // Run CTDE v2.0 Analysis Pipeline
  const runAnalysis = async () => {
    setLoading(true);
    setVerdict(null);
    setFeedbackSuccessMsg(null);
    setActiveStage(0);

    let parsedVector: FusedContextVector;
    try {
      parsedVector = JSON.parse(vectorJson);
    } catch {
      alert("Invalid JSON format in telemetry editor.");
      setLoading(false);
      return;
    }

    // Visual Stage Animation ticker
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev < 7 ? prev + 1 : prev));
    }, 120);

    try {
      const res = await fetch("/api/threat-engine/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vector: parsedVector }),
      });
      const data = await res.json();
      clearInterval(timer);
      setActiveStage(7);

      if (data.success && data.verdict) {
        setVerdict(data.verdict);
        setFusedVector(data.vector);
      }
    } catch (err) {
      console.error("Analysis execution failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Submit 1-Click Analyst Disposition
  const handleFeedbackSubmit = async (disposition: "CONFIRMED_TRUE_POSITIVE" | "FALSE_POSITIVE" | "NEEDS_CONTEXT") => {
    if (!verdict) return;
    try {
      const res = await fetch("/api/threat-engine/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario_id: selectedScenarioId,
          threat_classification: verdict.threat_classification,
          asset_tier: fusedVector?.asset.asset_criticality || "Tier-1",
          disposition,
          primary_differentiators: verdict.primary_differentiators,
          analyst_notes: feedbackNotes || `Analyst disposition recorded as ${disposition}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackSuccessMsg(data.message);
      }
    } catch (err) {
      console.error("Feedback submission failed:", err);
    }
  };

  const getSeverityBadge = (sev?: string) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-rose-500/20 text-rose-400 border border-rose-500/40";
      case "HIGH":
        return "bg-orange-500/20 text-orange-400 border border-orange-500/40";
      case "MEDIUM":
        return "bg-amber-500/20 text-amber-400 border border-amber-500/40";
      case "LOW":
      case "INFORMATIONAL":
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40";
      default:
        return "bg-zinc-800 text-zinc-400 border border-zinc-700";
    }
  };

  const getSoarBadge = (action?: string) => {
    switch (action) {
      case "AUTO_ISOLATE":
        return "bg-rose-600/30 text-rose-300 border border-rose-500 font-bold";
      case "QUARANTINE_AND_THROTTLE":
        return "bg-amber-600/30 text-amber-300 border border-amber-500 font-semibold";
      case "LOG_ONLY":
      default:
        return "bg-emerald-600/30 text-emerald-300 border border-emerald-500";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-zinc-100 selection:bg-indigo-500 selection:text-white pb-20">
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-[#101114]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white">KVCH Threat Studio</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                  CTDE v2.0 Engine
                </span>
              </div>
              <p className="text-xs text-zinc-400">Deterministic Telemetry Grounding &amp; Dual-Gate Reasoning</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#090a0d] p-1 rounded-lg border border-zinc-800 text-xs font-mono">
              <button
                onClick={() => setActiveView("diagram")}
                className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                  activeView === "diagram"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-950"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Step-by-Step Threat Diagram
              </button>
              <button
                onClick={() => setActiveView("sandbox")}
                className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                  activeView === "sandbox"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-950"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Telemetry Matrix Sandbox
              </button>
            </div>

            <Link
              href="/threat-graph"
              className="text-xs font-mono px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 transition"
            >
              Full Graph Page
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {activeView === "diagram" ? (
          <div className="space-y-6">
            <ThreatFlowDiagram />
          </div>
        ) : (
          <div className="space-y-6">
        {/* Scenario Selection Header Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {scenarios.map((scen) => {
            const isSelected = scen.id === selectedScenarioId;
            return (
              <button
                key={scen.id}
                onClick={() => handleScenarioChange(scen.id)}
                className={`text-left p-4 rounded-xl border transition duration-200 relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? "bg-indigo-950/20 border-indigo-500/60 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/40"
                    : "bg-[#131417]/70 border-zinc-800/80 hover:border-zinc-700 hover:bg-[#17181c]"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                )}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                      {scen.id}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                      3 Indistinguishable Flows
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-zinc-100 mb-1">{scen.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2">{scen.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-mono text-[11px] text-zinc-500">3 Variants Ready</span>
                  <span className="text-indigo-400 flex items-center gap-1 font-medium">
                    Load Scenario <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Scenario Variant Tabs */}
        {currentScenario && (
          <div className="bg-[#111215] border border-zinc-800 rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-zinc-800/80">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{currentScenario.title}</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">{currentScenario.description}</p>
              </div>

              {/* Variant Selector Pills */}
              <div className="flex items-center gap-2 bg-[#0a0b0d] p-1.5 rounded-lg border border-zinc-800 self-start md:self-auto">
                {currentScenario.options.map((opt) => {
                  const isOptSelected = opt.key === selectedOptionKey;
                  const isMal = opt.expectedType === "MALICIOUS";
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleOptionChange(opt.key)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                        isOptSelected
                          ? isMal
                            ? "bg-rose-600 text-white shadow-md shadow-rose-950"
                            : "bg-indigo-600 text-white shadow-md shadow-indigo-950"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                      }`}
                    >
                      {isMal ? <Flame className="w-3.5 h-3.5" /> : <Server className="w-3.5 h-3.5" />}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {currentOption && (
              <div className="mt-3 flex items-center justify-between text-xs bg-[#0b0c0e]/60 p-2.5 rounded-lg border border-zinc-800/50 font-mono">
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="text-zinc-500">Selected Option:</span>
                  <span className="font-semibold text-indigo-300">{currentOption.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">Expected Type:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    currentOption.expectedType === "MALICIOUS" ? "text-rose-400 bg-rose-950/40 border border-rose-800/50" : "text-emerald-400 bg-emerald-950/40 border border-emerald-800/50"
                  }`}>
                    {currentOption.expectedType}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2-Column Working Area: Telemetry Matrix Editor & 8-Stage CTDE Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Fused Context Vector JSON (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="bg-[#111215] border border-zinc-800 rounded-xl overflow-hidden shadow-md flex flex-col">
              <div className="bg-[#15161a] px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-mono font-semibold uppercase text-zinc-200">
                    Fused Telemetry Context Matrix
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (currentOption) {
                      setVectorJson(JSON.stringify(currentOption.vector, null, 2));
                    }
                  }}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 transition"
                >
                  Reset
                </button>
              </div>

              {/* JSON Editor Box */}
              <div className="p-3 bg-[#0a0b0d] flex-1">
                <textarea
                  value={vectorJson}
                  onChange={(e) => setVectorJson(e.target.value)}
                  rows={18}
                  className="w-full bg-transparent font-mono text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 p-2 rounded resize-y border border-zinc-800/80 leading-relaxed"
                  spellCheck={false}
                />
              </div>

              {/* Action Trigger Footer */}
              <div className="p-4 bg-[#131418] border-t border-zinc-800 flex items-center justify-between">
                <div className="text-xs text-zinc-400 font-mono">
                  HMAC: <span className="text-emerald-400 font-semibold">Attested (SHA-256)</span>
                </div>
                <button
                  onClick={runAnalysis}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-indigo-950 transition"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing Telemetry Matrix...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Execute CTDE v2.0 Pipeline
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Architecture Grounding Note Card */}
            <div className="bg-[#111215]/60 border border-zinc-800/80 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 mb-2">
                <Lock className="w-4 h-4" />
                Backend Telemetry Determinism Guarantee
              </div>
              <ul className="text-xs text-zinc-400 space-y-2 list-disc list-inside">
                <li><strong className="text-zinc-300">Fast-Path Heuristics:</strong> Known-signed binaries (AnyDesk, PostgreSQL, Google) bypass the LLM completely.</li>
                <li><strong className="text-zinc-300">Dual-Gate Validator:</strong> Critical verdicts are skeptically audited before any SOAR isolation action.</li>
                <li><strong className="text-zinc-300">Injection Neutralization:</strong> Attacker commands with prompt overrides are cleaned before AI synthesis.</li>
              </ul>
            </div>

          </div>

          {/* RIGHT COLUMN: 8-Stage Pipeline Graph & Live Verdict (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* 8-Stage CTDE Pipeline Graph */}
            <div className="bg-[#111215] border border-zinc-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  CTDE v2.0 8-Stage Execution Graph
                </span>
                {verdict && (
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded">
                    Pipeline Status: COMPLETE
                  </span>
                )}
              </div>

              {/* Stage Nodes Grid */}
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                {[
                  { name: "1. Attestation & Sanitization", id: 0 },
                  { name: "2. Context Fusion (Intel/Baseline)", id: 1 },
                  { name: "3. Fast Heuristic Triaging", id: 2 },
                  { name: "4. Confidence Router Gate", id: 3 },
                  { name: "5. AI Structured Reasoning", id: 4 },
                  { name: "6. Secondary Adversarial Check", id: 5 },
                  { name: "7. Tiered SOAR Policy", id: 6 },
                  { name: "8. Closed-Loop Feedback", id: 7 }
                ].map((st) => {
                  const isActive = activeStage >= st.id;
                  const isCurrent = activeStage === st.id && loading;
                  return (
                    <div
                      key={st.id}
                      className={`p-2 rounded-lg border transition-all ${
                        isCurrent
                          ? "bg-indigo-600/30 border-indigo-400 text-indigo-200 animate-pulse ring-1 ring-indigo-400"
                          : isActive
                          ? "bg-zinc-900 border-zinc-700 text-zinc-200"
                          : "bg-[#0d0e11] border-zinc-800/40 text-zinc-600"
                      }`}
                    >
                      <div className="line-clamp-2 leading-tight font-medium">{st.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verdict Display */}
            {verdict ? (
              <div className="space-y-4">
                
                {/* Final Verdict Banner */}
                <div className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg ${
                  verdict.severity === "CRITICAL" || verdict.severity === "HIGH"
                    ? "bg-rose-950/30 border-rose-600/50 shadow-rose-950/20"
                    : "bg-emerald-950/30 border-emerald-600/50 shadow-emerald-950/20"
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded uppercase tracking-wider ${getSeverityBadge(verdict.severity)}`}>
                        {verdict.threat_classification}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">
                        Confidence: <strong className="text-white">{verdict.confidence_score}%</strong>
                      </span>
                      <span className="text-xs font-mono text-zinc-500">|</span>
                      <span className="text-xs font-mono text-indigo-300">
                        Stage: <strong>{verdict.routing_stage}</strong>
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1">
                      MITRE ATT&amp;CK: {verdict.mitre_attack_technique}
                    </h3>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {verdict.ai_reasoning_summary}
                    </p>
                  </div>

                  {/* SOAR Action Badge */}
                  <div className="self-start md:self-auto bg-black/40 p-3 rounded-lg border border-zinc-800 min-w-[200px]">
                    <div className="text-[10px] uppercase font-mono text-zinc-400 mb-1 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-indigo-400" />
                      Enforced SOAR Action:
                    </div>
                    <div className={`text-xs px-2.5 py-1.5 rounded text-center ${getSoarBadge(verdict.soar_action.action_type)}`}>
                      {verdict.soar_action.action_type}
                    </div>
                    <div className="text-[10px] text-zinc-400 text-center mt-1">
                      Status: <span className="text-emerald-400 font-semibold">{verdict.soar_action.execution_status}</span>
                    </div>
                  </div>
                </div>

                {/* Primary Differentiators & Grounding Evidence Card */}
                <div className="bg-[#111215] border border-zinc-800 rounded-xl p-4 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-mono uppercase font-bold text-zinc-300 flex items-center gap-2">
                      <Database className="w-4 h-4 text-indigo-400" />
                      Primary Telemetry Differentiators
                    </span>
                    <span className="text-xs font-mono text-zinc-500">
                      Skipped LLM: <strong className="text-zinc-300">{verdict.skipped_llm ? "YES (Fast Path)" : "NO (Deep Reasoning)"}</strong>
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs font-mono text-zinc-300">
                    {verdict.primary_differentiators.map((diff, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-[#0c0d10] p-2 rounded border border-zinc-800/60">
                        <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{diff}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Secondary Adversarial Validation Check */}
                  {verdict.secondary_validation && (
                    <div className="p-3 bg-indigo-950/20 border border-indigo-500/30 rounded-lg flex items-start gap-3">
                      <Cpu className="w-5 h-5 text-indigo-400 mt-0.5" />
                      <div>
                        <div className="text-xs font-mono font-bold text-indigo-300">
                          Stage 6: Secondary Adversarial Validator
                        </div>
                        <p className="text-xs text-zinc-300 mt-0.5">
                          {verdict.secondary_validation.counter_argument}
                        </p>
                        <div className="text-[10px] font-mono text-zinc-400 mt-1 flex items-center gap-3">
                          <span>FP Case: <strong className="text-zinc-200">{verdict.secondary_validation.false_positive_case_strength}</strong></span>
                          <span>Recommendation: <strong className="text-emerald-400">{verdict.secondary_validation.recommendation}</strong></span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Closed-Loop Analyst Feedback Section */}
                  <div className="pt-3 border-t border-zinc-800">
                    <div className="text-xs font-mono font-semibold text-zinc-300 uppercase mb-2 flex items-center justify-between">
                      <span>Stage 8: 1-Click Closed-Loop Analyst Feedback</span>
                      {feedbackSuccessMsg && (
                        <span className="text-emerald-400 flex items-center gap-1 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {feedbackSuccessMsg}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        placeholder="Optional analyst notes or baseline exception justification..."
                        value={feedbackNotes}
                        onChange={(e) => setFeedbackNotes(e.target.value)}
                        className="w-full bg-[#0a0b0d] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                        <button
                          onClick={() => handleFeedbackSubmit("CONFIRMED_TRUE_POSITIVE")}
                          className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/40 text-rose-300 text-xs font-medium flex items-center gap-1 transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> True Positive
                        </button>
                        <button
                          onClick={() => handleFeedbackSubmit("FALSE_POSITIVE")}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-1 transition"
                        >
                          <XCircle className="w-3.5 h-3.5" /> False Positive
                        </button>
                        <button
                          onClick={() => handleFeedbackSubmit("NEEDS_CONTEXT")}
                          className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 text-xs font-medium flex items-center gap-1 transition"
                        >
                          <HelpCircle className="w-3.5 h-3.5" /> Escalate
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-[#111215] border border-zinc-800/80 rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
                <div className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 mb-3">
                  <Shield className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-300 mb-1">CTDE Ready for Telemetry Matrix</h4>
                <p className="text-xs text-zinc-500 max-w-sm">
                  Select a scenario variant above to inspect indistinguishable network flows and click "Execute CTDE v2.0 Pipeline".
                </p>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
