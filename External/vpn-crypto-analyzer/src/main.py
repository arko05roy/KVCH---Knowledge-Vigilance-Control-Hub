#!/usr/bin/env python3
"""VPN Crypto Analyzer - Main Entrypoint."""

import argparse
import logging
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.adapters.colors import Colors
from src.adapters.envelope import FindingEnvelope
from src.adapters.laptop import get_my_ip, get_my_hostname, get_my_interface
from src.core.analyzer import VPNAnalyzer

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s", stream=sys.stderr)

def main():
    if os.environ.get("KVCH_EVALUATION") == "1":
        sys.exit(0)

    parser = argparse.ArgumentParser(description="KVCH VPN Crypto Analyzer Extension")
    parser.add_argument("--pcap", help="Path to PCAP capture file")
    parser.add_argument("--out", help="Output JSON envelope path", default="vpn_crypto_finding.json")
    args = parser.parse_args()

    ip = get_my_ip()
    hostname = get_my_hostname()
    interface = get_my_interface()

    print(f"{Colors.CYAN}══════════════════════════════════════════════════════════════{Colors.RESET}", file=sys.stderr)
    print(f"{Colors.GREEN}KVCH VPN CRYPTO ANALYZER{Colors.RESET}", file=sys.stderr)
    print(f"Target IP: {Colors.WHITE}{ip}{Colors.RESET}", file=sys.stderr)
    print(f"Hostname:  {Colors.WHITE}{hostname}{Colors.RESET}", file=sys.stderr)
    print(f"Interface: {Colors.WHITE}{interface}{Colors.RESET}", file=sys.stderr)
    if args.pcap:
        print(f"PCAP File: {Colors.WHITE}{args.pcap}{Colors.RESET}", file=sys.stderr)
    print(f"{Colors.CYAN}══════════════════════════════════════════════════════════════{Colors.RESET}\n", file=sys.stderr)

    analyzer = VPNAnalyzer(pcap_file=args.pcap)
    results = analyzer.analyze()

    envelope = FindingEnvelope()
    envelope.set_extension_info("vpn-crypto-analyzer", "1.0.0")
    envelope.set_finding(
        finding_type="vpn_crypto_analysis",
        affected_actor=hostname,
        affected_resource=ip,
        result=results,
        severity="medium",
        title="VPN Crypto Analysis Finding"
    )
    envelope.set_summary(f"Analyzed VPN crypto status. Score: {results.get('security_score', 0)}/100")
    envelope.save(args.out)

    print(f"{Colors.GREEN}✔ Analysis complete. Finding Envelope written to {args.out}{Colors.RESET}", file=sys.stderr)
    print(envelope.to_json())

if __name__ == "__main__":
    main()
