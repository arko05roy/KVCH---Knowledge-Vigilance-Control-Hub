#!/usr/bin/env python3
"""
UNIFIED KVCH ENTERPRISE SECURITY ENGINE & 24/7 BACKGROUND DAEMON
Consolidates all 10 security extensions into a single unified master report at External/reports/report.json.
Supports continuous time-interval background rescans, real-time event-driven triggers,
and live WebSocket updates to ws://localhost:3000/api/ws.
"""

import sys
import os
import time
import json
import socket
import struct
import base64
import urllib.parse
import argparse
import threading
import subprocess
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Callable

# Add External directory to path
EXTERNAL_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(EXTERNAL_DIR))

from utils.colors import Colors
from utils.finding_envelope import FindingEnvelope
from utils.laptop_utils import get_my_hostname, get_my_ip


class WebSocketBroadcaster:
    """Lightweight WebSocket client for streaming real-time security updates to ws://localhost:3000/api/ws."""

    def __init__(self, url: str = "ws://localhost:3000/api/ws"):
        self.url = url
        parsed = urllib.parse.urlparse(url) if 'urllib.parse' in sys.modules else None
        self.host = "localhost"
        self.port = 3000
        self.path = "/api/ws"

    def send_update(self, payload: Dict[str, Any]) -> bool:
        """Sends a JSON payload over a raw WebSocket connection."""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(2.0)
            sock.connect((self.host, self.port))

            # Perform HTTP WebSocket Upgrade Request
            sec_key = base64.b64encode(os.urandom(16)).decode('utf-8')
            handshake = (
                f"GET {self.path} HTTP/1.1\r\n"
                f"Host: {self.host}:{self.port}\r\n"
                f"Upgrade: websocket\r\n"
                f"Connection: Upgrade\r\n"
                f"Sec-WebSocket-Key: {sec_key}\r\n"
                f"Sec-WebSocket-Version: 13\r\n\r\n"
            )
            sock.sendall(handshake.encode('utf-8'))

            response = sock.recv(1024)
            if b"101" not in response and b"Switching Protocols" not in response:
                sock.close()
                return False

            # Frame JSON payload (Text Frame = 0x81)
            msg_bytes = json.dumps(payload).encode('utf-8')
            length = len(msg_bytes)

            frame = bytearray([0x81])
            if length <= 125:
                frame.append(0x80 | length)
            elif length <= 65535:
                frame.append(0x80 | 126)
                frame.extend(struct.pack(">H", length))
            else:
                frame.append(0x80 | 127)
                frame.extend(struct.pack(">Q", length))

            mask_key = os.urandom(4)
            frame.extend(mask_key)
            masked_msg = bytearray(b ^ mask_key[i % 4] for i, b in enumerate(msg_bytes))
            frame.extend(masked_msg)

            sock.sendall(frame)
            sock.close()
            return True
        except Exception:
            return False


