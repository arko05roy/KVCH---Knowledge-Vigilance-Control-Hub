#!/usr/bin/env python3
"""Entrypoint for EdgeGuard-Sentinel extension CLI execution."""

import sys
import os
import argparse
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from utils.colors import Colors
from utils.finding_envelope import FindingEnvelope
from utils.laptop_utils import get_my_hostname, get_my_ip
from src.edgeguard_sentinel import EdgeGuardSentinel


def main():
    parser = argparse.ArgumentParser(description="EdgeGuard-Sentinel CDN, WAF & Origin IP Firewall Shield")
    parser.add_argument("--target", help="Target URL or endpoint profile to audit", default=None)
    args = parser.parse_args()

    hostname = get_my_hostname()
    ip = get_my_ip()

    print(f"{Colors.CYAN}══════════════════════════════════════════════════════════════════════════════{Colors.RESET}")
    print(f"{Colors.GREEN}EDGEGUARD-SENTINEL: CDN, WAF & ORIGIN IP FIREWALL SHIELD{Colors.RESET}")
    print(f"Host:     {Colors.WHITE}{hostname} ({ip}){Colors.RESET}")
    print(f"Engine:   {Colors.WHITE}Edge Proxy Auditor, Micro-Fuzzer & WAF Auto-Patcher{Colors.RESET}")
    print(f"{Colors.CYAN}══════════════════════════════════════════════════════════════════════════════{Colors.RESET}\n")

    sentinel = EdgeGuardSentinel(target_url=args.target)
    results = sentinel.audit()

    findings_list = results.get("findings", [])
    active_neutralization = results.get("active_neutralization", {})

    print(f"{Colors.YELLOW}[+] Audited CDN Edge Headers & Active Micro-Fuzzing Loops:{Colors.RESET}")
    print(f"    Target Endpoint:        {Colors.WHITE}{results.get('target_url')}{Colors.RESET}")
    print(f"    Total Threats Detected: {Colors.RED}{results.get('total_threats_detected', 0)}{Colors.RESET}")
    print(f"    Overall Severity:       {Colors.RED}{results.get('severity', 'LOW')}{Colors.RESET}\n")

    for idx, item in enumerate(findings_list, 1):
        print(f"  {idx}. [{Colors.RED}{item.get('severity')}{Colors.RESET}] {Colors.CYAN}{item.get('type')}{Colors.RESET}")
        print(f"     Description: {item.get('description')}\n")

    hud_msg = active_neutralization.get("deployment_lock", {}).get("hud_message")
    if hud_msg:
        print(f"{Colors.RED}🚨 IPC WARNING HUD ALERT TRIGGERED:{Colors.RESET}")
        print(f"  {hud_msg}\n")

    patch_info = active_neutralization.get("one_click_patch", {})
    if patch_info.get("applied"):
        print(f"{Colors.GREEN}✔ One-Click Local WAF Patch Applied:{Colors.RESET}")
        print(f"  Patch ID: {patch_info.get('patch_id')}")
        print(f"  Patched Headers: {', '.join(patch_info.get('patched_headers', []))}\n")

    # Build standardized kvch.finding/v1 report envelope
    reports_dir = Path(__file__).resolve().parent.parent.parent / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)
    
    report_file = reports_dir / "finding_10_edgeguard_sentinel.json"

    envelope = FindingEnvelope()
    envelope.set_extension_info("edgeguard-sentinel", "1.0.0")
    envelope.set_finding(
        finding_type="edgeguard_sentinel",
        affected_actor=hostname,
        affected_resource=args.target or sentinel.target_url,
        result=results,
        severity=results.get("severity", "LOW"),
        title="EdgeGuard-Sentinel CDN, WAF & Origin IP Firewall Finding"
    )
    envelope.set_summary(
        f"Audited CDN edge response headers and executed non-destructive micro-fuzzing loops on {hostname}. "
        f"Detected {results.get('total_threats_detected', 0)} edge vulnerabilities. Intercepted deployment hook and applied WAF patch."
    )
    
    for f in findings_list:
        envelope.add_evidence(f.get("description"))
        envelope.add_indicator(f.get("type"))

    envelope.set_baseline({"expected_origin_ip_leaks": 0, "expected_waf_header_violations": 0, "deployment_hook_lock": True})
    envelope.add_recommended_action("Inject Strict-Transport-Security, CSP, and X-Frame-Options headers on edge proxies")
    envelope.add_recommended_action("Obscure backend origin IPv4 addresses behind CDN reverse proxies")
    envelope.add_recommended_action("Enable EdgeGuard automated deployment hook locking on staging CI/CD pipelines")

    envelope.save(str(report_file))

    print(f"{Colors.GREEN}✔ Standardized kvch.finding/v1 report generated successfully:{Colors.RESET}")
    print(f"  {Colors.WHITE}{report_file}{Colors.RESET}\n")


if __name__ == "__main__":
    main()
