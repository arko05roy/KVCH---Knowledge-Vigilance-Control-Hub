#!/usr/bin/env python3
"""Entrypoint for AegisDB-ZeroTrust extension CLI execution."""

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
from src.aegisdb_shield import AegisDBZeroTrust


def main():
    parser = argparse.ArgumentParser(description="AegisDB-ZeroTrust Database AST & Secret Exfiltration Shield")
    parser.add_argument("--target", help="Target path or socket profile to audit", default=None)
    args = parser.parse_args()

    hostname = get_my_hostname()
    ip = get_my_ip()

    print(f"{Colors.CYAN}══════════════════════════════════════════════════════════════════════════════{Colors.RESET}")
    print(f"{Colors.GREEN}AEGISDB-ZEROTRUST: DATABASE AST & SECRET EXFILTRATION SHIELD{Colors.RESET}")
    print(f"Host:     {Colors.WHITE}{hostname} ({ip}){Colors.RESET}")
    print(f"Engine:   {Colors.WHITE}Database Socket Gate, AST Normalization & RAG Protection{Colors.RESET}")
    print(f"{Colors.CYAN}══════════════════════════════════════════════════════════════════════════════{Colors.RESET}\n")

    shield = AegisDBZeroTrust(target_dir=args.target)
    results = shield.audit()

    findings_list = results.get("findings", [])

    print(f"{Colors.YELLOW}[+] Audited Database Driver Sockets & AST Query Builder Streams:{Colors.RESET}")
    print(f"    Total Queries Audited:  {Colors.WHITE}{results.get('total_queries_audited', 0)}{Colors.RESET}")
    print(f"    Threats Neutralized:    {Colors.RED}{results.get('threats_neutralized', 0)}{Colors.RESET}")
    print(f"    Overall Severity:       {Colors.RED}{results.get('severity', 'LOW')}{Colors.RESET}\n")

    for idx, item in enumerate(findings_list, 1):
        print(f"  {idx}. [{Colors.RED}{item.get('severity')}{Colors.RESET}] Connection: {Colors.CYAN}{item.get('connection_id')}{Colors.RESET} ({item.get('db_type')})")
        for threat in item.get("threats", []):
            print(f"     ⚠ {threat}")
        print(f"     Active Action: {Colors.GREEN}{item.get('active_neutralization', {}).get('action')}{Colors.RESET} ({item.get('active_neutralization', {}).get('status')})\n")

    # Build standardized kvch.finding/v1 report envelope
    reports_dir = Path(__file__).resolve().parent.parent.parent / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)
    
    report_file = reports_dir / "finding_9_aegisdb_zerotrust.json"

    envelope = FindingEnvelope()
    envelope.set_extension_info("aegisdb-zerotrust", "1.0.0")
    envelope.set_finding(
        finding_type="aegisdb_zerotrust",
        affected_actor=hostname,
        affected_resource=args.target or "database_socket_ast_gate",
        result=results,
        severity=results.get("severity", "LOW"),
        title="AegisDB-ZeroTrust Database AST & Secret Exfiltration Finding"
    )
    envelope.set_summary(
        f"Audited database socket driver streams and AST query builders on {hostname}. "
        f"Neutralized {results.get('threats_neutralized', 0)} malicious queries / mass exfiltration attempts via active socket termination."
    )
    
    for f in findings_list:
        for threat in f.get("threats", []):
            envelope.add_evidence(f"{f.get('connection_id')}: {threat}")
            envelope.add_indicator(threat)

    envelope.set_baseline({"expected_unpaginated_dumps": 0, "expected_sqli_mutations": 0, "active_socket_neutralization": True})
    envelope.add_recommended_action("Enforce mandatory query parameterization across all ORMs and database drivers")
    envelope.add_recommended_action("Enforce hard pagination limits (LIMIT <= 1000) on all data extraction endpoints")
    envelope.add_recommended_action("Enable AegisDB active socket termination in production database proxies")

    envelope.save(str(report_file))

    print(f"{Colors.GREEN}✔ Standardized kvch.finding/v1 report generated successfully:{Colors.RESET}")
    print(f"  {Colors.WHITE}{report_file}{Colors.RESET}\n")


if __name__ == "__main__":
    main()
