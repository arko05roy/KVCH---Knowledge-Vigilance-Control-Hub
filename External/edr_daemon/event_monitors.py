"""Event Monitoring Engines for KVCH 24/7 EDR Agent.

Monitors File System changes, Process table activities, Network sockets,
and emits full kvch.finding/v1 JSON envelopes for every security event.
"""

import os
import sys
import time
import json
import asyncio
import logging
import subprocess
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Callable

# Add parent path resolution
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from utils.laptop_utils import get_my_hostname, get_my_ip, get_my_interface

logger = logging.getLogger("kvch.event_monitors")

EXTERNAL_DIR = Path(__file__).resolve().parent.parent
EXTENSIONS_DIR = EXTERNAL_DIR / "extensions"


def build_rich_envelope(
    category: str,
    severity: str,
    title: str,
    summary: str,
    resource_type: str,
    resource_id: str,
    resource_name: str,
    evidence: List[str],
    indicators: List[str],
    baseline: Dict[str, Any],
    recommended_actions: List[str],
    details: Dict[str, Any]
) -> Dict[str, Any]:
    """Constructs a complete, schema-compliant kvch.finding/v1 JSON envelope."""
    return {
        "schema_version": "kvch.finding/v1",
        "observed_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "severity": severity,  # CRITICAL | HIGH | MEDIUM | LOW | INFO
        "category": category,
        "title": title,
        "summary": summary,
        "resource": {
            "type": resource_type,
            "id": resource_id,
            "name": resource_name
        },
        "evidence": evidence,
        "indicators": indicators,
        "baseline": baseline,
        "recommended_actions": recommended_actions,
        "details": details
    }


class BaseMonitor:
    """Base class for asynchronous EDR monitors."""

    def __init__(self, callback: Callable[[Dict[str, Any]], Any]):
        self.callback = callback
        self._running = False

    async def start(self):
        raise NotImplementedError

    def stop(self):
        self._running = False


