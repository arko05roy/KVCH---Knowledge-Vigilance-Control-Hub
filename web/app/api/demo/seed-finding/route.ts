import { NextResponse } from "next/server";
import { generateAllRoleReports } from "@/lib/ai/report-generator";
import type { FindingEnvelope } from "@/lib/judge/findings";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    const sampleFinding: FindingEnvelope = {
      schema_version: "kvch.finding/v1",
      observed_at: new Date().toISOString(),
      severity: body.severity || "high",
      category: body.category || "multi_vector_sandbox_campaign",
      title: body.title || "120-Min Sandbox Multi-Vector Breach Simulation (#INC-2026-8891)",
      summary: body.summary || "Correlated 10-extension security simulation: Unauthenticated DB port 5432, origin IP exposure, typosquatted npm supply chain backdoor, high-entropy reverse shell, and database AST mass exfiltration attempt.",
      resource: {
        type: "production_server",
        id: "prod-db-primary-01.local",
        name: "Core Financial Database & Staging Gateway"
      },
      evidence: [
        "[T+05m attack-surface-scanner] netstat: tcp4 0 0 *.5432 *.* LISTEN & SMB 445 on 0.0.0.0",
        "[T+18m edgeguard-sentinel] origin IP 10.0.4.15 leaked via cf-connecting-ip mismatch",
        "[T+29m phishing-hunter] /etc/hosts redirect auth.kvch.internal -> 185.220.101.5",
        "[T+38m supply-chain-auditor] @kvch-internal/crypto-utils@1.4.2 postinstall curl|sh payload",
        "[T+54m malware-analyzer] /tmp/.system_daemon Shannon entropy H=7.942, YARA MALW_JS_REVERSE_SHELL",
        "[T+67m threat-hunter-3000] PID 14209 node outbound TLS to 185.220.101.5:443 & LaunchAgent plist",
        "[T+82m cookie-xss-auditor] DOM XSS injection via location.hash; admin JWT token extracted",
        "[T+91m credential-exposure-auditor] AWS_SECRET_KEY in .env & clipboard clipper active",
        "[T+102m vpn-crypto-analyzer] Split-tunnel DNS leak on utun3 & crypto wallet memory probe",
        "[T+111m aegisdb-zerotrust] AST violation: unpaginated SELECT * FROM users, salaries; socket FD 42 terminated"
      ],
      indicators: [
        "LISTEN *.5432",
        "TYPOSQUAT_NPM_CRYPTO_UTILS",
        "HIGH_ENTROPY_7.942",
        "REVERSE_C2_185.220.101.5",
        "DOM_XSS_JWT_THEFT",
        "AST_EXFILTRATION_TERMINATED"
      ],
      baseline: { threshold: 0, enforcement: "BLOCK" },
      recommended_actions: [
        "Terminate malicious process PID 14209 & block C2 IP 185.220.101.5 via nftables",
        "Purge /tmp/.system_daemon, delete LaunchAgent plist, and revert @kvch-internal/crypto-utils to 1.4.1",
        "Bind PostgreSQL port 5432 strictly to 127.0.0.1 and enforce AegisDB AST row limits (MAX 500)",
        "Enforce GitHub Branch Protection requiring GPG signed commits and 2-person security review"
      ],
      details: {
        target_ip: "10.0.4.15",
        open_ports: [5432, 445, 8080],
        risk_score: 96,
        duration_minutes: 120,
        extensions_triggered: [
          "attack-surface-scanner",
          "edgeguard-sentinel",
          "phishing-hunter",
          "supply-chain-auditor",
          "malware-analyzer",
          "threat-hunter-3000",
          "cookie-xss-auditor",
          "credential-exposure-auditor",
          "vpn-crypto-analyzer",
          "aegisdb-zerotrust"
        ]
      }
    };

    console.log("[Demo Trigger] Calling Local Sovereign Ollama AI Layer for 4-Role AI Report Generation...");
    const aiReports = await generateAllRoleReports(sampleFinding);

    const enrichedEnvelope = {
      ...sampleFinding,
      ai_reports: aiReports.reports
    };

    return NextResponse.json({
      success: true,
      message: "AI Role Reports generated successfully via local Ollama inference engine!",
      finding: enrichedEnvelope
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("[Demo Trigger Error]:", error);
    return NextResponse.json({ success: false, error: err?.message || "Generation failed" }, { status: 500 });
  }
}

