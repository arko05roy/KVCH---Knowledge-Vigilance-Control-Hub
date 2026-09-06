#!/usr/bin/env python3
"""
COOKIE SECURITY, XSS & SESSION HIJACKING ANALYZER
Tool 1: Cookie Security Posture Audit (HttpOnly, Secure, SameSite flags)
Tool 2: Sub-Domain Cookie Tossing & Scoping Audit
Tool 3: DOM-Based XSS Sink & Script Injection Scanner (eval, innerHTML, document.write)
Tool 4: Unencrypted JWT Session Token & Exfiltration Detector
"""

import sys
import os
import json
import time
import argparse
from datetime import datetime, timezone
from pathlib import Path

# Add parent directory to path for utils and modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "cookie-xss-auditor"))

from utils.colors import Colors
from utils.finding_envelope import FindingEnvelope
from utils.laptop_utils import get_my_hostname, get_my_ip
from src.core.auditor import CookieXSSAuditor


def main():
    parser = argparse.ArgumentParser(description="KVCH Cookie Security, XSS & Session Hijacking Analyzer")
    parser.add_argument("--target", help="Target path to audit (defaults to browser profile/web fixtures)", default=None)
    args = parser.parse_args()

    hostname = get_my_hostname()
    ip = get_my_ip()

    print(f"{Colors.CYAN}══════════════════════════════════════════════════════════════════════════════{Colors.RESET}")
    print(f"{Colors.GREEN}KVCH COOKIE SECURITY, XSS & SESSION HIJACKING ANALYZER{Colors.RESET}")
    print(f"Host:     {Colors.WHITE}{hostname} ({ip}){Colors.RESET}")
    print(f"Engine:   {Colors.WHITE}Cookie Posture, DOM XSS & Session Hijacking Audit{Colors.RESET}")
    print(f"{Colors.CYAN}══════════════════════════════════════════════════════════════════════════════{Colors.RESET}\n")

    auditor = CookieXSSAuditor(target_path=args.target)
    results = auditor.audit()

    findings_list = (
        results.get("cookie_posture_findings", []) +
        results.get("xss_sink_findings", []) +
        results.get("session_token_findings", [])
    )

    print(f"{Colors.YELLOW}[+] Scanned Browser Cookies & Script Sinks:{Colors.RESET}")
    print(f"    Total Threats Detected: {Colors.RED}{results.get('total_threats_detected', 0)}{Colors.RESET}")
    print(f"    Overall Severity:       {Colors.RED}{results.get('severity', 'HIGH')}{Colors.RESET}\n")

    for idx, item in enumerate(findings_list[:20], 1):
        print(f"  {idx}. [{Colors.RED}{item.get('severity')}{Colors.RESET}] {Colors.CYAN}{item.get('type')}{Colors.RESET}")
        print(f"     Details: {item.get('description')}\n")
    if len(findings_list) > 20:
        print(f"  ... and {len(findings_list) - 20} more findings.\n")

    # Build standardized kvch.finding/v1 report envelope
    reports_dir = Path(__file__).resolve().parent.parent / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    report_file = reports_dir / f"finding_cookie_xss_analyzer_{timestamp}.json"

    envelope = FindingEnvelope()
    envelope.set_extension_info("cookie-xss-auditor", "1.0.0")
    envelope.set_finding(
        finding_type="cookie_xss_analyzer",
        affected_actor=hostname,
        affected_resource=args.target or "browser_profile_web_posture",
        result=results,
        severity=results.get("severity", "HIGH"),
        title="Cookie Security Posture, DOM XSS & Session Theft Finding"
    )
    envelope.set_summary(
        f"Audited browser cookie security and client-side DOM script sinks on {hostname}. "
        f"Detected {results.get('total_threats_detected', 0)} security findings across cookies, XSS sinks, and session tokens."
    )
    
    for f in findings_list:
        envelope.add_evidence(f.get("description"))
        envelope.add_indicator(f.get("type"))
        
    envelope.set_baseline({"expected_cookie_flags": ["HttpOnly", "Secure", "SameSite=Strict"], "expected_xss_sinks": 0})
    envelope.add_recommended_action("Enforce HttpOnly and Secure flags on all session cookies")
    envelope.add_recommended_action("Replace innerHTML and eval() sinks with safe textContent and DOM APIs")
    envelope.add_recommended_action("Store JWT session tokens in HttpOnly cookies instead of localStorage")

    envelope.save(str(report_file))

    print(f"{Colors.GREEN}✔ Standardized kvch.finding/v1 report generated successfully:{Colors.RESET}")
    print(f"  {Colors.WHITE}{report_file}{Colors.RESET}\n")


if __name__ == "__main__":
    main()