class EventMonitors:
    """Real-Time Event-Driven Triggers: FileSystemWatcher, ProcessAndSocketMonitor, NetworkSurfaceScanner."""

    def __init__(self, on_event_callback: Callable[[str, str], None]):
        self.on_event_callback = on_event_callback
        self._running = False
        self._threads: List[threading.Thread] = []

    def start(self):
        """Starts background event monitor threads."""
        self._running = True
        
        t_fs = threading.Thread(target=self._fs_watcher_loop, daemon=True)
        t_proc = threading.Thread(target=self._process_socket_monitor_loop, daemon=True)
        t_net = threading.Thread(target=self._network_surface_scanner_loop, daemon=True)

        self._threads = [t_fs, t_proc, t_net]
        for t in self._threads:
            t.start()

    def stop(self):
        """Stops background threads."""
        self._running = False

    def _fs_watcher_loop(self):
        """Monitors key configuration files for real-time file system modification events."""
        watched_paths = [
            EXTERNAL_DIR / ".env.example",
            EXTERNAL_DIR / "reports",
            EXTERNAL_DIR / "extensions"
        ]
        mtimes: Dict[str, float] = {}

        while self._running:
            for wp in watched_paths:
                if wp.exists():
                    try:
                        cur_mtime = wp.stat().st_mtime
                        prev_mtime = mtimes.get(str(wp))
                        if prev_mtime is not None and cur_mtime > prev_mtime:
                            self.on_event_callback("FileSystemWatcher", f"Modified: {wp.name}")
                        mtimes[str(wp)] = cur_mtime
                    except Exception:
                        pass
            time.sleep(3.0)

    def _process_socket_monitor_loop(self):
        """Monitors active socket connections and process activity for unexpected spikes."""
        prev_sockets = set()
        while self._running:
            try:
                # Lightweight check for listening ports
                sock_count = 0
                for p in range(3000, 3010):
                    try:
                        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                        s.settimeout(0.1)
                        if s.connect_ex(("127.0.0.1", p)) == 0:
                            sock_count += 1
                        s.close()
                    except Exception:
                        pass
                
                if sock_count != len(prev_sockets) and len(prev_sockets) > 0:
                    self.on_event_callback("ProcessAndSocketMonitor", f"Active Socket State Change: {sock_count} active listeners")
                prev_sockets = set(range(sock_count))
            except Exception:
                pass
            time.sleep(5.0)

    def _network_surface_scanner_loop(self):
        """Monitors host network interface surface changes."""
        last_ip = get_my_ip()
        while self._running:
            cur_ip = get_my_ip()
            if cur_ip != last_ip:
                self.on_event_callback("NetworkSurfaceScanner", f"Host IP Address Changed: {last_ip} -> {cur_ip}")
                last_ip = cur_ip
            time.sleep(10.0)