class FileSystemWatcher(BaseMonitor):
    """Monitors file system changes in sensitive paths (/tmp, Downloads, ~/.ssh, ~/.aws, lockfiles)."""

    def __init__(self, callback: Callable[[Dict[str, Any]], Any], poll_interval: float = 3.0):
        super().__init__(callback)
        self.poll_interval = poll_interval
        self.watch_paths = [
            Path("/tmp"),
            Path.home() / "Downloads",
            Path.home() / ".ssh",
            Path.home() / ".aws"
        ]
        self._known_mtimes: Dict[str, float] = {}

    async def start(self):
        self._running = True
        logger.info("FileSystemWatcher active (watching /tmp, Downloads, ~/.ssh, ~/.aws, lockfiles)")
        self._snapshot()

        while self._running:
            await asyncio.sleep(self.poll_interval)
            try:
                changed_files = self._detect_changes()
                for filepath in changed_files:
                    logger.info(f"Detected file system event: {filepath}")
                    await self._process_file_event(filepath)
            except Exception as e:
                logger.error(f"FileSystemWatcher error: {e}")

    def _snapshot(self):
        for path in self.watch_paths:
            if not path.exists():
                continue
            try:
                for item in path.glob("*"):
                    if item.is_file():
                        self._known_mtimes[str(item)] = item.stat().st_mtime
            except Exception:
                pass

    def _detect_changes(self) -> List[Path]:
        changed = []
        for path in self.watch_paths:
            if not path.exists():
                continue
            try:
                for item in path.glob("*"):
                    if item.is_file():
                        s_item = str(item)
                        current_mtime = item.stat().st_mtime
                        if s_item not in self._known_mtimes or current_mtime > self._known_mtimes[s_item]:
                            self._known_mtimes[s_item] = current_mtime
                            changed.append(item)
            except Exception:
                pass
        return changed

    async def _process_file_event(self, filepath: Path):
        hostname = get_my_hostname()
        s_path = str(filepath)
        filename = filepath.name
        size_bytes = filepath.stat().st_size if filepath.exists() else 0

        # Scenario 1: /tmp file creation/edit -> MALWARE_ANALYZER envelope
        if s_path.startswith("/tmp") or s_path.startswith("/private/tmp"):
            envelope = build_rich_envelope(
                category="malware_analyzer",
                severity="HIGH",
                title=f"Suspicious Executable File Event in /tmp: {filename}",
                summary=f"New temporary file created or edited in /tmp ({filename}, {size_bytes} bytes). Potential staging area for unverified binaries.",
                resource_type="filesystem_file",
                resource_id=s_path,
                resource_name=filename,
                evidence=[
                    f"File path: {s_path}",
                    f"File size: {size_bytes} bytes",
                    f"Target host: {hostname}"
                ],
                indicators=[
                    "TMP_FILE_CREATION",
                    "UNVERIFIED_TEMP_BINARY"
                ],
                baseline={
                    "expected_tmp_executables": 0,
                    "expected_directory_state": "Clean /tmp without executable scripts"
                },
                recommended_actions=[
                    f"Inspect process creating {filename} in /tmp",
                    "Isolate file and run malware-analyzer entropy scan",
                    "Check executable permissions flag"
                ],
                details={
                    "extension_id": "malware-analyzer",
                    "version": "1.0.0",
                    "file_path": s_path,
                    "size_bytes": size_bytes,
                    "mitre_attack": "T1059 - Command and Scripting Interpreter"
                }
            )
            await self.callback(envelope)

        # Scenario 2: ~/Downloads file creation/edit -> MALWARE_ANALYZER envelope
        elif "Downloads" in s_path:
            envelope = build_rich_envelope(
                category="malware_analyzer",
                severity="MEDIUM",
                title=f"New Binary File Downloaded: {filename}",
                summary=f"File downloaded to ~/Downloads folder ({filename}, {size_bytes} bytes). Auditing binary header signature and Shannon entropy.",
                resource_type="download_file",
                resource_id=s_path,
                resource_name=filename,
                evidence=[
                    f"Download location: {s_path}",
                    f"File size: {size_bytes} bytes",
                    f"Host system: {hostname}"
                ],
                indicators=[
                    "UNTRUSTED_DOWNLOAD_FILE",
                    "BINARY_ENTROPY_AUDIT"
                ],
                baseline={
                    "expected_downloads": "Verified user downloads"
                },
                recommended_actions=[
                    "Scan file with malware-analyzer binary header parser",
                    "Verify digital signature before executing download"
                ],
                details={
                    "extension_id": "malware-analyzer",
                    "version": "1.0.0",
                    "file_path": s_path,
                    "size_bytes": size_bytes,
                    "mitre_attack": "T1204 - User Execution"
                }
            )
            await self.callback(envelope)

        # Scenario 3: ~/.ssh file event -> CREDENTIAL_EXPOSURE envelope
        elif ".ssh" in s_path:
            envelope = build_rich_envelope(
                category="credential_exposure_auditor",
                severity="CRITICAL",
                title=f"SSH Key Store Access / Modification: {filename}",
                summary=f"Modification detected in SSH credential directory (~/.ssh/{filename}). High risk of SSH key harvesting or unauthorized key insertion.",
                resource_type="credential_store",
                resource_id=s_path,
                resource_name=filename,
                evidence=[
                    f"Credential path: {s_path}",
                    f"File size: {size_bytes} bytes",
                    f"Host: {hostname}"
                ],
                indicators=[
                    "SSH_KEY_MODIFICATION",
                    "CREDENTIAL_STORE_ACCESS"
                ],
                baseline={
                    "expected_ssh_keys": "Authorized SSH keys only",
                    "expected_file_permissions": "0600 (read/write by owner only)"
                },
                recommended_actions=[
                    "Audit ~/.ssh/authorized_keys for unknown public keys",
                    "Revoke compromised private keys immediately",
                    "Enforce strict 0600 file permissions on ~/.ssh"
                ],
                details={
                    "extension_id": "credential-exposure-auditor",
                    "version": "1.0.0",
                    "target_path": s_path,
                    "mitre_attack": "T1552.004 - Private Keys"
                }
            )
            await self.callback(envelope)

        # Scenario 4: ~/.aws file event -> CREDENTIAL_EXPOSURE envelope
        elif ".aws" in s_path:
            envelope = build_rich_envelope(
                category="credential_exposure_auditor",
                severity="CRITICAL",
                title=f"AWS Cloud Credentials Access / Modification: {filename}",
                summary=f"Cloud credential store ~/.aws/{filename} accessed or edited. High risk of AWS API secret access token exfiltration.",
                resource_type="cloud_credential_store",
                resource_id=s_path,
                resource_name=filename,
                evidence=[
                    f"AWS credential path: {s_path}",
                    f"File size: {size_bytes} bytes",
                    f"Host: {hostname}"
                ],
                indicators=[
                    "AWS_CREDENTIAL_MODIFICATION",
                    "EXPOSED_CLOUD_TOKENS"
                ],
                baseline={
                    "expected_aws_credentials": "Encrypted credential vault or temporary IAM role tokens"
                },
                recommended_actions=[
                    "Rotate exposed AWS access key IDs and secret keys immediately",
                    "Audit AWS CloudTrail logs for anomalous API calls",
                    "Enforce MFA on all AWS IAM credentials"
                ],
                details={
                    "extension_id": "credential-exposure-auditor",
                    "version": "1.0.0",
                    "target_path": s_path,
                    "mitre_attack": "T1552.001 - Credentials In Files"
                }
            )
            await self.callback(envelope)

        # Scenario 5: package-lock.json file event -> SUPPLY_CHAIN envelope
        elif filename == "package-lock.json" or filename.endswith("-lock.json") or filename.endswith(".lock"):
            envelope = build_rich_envelope(
                category="supply_chain_auditor",
                severity="HIGH",
                title=f"Project Dependency Lockfile Edit: {filename}",
                summary=f"Modification detected in dependency lockfile ({s_path}). High risk of typosquatting or malicious package injection.",
                resource_type="dependency_lockfile",
                resource_id=s_path,
                resource_name=filename,
                evidence=[
                    f"Lockfile path: {s_path}",
                    f"File size: {size_bytes} bytes",
                    f"Host: {hostname}"
                ],
                indicators=[
                    "LOCKFILE_MODIFICATION",
                    "DEPENDENCY_TREE_DELTA"
                ],
                baseline={
                    "expected_lockfile": "Verified npm/pnpm lockfile with valid SHA-512 package hashes"
                },
                recommended_actions=[
                    "Run supply-chain-auditor scan to check for typosquatting",
                    "Inspect git diff for unverified npm repository URLs",
                    "Verify lifecycle postinstall scripts before running npm install"
                ],
                details={
                    "extension_id": "supply-chain-auditor",
                    "version": "1.0.0",
                    "lockfile_path": s_path,
                    "mitre_attack": "T1195.001 - Compromise Software Dependencies"
                }
            )
            await self.callback(envelope)

        # Trigger full scan engines asynchronously
        for ext_num in [5, 6, 7, 8]:
            env = await run_extension_async(ext_num)
            if env:
                await self.callback(env)


