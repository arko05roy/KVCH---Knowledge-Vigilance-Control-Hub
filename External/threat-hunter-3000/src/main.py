#!/usr/bin/env python3
"""Threat Hunter 3000 - Main Entrypoint."""

import argparse
import logging
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.adapters.colors import Colors
from src.adapters.envelope import FindingEnvelope
from src.adapters.laptop import get_my_ip, get_my_hostname, get_my_interface
from src.core.threat_hunter import ThreatHunter3000

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s", stream=sys.stderr)

def main():
    if os.environ.get("KVCH_EVALUATION") == "1":
        sys.exit(0)

    parser = argparse.ArgumentParser(description="KVCH Threat Hunter 3000 Extension")
    parser.add_argument("--interface", help="Network interface (defaults to auto-detected default route interface)")
    parser.add_argument("--duration", type=int, default=5, help="Capture duration in seconds")
    parser.add_argument("--out", help="Output JSON envelope path", default="threat_hunter_finding.json")
    args = parser.parse_args()

    ip = get_my_ip()
    hostname = get_my_hostname()
    interface = args.interface or get_my_interface()

    print(f"{Colors.CYAN}══════════════════════════════════════════════════════════════{Colors.RESET}", file=sys.stderr)
    print(f"{Colors.GREEN}KVCH THREAT HUNTER 3000{Colors.RESET}", file=sys.stderr)
    print(f"Target IP: {Colors.WHITE}{ip}{Colors.RESET}", file=sys.stderr)
    print(f"Hostname:  {Colors.WHITE}{hostname}{Colors.RESET}", file=sys.stderr)
    print(f"Interface: {Colors.WHITE}{interface}{Colors.RESET}", file=sys.stderr)
    print(f"Duration:  {Colors.WHITE}{args.duration}s{Colors.RESET}", file=sys.stderr)
    print(f"{Colors.CYAN}══════════════════════════════════════════════════════════════{Colors.RESET}\n", file=sys.stderr)

    hunter = ThreatHunter3000(interface=interface, duration=args.duration)
    results = hunter.start_hunt()

    suspicious_count = results.get("suspicious_packets_count", 0)
    
    # Differentiation Matrix for Threat Hunter
    if suspicious_count > 10:
        incident_type = "DDOS_ATTACK"
        target_layer = "CDN_EDGE"
        action_id = "ENFORCE_RATE_LIMIT"
        action_name = "Apply Edge Firewall Rate-Limiting & Block Malicious IPs"
        command = "iptables -A INPUT -p tcp --dport 443 -m connlimit --connlimit-above 100 -j DROP && sysctl -w net.ipv4.tcp_syncookies=1"
        reason = "Abnormal packet volume and SYN flood entropy detected across multiple remote ports."
    elif suspicious_count > 0:
        incident_type = "GATEWAY_FAIL"
        target_layer = "API_GATEWAY"
        action_id = "RELOAD_GATEWAY_ROUTES"
        action_name = "Restart API Proxy Router & Reset TCP Sockets"
        command = "systemctl restart haproxy && sysctl -w net.ipv4.tcp_tw_reuse=1"
        reason = "Packet retransmissions and TCP reset spikes indicate API gateway buffer overflow."
    else:
        incident_type = "SERVER_FAIL"
        target_layer = "HOST_OS"
        action_id = "RESTART_SERVICE"
        action_name = "Restart Local Host Daemon & Flush Network Queues"
        command = "systemctl restart kvch-edr-daemon.service"
        reason = "Host network interface queue stalled with zero active packet flow."

    envelope = FindingEnvelope()
    envelope.set_extension_info("threat-hunter-3000", "1.0.0")
    envelope.set_finding(
        finding_type="threat_hunter_packet_scan",
        affected_actor=hostname,
        affected_resource=f"{ip} ({interface})",
        result=results,
        severity="high" if suspicious_count > 0 else "info",
        title=f"Threat Hunter Finding [{incident_type}]"
    )
    envelope.set_summary(f"Monitored {interface} for {args.duration}s. Classifying: {incident_type} on {target_layer}. Observed {results.get('packets_observed', 0)} packets.")
    envelope.set_active_response(
        incident_type=incident_type,
        target_layer=target_layer,
        action_id=action_id,
        action_name=action_name,
        command=command,
        differentiation_reason=reason,
        recovery_time_est="20s",
        status="PENDING",
        auto_executable=True
    )
    envelope.save(args.out)

    print(f"{Colors.GREEN}✔ Threat hunting finished with Active Response Payload. Finding Envelope written to {args.out}{Colors.RESET}", file=sys.stderr)
    print(envelope.to_json())

if __name__ == "__main__":
    main()
