#!/usr/bin/env python3
"""Phishing Hunter - Main Entrypoint."""
import argparse
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.adapters.colors import Colors
from src.adapters.envelope import FindingEnvelope
from src.adapters.laptop import get_my_hostname, get_my_ip
from src.core.hunter import PhishingHunter

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def main():
    parser = argparse.ArgumentParser(description="KVCH Phishing Hunter Extension")
    parser.add_argument("--domain", help="Target domain/hostname (defaults to laptop hostname)")
    parser.add_argument("--out", help="Output JSON finding path", default="phishing_finding.json")
    args = parser.parse_args()

    hostname = args.domain or get_my_hostname()
    ip = get_my_ip()

    print(f"{Colors.CYAN}══════════════════════════════════════════════════════════════{Colors.RESET}")
    print(f"{Colors.GREEN}KVCH PHISHING HUNTER{Colors.RESET}")
    print(f"Target Hostname: {Colors.WHITE}{hostname}{Colors.RESET}")
    print(f"Laptop IP:       {Colors.WHITE}{ip}{Colors.RESET}")
    print(f"{Colors.CYAN}══════════════════════════════════════════════════════════════{Colors.RESET}\n")

    hunter = PhishingHunter(target_domain=hostname)
    results = hunter.hunt()

    envelope = FindingEnvelope()
    envelope.set_extension_info("phishing-hunter", "1.0.0")
    envelope.set_finding(
        finding_type="phishing_typosquat_scan",
        affected_actor=hostname,
        affected_resource=hostname,
        result=results
    )
    envelope.set_summary(f"Targeted {hostname}. Generated {results['total_permutations']} typosquats. Found {len(results['active_phishing_domains'])} active.")
    envelope.save(args.out)

    print(f"{Colors.GREEN}✔ Hunting complete. Finding Envelope written to {args.out}{Colors.RESET}")
    print(envelope.to_json())

if __name__ == "__main__":
    main()
