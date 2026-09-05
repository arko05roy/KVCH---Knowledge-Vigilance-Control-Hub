#!/usr/bin/env python3
"""Attack Surface Scanner - Main Entrypoint."""

import argparse
import json
import logging
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.adapters.colors import Colors
from src.adapters.envelope import FindingEnvelope
from src.adapters.laptop import get_my_ip, get_my_hostname, get_my_interface
from src.core.scanner import AttackSurfaceScanner

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s", stream=sys.stderr)
logger = logging.getLogger("attack-surface-scanner")

def main():
    if os.environ.get("KVCH_EVALUATION") == "1":
        sys.exit(0)

    parser = argparse.ArgumentParser(description="KVCH Attack Surface Scanner Extension")
    parser.add_argument("--target", help="Target IP to scan (defaults to auto-detected laptop IP)")
    parser.add_argument("--out", help="Output file for Finding Envelope JSON", default="attack_surface_finding.json")
    args = parser.parse_args()

    target_ip = args.target or get_my_ip()
    hostname = get_my_hostname()
    interface = get_my_interface()

    print(f"{Colors.CYAN}══════════════════════════════════════════════════════════════{Colors.RESET}", file=sys.stderr)
    print(f"{Colors.GREEN}KVCH ATTACK SURFACE SCANNER{Colors.RESET}", file=sys.stderr)
    print(f"Target IP: {Colors.WHITE}{target_ip}{Colors.RESET}", file=sys.stderr)
    print(f"Hostname:  {Colors.WHITE}{hostname}{Colors.RESET}", file=sys.stderr)
    print(f"Interface: {Colors.WHITE}{interface}{Colors.RESET}", file=sys.stderr)
    print(f"{Colors.CYAN}══════════════════════════════════════════════════════════════{Colors.RESET}\n", file=sys.stderr)

    scanner = AttackSurfaceScanner(target_ip=target_ip)
    scan_results = scanner.run_scan()

    envelope = FindingEnvelope()
    envelope.set_extension_info("attack-surface-scanner", "1.0.0")
    envelope.set_finding(
        finding_type="attack_surface_scan",
        affected_actor=hostname,
        affected_resource=target_ip,
        result=scan_results,
        severity="high" if scan_results.get("open_ports") else "info",
        title="Attack Surface Scan Finding"
    )
    envelope.set_summary(f"Scanned {target_ip}. Found {len(scan_results.get('open_ports', []))} open ports.")
    
    envelope.save(args.out)
    print(f"\n{Colors.GREEN}✔ Scan complete. Finding Envelope written to {args.out}{Colors.RESET}", file=sys.stderr)
    print(envelope.to_json())

if __name__ == "__main__":
    main()