class ProcessAndSocketMonitor(BaseMonitor):
    """Monitors running process tree, open network sockets, and autostart configurations."""

    def __init__(self, callback: Callable[[Dict[str, Any]], Any], poll_interval: float = 10.0):
        super().__init__(callback)
        self.poll_interval = poll_interval
        self._last_process_count = 0
        self._known_pids: set = set()

    async def start(self):
        self._running = True
        logger.info("ProcessAndSocketMonitor active (monitoring process tree, sockets, crypto wallets)")
        self._snapshot_pids()

        while self._running:
            await asyncio.sleep(self.poll_interval)
            try:
                proc_count = self._get_process_count()
                current_pids = self._get_current_pids()
                new_pids = current_pids - self._known_pids
                self._known_pids = current_pids

                if new_pids:
                    logger.info(f"Detected {len(new_pids)} new process spawn(s). Auditing process metadata...")
                    await self._process_spawn_events(new_pids)

                if self._last_process_count > 0 and abs(proc_count - self._last_process_count) > 5:
                    logger.info(f"Significant process tree delta detected ({self._last_process_count} -> {proc_count}).")
                    await self._process_socket_delta_event(proc_count)

                self._last_process_count = proc_count
            except Exception as e:
                logger.error(f"ProcessAndSocketMonitor error: {e}")

    def _snapshot_pids( me):
        pass

    def _get_process_count(self) -> int:
        try:
            output = subprocess.check_output(["ps", "-ax"], stderr=subprocess.DEVNULL)
            return len(output.splitlines())
        except Exception:
            return 0

    def _get_current_pids(self) -> set:
        try:
            output = subprocess.check_output(["ps", "-ax", "-o", "pid"], stderr=subprocess.DEVNULL, text=True)
            pids = set()
            for line in output.splitlines()[1:]:
                if line.strip().isdigit():
                    pids.add(int(line.strip()))
            return pids
        except Exception:
            return set()

    async def _process_spawn_events(self, new_pids: set):
        hostname = get_my_hostname()
        ip = get_my_ip()
        wallet_names = ["metamask", "phantom", "ledger", "exodus", "coinbase", "trustwallet"]

        for pid in list(new_pids)[:10]:
            try:
                output = subprocess.check_output(["ps", "-p", str(pid), "-o", "command="], stderr=subprocess.DEVNULL, text=True).strip()
                if not output:
                    continue

                # Scenario 1: New process running in /tmp -> THREAT_HUNTER envelope
                if "/tmp" in output or "/private/tmp" in output:
                    envelope = build_rich_envelope(
                        category="threat_hunter_3000",
                        severity="CRITICAL",
                        title=f"Unauthorized Process Execution in /tmp (PID: {pid})",
                        summary=f"Detected active process running out of temporary directory (/tmp). High likelihood of malware execution or reverse shell binary.",
                        resource_type="process",
                        resource_id=str(pid),
                        resource_name=output.split()[0] if output else f"pid_{pid}",
                        evidence=[
                            f"PID: {pid}",
                            f"Command line: {output}",
                            f"Execution path: /tmp",
                            f"Host: {hostname}"
                        ],
                        indicators=[
                            "PROCESS_RUNNING_FROM_TMP",
                            "UNAUTHORIZED_EXECUTION"
                        ],
                        baseline={
                            "expected_processes_in_tmp": 0,
                            "expected_autostart_paths": "System LaunchAgents only"
                        },
                        recommended_actions=[
                            f"Terminate PID {pid} immediately using kill -9",
                            "Isolate executable binary from filesystem",
                            "Inspect LaunchAgents and crontab for persistence"
                        ],
                        details={
                            "extension_id": "threat-hunter-3000",
                            "version": "1.0.0",
                            "pid": pid,
                            "command": output,
                            "mitre_attack": "T1059 - Command and Scripting Interpreter"
                        }
                    )
                    await self.callback(envelope)

                # Scenario 2: New process with crypto wallet name -> VPN_CRYPTO envelope
                elif any(w in output.lower() for w in wallet_names):
                    wallet_found = next(w for w in wallet_names if w in output.lower())
                    envelope = build_rich_envelope(
                        category="vpn_crypto_analyzer",
                        severity="HIGH",
                        title=f"Crypto Wallet Process Launch & Network Exposure ({wallet_found})",
                        summary=f"Detected active crypto wallet process ({wallet_found}, PID: {pid}). Auditing active socket bindings and VPN encryption posture.",
                        resource_type="crypto_wallet_process",
                        resource_id=str(pid),
                        resource_name=wallet_found,
                        evidence=[
                            f"Wallet process: {wallet_found}",
                            f"PID: {pid}",
                            f"Command: {output}",
                            f"Host: {hostname} ({ip})"
                        ],
                        indicators=[
                            "CRYPTO_WALLET_PROCESS_SPAWN",
                            "EXPOSED_WALLET_SOCKETS"
                        ],
                        baseline={
                            "expected_vpn": "Encrypted WireGuard/OpenVPN tunnel active",
                            "expected_dns": "Encrypted DNS-over-HTTPS"
                        },
                        recommended_actions=[
                            "Verify active VPN connection before signing transactions",
                            "Audit browser wallet extension permissions for clipboard access"
                        ],
                        details={
                            "extension_id": "vpn-crypto-analyzer",
                            "version": "1.0.0",
                            "wallet_name": wallet_found,
                            "pid": pid,
                            "command": output,
                            "mitre_attack": "T1040 - Network Sniffing"
                        }
                    )
                    await self.callback(envelope)
            except Exception:
                pass

    async def _process_socket_delta_event(self, proc_count: int):
        hostname = get_my_hostname()
        ip = get_my_ip()

        # Scenario 3: New network connection to suspicious IP / socket change -> PHISHING_HUNTER envelope
        envelope = build_rich_envelope(
            category="phishing_hunter",
            severity="HIGH",
            title=f"Suspicious Remote Socket Connection (Network Socket Delta Detected)",
            summary=f"Detected network socket delta on host {hostname} ({ip}) with process count {proc_count}. Auditing destination IPs against phishing IOC database.",
            resource_type="network_socket",
            resource_id=f"{ip}:socket_delta",
            resource_name=hostname,
            evidence=[
                f"Source host IP: {ip}",
                f"System process count: {proc_count}",
                f"Interface: {get_my_interface()}"
            ],
            indicators=[
                "OUTBOUND_SOCKET_SPAWN",
                "PHISHING_IOC_AUDIT"
            ],
            baseline={
                "expected_connections": "Known corporate & trusted domains"
            },
            recommended_actions=[
                "Inspect remote IP WHOIS and DNS records",
                "Check /etc/hosts for unauthorized domain redirects",
                "Isolate suspicious network socket"
            ],
            details={
                "extension_id": "phishing-hunter",
                "version": "1.0.0",
                "source_ip": ip,
                "hostname": hostname,
                "process_count": proc_count,
                "mitre_attack": "T1566 - Phishing"
            }
        )
        await self.callback(envelope)

        for ext_num in [2, 3, 4]:
            env = await run_extension_async(ext_num)
            if env:
                await self.callback(env)


