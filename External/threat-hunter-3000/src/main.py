#!/usr/bin/env python3
"""Threat Hunter 3000 - Main Entrypoint."""
import argparse
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.adapters.colors import Colors
from src.adapters.envelope import FindingEnvelope
from src.adapters.laptop import get_my_ip, get_my_hostname, get_my_interface
from src.core.threat_hunter import ThreatHunter3000

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def main():
    parser = argparse.ArgumentParser(description="KVCH Threat Hunter 3000 Extension")
    parser.add_argument("--interface", help="Network interface (defaults to auto-detected default route interface)")
    parser.add_argument("--duration", type=int, default=5, help="Capture duration in seconds")
    parser.add_argument("--out", help="Output JSON envelope path", default="threat_hunter_finding.json")
    args = parser.parse_args()

    ip = get_my_ip()
    hostname = get_my_hostname()
    interface = args.interface or get_my_interface()

    print(f"{Colors.CYAN}══════════════════════════════════════════════════════════════{Colors.RESET}")
    print(f"{Colors.GREEN}KVCH THREAT HUNTER 3000{Colors.RESET}")
    print(f"Target IP: {Colors.WHITE}{ip}{Colors.RESET}")
    print(f"Hostname:  {Colors.WHITE}{hostname}{Colors.RESET}")
    print(f"Interface: {Colors.WHITE}{interface}{Colors.RESET}")
    print(f"Duration:  {Colors.WHITE}{args.duration}s{Colors.RESET}")
    print(f"{Colors.CYAN}══════════════════════════════════════════════════════════════{Colors.RESET}\n")

    hunter = ThreatHunter3000(interface=interface, duration=args.duration)
    results = hunter.start_hunt()

    envelope = FindingEnvelope()
    envelope.set_extension_info("threat-hunter-3000", "1.0.0")
    envelope.set_finding(
        finding_type="threat_hunter_packet_scan",
        affected_actor=hostname,
        affected_resource=f"{ip} ({interface})",
        result=results
    )
    envelope.set_summary(f"Monitored {interface} for {args.duration}s. Processed {results['packets_observed']} packets.")
    envelope.save(args.out)

    print(f"{Colors.GREEN}✔ Threat hunting finished. Finding Envelope written to {args.out}{Colors.RESET}")
    print(envelope.to_json())

if __name__ == "__main__":
    main()
