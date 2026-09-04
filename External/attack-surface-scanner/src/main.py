#!/usr/bin/env python3
"""Attack Surface Scanner - Main Entrypoint."""

import argparse
import json
import logging
import sys
from pathlib import Path

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.adapters.colors import Colors
from src.adapters.envelope import FindingEnvelope
from src.adapters.laptop import get_my_ip, get_my_hostname, get_my_interface
from src.core.scanner import AttackSurfaceScanner

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("attack-surface-scanner")

def main():
    parser = argparse.ArgumentParser(description="KVCH Attack Surface Scanner Extension")
    parser.add_argument("--target", help="Target IP to scan (defaults to auto-detected laptop IP)")
    parser.add_argument("--out", help="Output file for Finding Envelope JSON", default="attack_surface_finding.json")
    args = parser.parse_args()

    target_ip = args.target or get_my_ip()
    hostname = get_my_hostname()
    interface = get_my_interface()

    print(f"{Colors.CYAN}══════════════════════════════════════════════════════════════{Colors.RESET}")
    print(f"{Colors.GREEN}KVCH ATTACK SURFACE SCANNER{Colors.RESET}")
    print(f"Target IP: {Colors.WHITE}{target_ip}{Colors.RESET}")
    print(f"Hostname:  {Colors.WHITE}{hostname}{Colors.RESET}")
    print(f"Interface: {Colors.WHITE}{interface}{Colors.RESET}")
    print(f"{Colors.CYAN}══════════════════════════════════════════════════════════════{Colors.RESET}\n")

    scanner = AttackSurfaceScanner(target_ip=target_ip)
    scan_results = scanner.run_scan()

    envelope = FindingEnvelope()
    envelope.set_extension_info("attack-surface-scanner", "1.0.0")
    envelope.set_finding(
        finding_type="attack_surface_scan",
        affected_actor=hostname,
        affected_resource=target_ip,
        result=scan_results
    )
    envelope.set_summary(f"Scanned {target_ip}. Found {len(scan_results['open_ports'])} open ports.")
    
    envelope.save(args.out)
    print(f"\n{Colors.GREEN}✔ Scan complete. Finding Envelope written to {args.out}{Colors.RESET}")
    print(envelope.to_json())

if __name__ == "__main__":
    main()