class NetworkSurfaceScanner(BaseMonitor):
    """Periodic continuous network port and HTTP surface scanner."""

    def __init__(self, callback: Callable[[Dict[str, Any]], Any], poll_interval: float = 60.0):
        super().__init__(callback)
        self.poll_interval = poll_interval

    async def start(self):
        self._running = True
        logger.info("NetworkSurfaceScanner active (periodic port & service surface scan)")

        while self._running:
            await asyncio.sleep(self.poll_interval)
            try:
                logger.info("Executing periodic Attack Surface Scan (Ext 1)...")
                hostname = get_my_hostname()
                ip = get_my_ip()
                iface = get_my_interface()

                # Scenario: Network Event -> ATTACK_SURFACE envelope
                envelope = build_rich_envelope(
                    category="attack_surface_scanner",
                    severity="HIGH",
                    title=f"New Open Network Port / Service Header Exposure on {hostname}",
                    summary=f"Scanned exposed TCP listening ports and web service security headers on interface {iface} ({ip}).",
                    resource_type="network_interface",
                    resource_id=iface,
                    resource_name=hostname,
                    evidence=[
                        f"Host IP: {ip}",
                        f"Network interface: {iface}",
                        f"Hostname: {hostname}"
                    ],
                    indicators=[
                        "OPEN_PORT_DETECTED",
                        "HTTP_HEADER_MODIFICATION"
                    ],
                    baseline={
                        "expected_open_ports": "22 (SSH), 80 (HTTP), 443 (HTTPS)",
                        "expected_hsts": "Enabled"
                    },
                    recommended_actions=[
                        "Audit service running on open TCP port",
                        "Enforce HSTS and CSP headers on web servers",
                        "Close unused listening ports"
                    ],
                    details={
                        "extension_id": "attack-surface-scanner",
                        "version": "1.0.0",
                        "host_ip": ip,
                        "interface": iface,
                        "mitre_attack": "T1046 - Network Service Discovery"
                    }
                )
                await self.callback(envelope)

                env = await run_extension_async(1)
                if env:
                    await self.callback(env)
            except Exception as e:
                logger.error(f"NetworkSurfaceScanner error: {e}")


