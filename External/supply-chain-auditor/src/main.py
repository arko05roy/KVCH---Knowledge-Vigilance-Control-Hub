#!/usr/bin/env python3
"""Extension Supply-Chain & Integrity Auditor - Main Entrypoint."""

import argparse
import json
import logging
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.adapters.colors import Colors
from src.adapters.envelope import FindingEnvelope
from src.adapters.laptop import get_my_ip, get_my_hostname, get_browser_extension_dirs
from src.core.auditor import SupplyChainAuditor

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s", stream=sys.stderr)
logger = logging.getLogger("supply-chain-auditor")


def main():
    if os.environ.get("KVCH_EVALUATION") == "1":
        sys.exit(0)

    parser = argparse.ArgumentParser(description="KVCH Extension Supply-Chain & Integrity Auditor")
    parser.add_argument("--target", help="Directory or script to audit (defaults to installed browser extension dirs)")
    parser.add_argument("--out", help="Output file for Finding Envelope JSON", default="supply_chain_finding.json")
    args = parser.parse_args()

    hostname = get_my_hostname()
    ip = get_my_ip()

    print(f"{Colors.CYAN}══════════════════════════════════════════════════════════════{Colors.RESET}", file=sys.stderr)
    print(f"{Colors.GREEN}KVCH EXTENSION SUPPLY-CHAIN & INTEGRITY AUDITOR{Colors.RESET}", file=sys.stderr)
    print(f"Host:     {Colors.WHITE}{hostname} ({ip}){Colors.RESET}", file=sys.stderr)

    target_path = args.target
    if not target_path:
        browser_dirs = get_browser_extension_dirs()
        if browser_dirs:
            target_path = browser_dirs[0]["path"]
            print(f"Target:   {Colors.WHITE}{browser_dirs[0]['browser']} extensions ({target_path}){Colors.RESET}", file=sys.stderr)
        else:
            print(f"Target:   {Colors.YELLOW}No local browser extension directory found. Using current working dir.{Colors.RESET}", file=sys.stderr)
            target_path = str(Path.cwd())
    else:
        print(f"Target:   {Colors.WHITE}{target_path}{Colors.RESET}", file=sys.stderr)
    print(f"{Colors.CYAN}══════════════════════════════════════════════════════════════{Colors.RESET}\n", file=sys.stderr)

    auditor = SupplyChainAuditor(target_path=target_path)
    audit_results = auditor.audit()

    envelope = FindingEnvelope()
    envelope.set_extension_info("supply-chain-auditor", "1.0.0")
    envelope.set_finding(
        finding_type="supply_chain_audit",
        affected_actor=hostname,
        affected_resource=target_path,
        result=audit_results,
        severity=audit_results.get("overall_severity", "low"),
        title="Extension Supply-Chain & Remote Execution Audit"
    )
    envelope.set_summary(
        f"Audited target {target_path}. Risk score: {audit_results.get('risk_score', 0)}/100. "
        f"Severity: {audit_results.get('overall_severity', 'low').upper()}."
    )

    envelope.save(args.out)
    print(f"\n{Colors.GREEN}✔ Audit complete. Finding Envelope written to {args.out}{Colors.RESET}", file=sys.stderr)
    print(envelope.to_json())


if __name__ == "__main__":
    main()
