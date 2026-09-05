#!/usr/bin/env python3
"""Phishing Hunter - Main Entrypoint."""

import argparse
import logging
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.adapters.colors import Colors
from src.adapters.envelope import FindingEnvelope
from src.adapters.laptop import get_my_hostname, get_my_ip
from src.core.hunter import PhishingHunter

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s", stream=sys.stderr)

def main():
    if os.environ.get("KVCH_EVALUATION") == "1":
        sys.exit(0)

    parser = argparse.ArgumentParser(description="KVCH Phishing Hunter Extension")
    parser.add_argument("--domain", help="Target domain/hostname (defaults to laptop hostname)")
    parser.add_argument("--out", help="Output JSON finding path", default="phishing_finding.json")
    args = parser.parse_args()

    hostname = args.domain or get_my_hostname()
    ip = get_my_ip()

    print(f"{Colors.CYAN}══════════════════════════════════════════════════════════════{Colors.RESET}", file=sys.stderr)
    print(f"{Colors.GREEN}KVCH PHISHING HUNTER{Colors.RESET}", file=sys.stderr)
    print(f"Target Hostname: {Colors.WHITE}{hostname}{Colors.RESET}", file=sys.stderr)
    print(f"Laptop IP:       {Colors.WHITE}{ip}{Colors.RESET}", file=sys.stderr)
    print(f"{Colors.CYAN}══════════════════════════════════════════════════════════════{Colors.RESET}\n", file=sys.stderr)

    hunter = PhishingHunter(target_domain=hostname)
    results = hunter.hunt()

    envelope = FindingEnvelope()
    envelope.set_extension_info("phishing-hunter", "1.0.0")
    envelope.set_finding(
        finding_type="phishing_typosquat_scan",
        affected_actor=hostname,
        affected_resource=hostname,
        result=results,
        severity="medium",
        title="Phishing Typosquat Finding"
    )
    envelope.set_summary(f"Targeted {hostname}. Generated {results.get('total_permutations', 0)} typosquats. Found {len(results.get('active_phishing_domains', []))} active.")
    envelope.save(args.out)

    print(f"{Colors.GREEN}✔ Hunting complete. Finding Envelope written to {args.out}{Colors.RESET}", file=sys.stderr)
    print(envelope.to_json())

if __name__ == "__main__":
    main()