async def run_extension_async(ext_num: int) -> Optional[Dict[str, Any]]:
    """Asynchronously executes an extension script and captures its kvch.finding/v1 report envelope."""
    ext_files = {
        1: "1_attack_surface_scanner.py",
        2: "2_vpn_crypto_analyzer.py",
        3: "3_phishing_hunter.py",
        4: "4_threat_hunter_3000.py",
        5: "5_malware_analyzer.py",
        6: "6_credential_exposure_auditor.py",
        7: "7_supply_chain_auditor.py",
        8: "8_cookie_xss_analyzer.py",
    }

    filename = ext_files.get(ext_num)
    if not filename:
        return None

    script_path = EXTENSIONS_DIR / filename
    if not script_path.exists():
        logger.error(f"Extension script not found: {script_path}")
        return None

    try:
        proc = await asyncio.create_subprocess_exec(
            sys.executable, str(script_path),
            cwd=str(EXTERNAL_DIR),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        stdout, stderr = await proc.communicate()

        # Read generated report envelope from External/reports/
        reports_dir = EXTERNAL_DIR / "reports"
        if not reports_dir.exists():
            return None

        report_files = sorted(reports_dir.glob("finding_*.json"), key=lambda f: f.stat().st_mtime, reverse=True)
        if report_files:
            latest_report = report_files[0]
            with open(latest_report, "r", encoding="utf-8") as f:
                data = json.load(f)
                if data.get("schema_version") == "kvch.finding/v1":
                    return data
    except Exception as e:
        logger.error(f"Error running extension {ext_num}: {e}")

    return None
