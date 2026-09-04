"use client";

import React, { useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";

interface ExampleCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  promptText: string;
  skillName: string;
}

const EXAMPLE_CARDS: ExampleCard[] = [
  {
    id: "attack-surface",
    icon: (
      <svg className="w-5 h-5 text-[#c4c5c7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    title: "Create a new project",
    subtitle: "Turn an idea into a well-scoped project",
    promptText: "Build an Attack Surface Scanner extension candidate that checks public domain DNS, open ports, and TLS cert validity.",
    skillName: "Attack Surface Scanner"
  },
  {
    id: "research-topic",
    icon: (
      <svg className="w-5 h-5 text-[#c4c5c7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
    title: "Research a topic",
    subtitle: "Research a topic across the issue backlog",
    promptText: "Analyze VPN & Crypto configurations to detect weak IKEv2 ciphers, expired certs, and unauthorized IPsec tunnels.",
    skillName: "VPN Crypto Analyzer"
  },
  {
    id: "setup-team",
    icon: (
      <svg className="w-5 h-5 text-[#c4c5c7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Set up new team",
    subtitle: "Create a team that matches how your organization works",
    promptText: "Draft a Phishing Hunter extension mandate to inspect inbound emails for SPF/DKIM failures and suspicious link redirects.",
    skillName: "Phishing Hunter"
  }
];

const PREGENERATED_EXTENSIONS: Record<string, {
  name: string;
  version: string;
  hash: string;
  scope: string[];
  manifestYaml: string;
  analyzerPython: string;
  testScenarios: string;
}> = {
  default: {
    name: "Attack Surface Scanner",
    version: "1.0.0-candidate",
    hash: "0x8f3c9a12b4e76092a819d45",
    scope: ["network.socket:read", "threat_intel:query", "audit_log:write"],
    manifestYaml: `extension_id: attack_surface_scanner
version: 1.0.0-candidate
publisher: Senior Dev (Ayush)
mandate_type: Security Analyzer

capabilities:
  - network.socket:read
  - threat_intel:query
  - audit_log:write

isolation_policy:
  container: sandbox_tier_2
  max_memory_mb: 256
  timeout_seconds: 30

evaluation_rules:
  require_signed_hash: true
  min_pass_score: 95.0
  whitelist_decision_required: true`,
    analyzerPython: `import socket
import ssl
from typing import Dict, Any

class AttackSurfaceScanner:
    """
    Candidate Extension for scanning external domain perimeters.
    Validated in KVCH isolated sandbox prior to whitelisting.
    """
    def __init__(self, target: str):
        self.target = target

    def evaluate_tls(self) -> Dict[str, Any]:
        context = ssl.create_default_context()
        with socket.create_connection((self.target, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=self.target) as ssock:
                cert = ssock.getpeercert()
                return {
                    "subject": cert.get("subject"),
                    "version": ssock.version(),
                    "status": "SECURE"
                }

    def run_assessment(self) -> Dict[str, Any]:
        tls_info = self.evaluate_tls()
        return {
            "finding_type": "ATTACK_SURFACE_CHECK",
            "target": self.target,
            "result": tls_info,
            "risk_score": 0.1
        }`,
    testScenarios: `[
  {
    "scenario_id": "test_google_tls",
    "target": "www.google.com",
    "expected_result": "SECURE",
    "must_pass": true
  },
  {
    "scenario_id": "test_expired_cert_domain",
    "target": "expired.badssl.com",
    "expected_result": "CERT_EXPIRED",
    "must_pass": true
  }
]`
  }
};

export function CustomExtensionsPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("Skills");
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const [isChatDropdownOpen, setIsChatDropdownOpen] = useState(false);
  const [chatOption, setChatOption] = useState("New chat");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedExtension, setGeneratedExtension] = useState<typeof PREGENERATED_EXTENSIONS['default'] | null>(null);
  const [activeTab, setActiveTab] = useState<"manifest" | "python" | "scenarios">("manifest");
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);

  const skillsList = [
    "Attack Surface Scanner",
    "VPN Crypto Analyzer",
    "Phishing Hunter",
    "Threat Hunter 3000",
    "Malware Sandbox"
  ];

  const handleSelectExample = (card: ExampleCard) => {
    setPrompt(card.promptText);
    setSelectedSkill(card.skillName);
  };

  const handleGenerate = () => {
    if (!prompt.trim() && selectedSkill === "Skills") return;

    setIsGenerating(true);
    setGenerationStep(1);
    setSubmissionStatus(null);

    setTimeout(() => setGenerationStep(2), 700);
    setTimeout(() => setGenerationStep(3), 1400);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedExtension(PREGENERATED_EXTENSIONS.default);
    }, 2100);
  };

  const handleSubmitCandidate = () => {
    setSubmissionStatus("Submitted to Senior Management Whitelist Evaluation Queue! (Artifact Hash: 0x8f3c9a12b4e76092a819d45)");
  };

  return (
    <DashboardShell roleName="Sr. Dev">
      <div className="flex flex-col h-full bg-[#0d0e0f] text-[#e8e8e8] relative overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f2022]">
          <div className="relative">
            <button
              onClick={() => setIsChatDropdownOpen(!isChatDropdownOpen)}
              className="flex items-center gap-1.5 text-[14px] font-medium text-[#c4c5c7] hover:text-[#e8e8e8] transition-colors"
            >
              <span>{chatOption}</span>
              <svg className="w-3.5 h-3.5 text-[#858688]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {isChatDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-[#1a1b1d] border border-[#2b2c2e] rounded-lg shadow-xl z-50 py-1 text-[13px]">
                {["New chat", "Extension Mandates", "Evaluation Logs", "Approved Whitelists"].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setChatOption(option);
                      setIsChatDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#262729] text-[#c4c5c7] hover:text-white transition-colors"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-[12.5px] text-[#858688]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#161718] border border-[#2b2c2e]">
              <span className="w-2 h-2 rounded-full bg-[#2ea043] animate-pulse"></span>
              Mandate Publisher Active
            </span>
          </div>
        </div>

        {/* Central Workspace */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-3xl mx-auto w-full relative z-10">
          
          {/* Main Floating Input Box */}
          <div className="w-full bg-[#161718] border border-[#2b2c2e] rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all focus-within:border-[#3b3c3e]">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask AI to generate a custom security extension mandate, Python analyzer, or YAML manifest..."
              className="w-full bg-transparent text-[15px] text-[#e8e8e8] placeholder-[#5a5b5e] resize-none outline-none min-h-[90px] font-sans"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />

            {/* Controls Bar Inside Input Box */}
            <div className="flex items-center justify-between pt-2 border-t border-[#222325]">
              
              {/* Skills Dropdown Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSkillsOpen(!isSkillsOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f2022] hover:bg-[#262729] text-[13px] text-[#a1a3a6] hover:text-[#e8e8e8] border border-[#2b2c2e] transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-[#858688]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <path d="M12 8v8M8 12h8" />
                  </svg>
                  <span>{selectedSkill}</span>
                  <svg className="w-3 h-3 text-[#858688] ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {isSkillsOpen && (
                  <div className="absolute left-0 bottom-full mb-2 w-52 bg-[#1a1b1d] border border-[#2b2c2e] rounded-lg shadow-xl z-50 py-1 text-[13px]">
                    <div className="px-3 py-1 text-[11px] font-semibold text-[#858688] uppercase tracking-wider">Select Security Skill</div>
                    {skillsList.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => {
                          setSelectedSkill(skill);
                          setIsSkillsOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-[#262729] text-[#c4c5c7] hover:text-white transition-colors"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons: Attachment & Submit */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="Attach scenario data or sample logs"
                  className="p-1.5 text-[#858688] hover:text-[#e8e8e8] hover:bg-[#262729] rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    prompt.trim() || selectedSkill !== "Skills"
                      ? "bg-white text-black hover:bg-[#e0e0e0] shadow-md cursor-pointer"
                      : "bg-[#262729] text-[#5a5b5e] cursor-not-allowed"
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                </button>
              </div>

            </div>
          </div>

          {/* AI Generating Animation State */}
          {isGenerating && (
            <div className="w-full mt-6 bg-[#161718] border border-[#2b2c2e] rounded-xl p-5 text-[13.5px] space-y-3">
              <div className="flex items-center gap-2 text-[#c4c5c7] font-medium">
                <svg className="w-4 h-4 text-[#56ccf2] animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                AI Agent Synthesizing Security Candidate Extension...
              </div>

              <div className="space-y-1.5 pl-6 text-[12.5px] text-[#858688]">
                <div className={`flex items-center gap-2 ${generationStep >= 1 ? "text-[#c4c5c7]" : ""}`}>
                  <span>•</span> Scoping capability boundaries (`network.socket:read`, `threat_intel:query`)...
                </div>
                <div className={`flex items-center gap-2 ${generationStep >= 2 ? "text-[#c4c5c7]" : ""}`}>
                  <span>•</span> Generating isolation manifest.yaml & Python findings envelope logic...
                </div>
                <div className={`flex items-center gap-2 ${generationStep >= 3 ? "text-[#c4c5c7]" : ""}`}>
                  <span>•</span> Building evaluation test scenarios & computing Candidate Artifact Hash...
                </div>
              </div>
            </div>
          )}

          {/* Generated Extension Output Viewer */}
          {generatedExtension && !isGenerating && (
            <div className="w-full mt-6 bg-[#161718] border border-[#2b2c2e] rounded-2xl overflow-hidden shadow-2xl">
              
              {/* Card Header */}
              <div className="px-5 py-4 bg-[#1f2022] border-b border-[#2b2c2e] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-semibold text-white">{generatedExtension.name}</h2>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#56ccf2]/10 text-[#56ccf2] border border-[#56ccf2]/20 font-mono">
                      {generatedExtension.version}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#858688] mt-0.5 font-mono">
                    Candidate Hash: {generatedExtension.hash}
                  </p>
                </div>

                <button
                  onClick={() => setGeneratedExtension(null)}
                  className="text-[#858688] hover:text-white text-[12px] hover:underline"
                >
                  Clear output
                </button>
              </div>

              {/* Scope Badges */}
              <div className="px-5 py-2.5 bg-[#161718] border-b border-[#222325] flex items-center gap-2 flex-wrap text-[12px]">
                <span className="text-[#858688]">Declared Capabilities:</span>
                {generatedExtension.scope.map((cap) => (
                  <span key={cap} className="px-2 py-0.5 rounded bg-[#262729] text-[#c4c5c7] font-mono text-[11px]">
                    {cap}
                  </span>
                ))}
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#2b2c2e] bg-[#1a1b1d] text-[13px]">
                <button
                  onClick={() => setActiveTab("manifest")}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                    activeTab === "manifest"
                      ? "border-white text-white bg-[#161718]"
                      : "border-transparent text-[#858688] hover:text-[#c4c5c7]"
                  }`}
                >
                  manifest.yaml
                </button>
                <button
                  onClick={() => setActiveTab("python")}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                    activeTab === "python"
                      ? "border-white text-white bg-[#161718]"
                      : "border-transparent text-[#858688] hover:text-[#c4c5c7]"
                  }`}
                >
                  analyzer.py
                </button>
                <button
                  onClick={() => setActiveTab("scenarios")}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                    activeTab === "scenarios"
                      ? "border-white text-white bg-[#161718]"
                      : "border-transparent text-[#858688] hover:text-[#c4c5c7]"
                  }`}
                >
                  scenarios.json
                </button>
              </div>

              {/* Code Preview Content */}
              <div className="p-4 bg-[#0d0e0f] text-[12.5px] font-mono text-[#c4c5c7] overflow-x-auto max-h-[260px] leading-relaxed">
                <pre>
                  {activeTab === "manifest" && generatedExtension.manifestYaml}
                  {activeTab === "python" && generatedExtension.analyzerPython}
                  {activeTab === "scenarios" && generatedExtension.testScenarios}
                </pre>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 bg-[#161718] border-t border-[#2b2c2e] flex flex-col gap-3">
                {submissionStatus ? (
                  <div className="p-3 bg-[#2ea043]/10 border border-[#2ea043]/30 rounded-lg text-[#2ea043] text-[13px] flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>{submissionStatus}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSubmitCandidate}
                      className="px-4 py-2 bg-white text-black font-medium text-[13px] rounded-lg hover:bg-[#e0e0e0] transition-colors shadow"
                    >
                      Submit Candidate for Whitelist Evaluation
                    </button>
                    <button
                      onClick={() => alert("Simulated pre-publication sandbox evaluation executed: 100% Pass score!")}
                      className="px-4 py-2 bg-[#262729] text-[#c4c5c7] hover:text-white font-medium text-[13px] rounded-lg border border-[#2b2c2e] hover:bg-[#2e3033] transition-colors"
                    >
                      Run In Isolation Test
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Examples Grid Section */}
          {showExamples && !generatedExtension && (
            <div className="w-full mt-10">
              
              {/* Examples Header */}
              <div className="flex items-center justify-between mb-3 text-[13px] text-[#858688]">
                <span>Get started with some examples</span>
                <button
                  onClick={() => setShowExamples(false)}
                  className="hover:text-white p-1 rounded transition-colors"
                  title="Dismiss examples"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* 3 Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {EXAMPLE_CARDS.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handleSelectExample(card)}
                    className="bg-[#161718] border border-[#2b2c2e] hover:border-[#3b3c3e] hover:bg-[#1a1b1d] rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between h-[120px] group"
                  >
                    <div>
                      <div className="mb-2 text-[#858688] group-hover:text-white transition-colors">
                        {card.icon}
                      </div>
                      <h3 className="text-[13.5px] font-medium text-[#e8e8e8] group-hover:text-white leading-snug">
                        {card.title}
                      </h3>
                      <p className="text-[12px] text-[#858688] mt-1 line-clamp-2 leading-relaxed">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* Bottom Right Floating Status & History */}
        <div className="fixed bottom-4 right-4 flex items-center gap-2 z-40">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161718] border border-[#2b2c2e] rounded-full text-[12px] text-[#a1a3a6] hover:text-white hover:bg-[#1f2022] transition-colors shadow-lg">
            <svg className="w-3.5 h-3.5 text-[#2ea043]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>Agent</span>
          </button>

          <button className="p-2 bg-[#161718] border border-[#2b2c2e] rounded-full text-[#858688] hover:text-white hover:bg-[#1f2022] transition-colors shadow-lg" title="Mandate Execution History">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
        </div>

      </div>
    </DashboardShell>
  );
}
