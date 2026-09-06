"""Event Monitoring Engines for KVCH 24/7 EDR Agent.

Monitors File System changes, Process table activities, Network sockets,
and periodically triggers scanner engines.
"""

import os
import sys
import time
import json
import asyncio
import logging
import subprocess
from pathlib import Path
from typing import Dict, Any, List, Optional, Callable

logger = logging.getLogger("kvch.event_monitors")

EXTERNAL_DIR = Path(__file__).resolve().parent.parent
EXTENSIONS_DIR = EXTERNAL_DIR / "extensions"


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
    """Monitors file system changes in sensitive paths (/tmp, Downloads, project folders)."""

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
        logger.info("FileSystemWatcher started (watching /tmp, Downloads, ~/.ssh, ~/.aws)")
        
        # Initial snapshot
        self._snapshot()

        while self._running:
            await asyncio.sleep(self.poll_interval)
            try:
                changed_files = self._detect_changes()
                if changed_files:
                    logger.info(f"Detected file changes: {len(changed_files)} file(s). Triggering EDR analysis...")
                    # Trigger Malware Analyzer (5), Credential Auditor (6), and Supply Chain Auditor (7)
                    await self._trigger_scans(changed_files)
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

    async def _trigger_scans(self, files: List[Path]):
        # Run Malware Analyzer (Ext 5), Credential Auditor (Ext 6), Supply Chain Auditor (Ext 7)
        for ext_num in [5, 6, 7]:
            env = await run_extension_async(ext_num)
            if env:
                await self.callback(env)


class ProcessAndSocketMonitor(BaseMonitor):
    """Monitors running process tree, open network sockets, and autostart configurations."""

    def __init__(self, callback: Callable[[Dict[str, Any]], Any], poll_interval: float = 10.0):
        super().__init__(callback)
        self.poll_interval = poll_interval
        self._last_process_count = 0

    async def start(self):
        self._running = True
        logger.info("ProcessAndSocketMonitor started (monitoring process tree & sockets)")

        while self._running:
            await asyncio.sleep(self.poll_interval)
            try:
                proc_count = self._get_process_count()
                if self._last_process_count > 0 and abs(proc_count - self._last_process_count) > 5:
                    logger.info(f"Significant process count delta detected ({self._last_process_count} -> {proc_count}). Triggering Threat & VPN analysis...")
                    # Trigger VPN Crypto Analyzer (2), Phishing Hunter (3), Threat Hunter 3000 (4)
                    for ext_num in [2, 3, 4]:
                        env = await run_extension_async(ext_num)
                        if env:
                            await self.callback(env)
                self._last_process_count = proc_count
            except Exception as e:
                logger.error(f"ProcessAndSocketMonitor error: {e}")

    def _get_process_count(self) -> int:
        try:
            output = subprocess.check_output(["ps", "-ax"], stderr=subprocess.DEVNULL)
            return len(output.splitlines())
        except Exception:
            return 0


class NetworkSurfaceScanner(BaseMonitor):
    """Periodic continuous network port and HTTP surface scanner."""

    def __init__(self, callback: Callable[[Dict[str, Any]], Any], poll_interval: float = 60.0):
        super().__init__(callback)
        self.poll_interval = poll_interval

    async def start(self):
        self._running = True
        logger.info("NetworkSurfaceScanner started (periodic port & service surface scan)")

        while self._running:
            await asyncio.sleep(self.poll_interval)
            try:
                logger.info("Executing periodic Attack Surface Scan (Ext 1)...")
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
        
        # Read the generated finding report from reports/
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