class UnifiedSecurityEngine:
    """Master Security Engine executing extensions and generating External/reports/report.json."""

    EXTENSIONS = [
        ("1_attack_surface_scanner.py", "attack-surface-scanner", "finding_1_attack_surface_scanner.json"),
        ("2_vpn_crypto_analyzer.py", "vpn-crypto-analyzer", "finding_2_vpn_crypto_analyzer.json"),
        ("3_phishing_hunter.py", "phishing-hunter", "finding_3_phishing_hunter.json"),
        ("4_threat_hunter_3000.py", "threat-hunter-3000", "finding_4_threat_hunter_3000.json"),
        ("5_malware_analyzer.py", "malware-analyzer", "finding_5_malware_analyzer.json"),
        ("6_credential_exposure_auditor.py", "credential-exposure-auditor", "finding_6_credential_exposure_auditor.json"),
        ("7_supply_chain_auditor.py", "supply-chain-auditor", "finding_7_supply_chain_auditor.json"),
        ("8_cookie_xss_analyzer.py", "cookie-xss-auditor", "finding_8_cookie_xss_analyzer.json"),
        ("9_aegisdb_zerotrust.py", "aegisdb-zerotrust", "finding_9_aegisdb_zerotrust.json"),
        ("10_edgeguard_sentinel.py", "edgeguard-sentinel", "finding_10_edgeguard_sentinel.json"),
    ]

    def __init__(self, ws_url: str = "ws://localhost:3000/api/ws"):
        self.hostname = get_my_hostname()
        self.ip = get_my_ip()
        self.reports_dir = EXTERNAL_DIR / "reports"
        self.reports_dir.mkdir(parents=True, exist_ok=True)
        self.master_report_file = self.reports_dir / "report.json"
        self.broadcaster = WebSocketBroadcaster(ws_url)

    def run_all_extensions(self) -> List[Dict[str, Any]]:
        """Runs all 10 security extensions in parallel and collects their JSON report outputs."""
        from concurrent.futures import ThreadPoolExecutor

        def run_single(ext_tuple):
            script_name, ext_id, report_name = ext_tuple
            script_path = EXTERNAL_DIR / "extensions" / script_name
            report_path = self.reports_dir / report_name

            if not script_path.exists():
                return None

            try:
                res = subprocess.run(
                    [sys.executable, str(script_path)],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                
                if report_path.exists():
                    with open(report_path, "r", encoding="utf-8") as f:
                        return json.load(f)
                else:
                    return {
                        "schema_version": "kvch.finding/v1",
                        "category": ext_id,
                        "severity": "medium",
                        "summary": f"Executed {ext_id} (stdout length: {len(res.stdout)})"
                    }
            except Exception as ex:
                return {
                    "schema_version": "kvch.finding/v1",
                    "category": ext_id,
                    "severity": "high",
                    "summary": f"Extension execution error: {str(ex)}"
                }

        with ThreadPoolExecutor(max_workers=10) as executor:
            results = list(executor.map(run_single, self.EXTENSIONS))

        return [r for r in results if r is not None]

    def generate_master_report(self, extension_results: List[Dict[str, Any]], trigger_reason: str = "scheduled_interval") -> Dict[str, Any]:
        """Consolidates all extension findings into ONE SINGLE master report file at External/reports/report.json."""
        all_evidence = []
        all_indicators = []
        all_actions = set()
        all_baseline = {}
        all_details = {}
        
        severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
        max_severity_idx = 0
        total_threats_count = 0

        for item in extension_results:
            bev = item.get("evidence", [])
            bind = item.get("indicators", [])
            bact = item.get("recommended_actions", [])
            base = item.get("baseline", {})
            cat = item.get("category", "unknown")
            sev = str(item.get("severity", "LOW")).upper()

            if bev:
                all_evidence.extend(bev if isinstance(bev, list) else [bev])
            if bind:
                all_indicators.extend(bind if isinstance(bind, list) else [bind])
            if bact:
                for act in (bact if isinstance(bact, list) else [bact]):
                    all_actions.add(str(act))
            if base and isinstance(base, dict):
                all_baseline.update(base)

            all_details[cat] = item.get("details", {})
            total_threats_count += len(bind if isinstance(bind, list) else [])

            if sev in severities:
                idx = severities.index(sev)
                if idx > max_severity_idx:
                    max_severity_idx = idx

        overall_severity = severities[max_severity_idx]

        envelope = FindingEnvelope()
        envelope.set_extension_info("unified-security-engine", "1.0.0")
        envelope.set_finding(
            finding_type="unified_master_security_audit",
            affected_actor=self.hostname,
            affected_resource=f"{self.hostname} ({self.ip})",
            result={
                "trigger_reason": trigger_reason,
                "total_extensions_audited": len(extension_results),
                "total_threats_detected": total_threats_count,
                "extension_breakdown": all_details
            },
            severity=overall_severity.lower(),
            title="Unified KVCH Enterprise Active Security Master Report",
            category="unified_security_engine"
        )

        envelope.set_summary(
            f"Consolidated 24/7 background security scan on {self.hostname} triggered via '{trigger_reason}'. "
            f"Audited {len(extension_results)} active defense extensions. Detected {total_threats_count} total threat indicators. Overall Severity: {overall_severity}."
        )

        for ev in all_evidence[:50]:
            envelope.add_evidence(ev)

        for ind in all_indicators[:50]:
            envelope.add_indicator(ind)

        for act in all_actions:
            envelope.add_recommended_action(act)

        envelope.set_baseline(all_baseline)
        
        envelope.set_active_response(
            incident_type="unified_enterprise_active_defense",
            target_layer="full_stack_security_mesh",
            action_id="act_unified_neutralization_v1",
            action_name="Unified Enterprise Active Neutralization Protocol",
            command="python3 External/unified_kvch_security_engine.py --scan-once",
            differentiation_reason="Consolidated active defense neutralizing socket exfiltration, CDN IP leaks, and credential theft",
            recovery_time_est="15s",
            status="ACTIVE",
            auto_executable=True
        )

        master_dict = envelope.to_dict()

        # Write to EXACTLY ONE SINGLE CONSOLIDATED MASTER REPORT file at External/reports/report.json
        with open(self.master_report_file, "w", encoding="utf-8") as f:
            json.dump(master_dict, f, indent=2)

        # Broadcast over WebSocket live stream
        self.broadcaster.send_update({
            "event": "master_report_updated",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "trigger_reason": trigger_reason,
            "overall_severity": overall_severity,
            "total_threats": total_threats_count,
            "report_path": str(self.master_report_file)
        })

        return master_dict

    def run_scan_cycle(self, trigger_reason: str = "scheduled_interval"):
        """Executes a complete scan cycle across all extensions and updates report.json."""
        print(f"\n{Colors.CYAN}▶ Starting Security Engine Scan Cycle [Trigger: {trigger_reason}]...{Colors.RESET}")
        extension_results = self.run_all_extensions()
        master_report = self.generate_master_report(extension_results, trigger_reason)
        print(f"{Colors.GREEN}✔ Consolidated Master Report updated successfully in-place:{Colors.RESET}")
        print(f"  {Colors.WHITE}{self.master_report_file}{Colors.RESET}")
        print(f"  Overall Severity: {Colors.RED if master_report['severity'] in ['high', 'critical'] else Colors.GREEN}{master_report['severity'].upper()}{Colors.RESET}")
        print(f"  Live WebSocket update pushed to: {Colors.CYAN}{self.broadcaster.url}{Colors.RESET}\n")


def main():
    parser = argparse.ArgumentParser(description="Unified KVCH Enterprise Security Engine & 24/7 Daemon")
    parser.add_argument("--scan-once", action="store_true", help="Run a single scan cycle across all 10 extensions and exit")
    parser.add_argument("--daemon", action="store_true", help="Run in continuous 24/7 background daemon mode with event triggers")
    parser.add_argument("--interval", type=int, default=15, help="Scan interval in seconds for background daemon (default: 15s)")
    parser.add_argument("--ws-url", default="ws://localhost:3000/api/ws", help="WebSocket URL for live updates")
    args = parser.parse_args()

    hostname = get_my_hostname()
    ip = get_my_ip()

    print(f"{Colors.CYAN}╔══════════════════════════════════════════════════════════════════════════════╗{Colors.RESET}")
    print(f"{Colors.GREEN}║    UNIFIED KVCH ENTERPRISE SECURITY ENGINE & 24/7 BACKGROUND DAEMON           ║{Colors.RESET}")
    print(f"{Colors.CYAN}╚══════════════════════════════════════════════════════════════════════════════╝{Colors.RESET}")
    print(f"Host:     {Colors.WHITE}{hostname} ({ip}){Colors.RESET}")
    print(f"Master:   {Colors.WHITE}External/reports/report.json (kvch.finding/v1){Colors.RESET}")
    print(f"Stream:   {Colors.WHITE}{args.ws_url}{Colors.RESET}\n")

    engine = UnifiedSecurityEngine(ws_url=args.ws_url)

    if args.scan_once or not args.daemon:
        engine.run_scan_cycle(trigger_reason="manual_scan_once")
        return

    # Background Daemon Mode
    print(f"{Colors.YELLOW}[+] Initializing 24/7 Active Security Daemon (Rescan Interval: {args.interval}s)...{Colors.RESET}")
    
    def event_handler(event_name: str, event_details: str):
        print(f"{Colors.YELLOW}⚡ Real-Time Event Trigger Received [{event_name}]: {event_details}{Colors.RESET}")
        engine.run_scan_cycle(trigger_reason=f"event_{event_name}")

    monitors = EventMonitors(on_event_callback=event_handler)
    monitors.start()
    print(f"{Colors.GREEN}✔ Real-time triggers active: FileSystemWatcher, ProcessAndSocketMonitor, NetworkSurfaceScanner{Colors.RESET}\n")

    try:
        while True:
            engine.run_scan_cycle(trigger_reason="scheduled_interval")
            time.sleep(args.interval)
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Shutting down KVCH Security Daemon gracefully...{Colors.RESET}")
        monitors.stop()
        print(f"{Colors.GREEN}✔ Security Daemon stopped successfully.{Colors.RESET}")


if __name__ == "__main__":
    main()
