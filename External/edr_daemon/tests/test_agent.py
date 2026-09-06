"""Unit tests for KVCH 24/7 EDR Agent, Event Monitors, and WebSocket Client."""

import os
import sys
import json
import time
import asyncio
import unittest
from pathlib import Path

# Add External path
EXTERNAL_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(EXTERNAL_DIR))

from edr_daemon.ws_client import WebSocketClient
from edr_daemon.event_monitors import (
    FileSystemWatcher,
    ProcessAndSocketMonitor,
    NetworkSurfaceScanner,
    run_extension_async
)
from edr_daemon.agent import KVCHAgent


class TestEDRDaemon(unittest.TestCase):

    def setUp(self):
        self.tmp_reports = EXTERNAL_DIR / "reports"
        self.tmp_reports.mkdir(parents=True, exist_ok=True)

    def test_ws_client_backup_locally(self):
        """Verify WebSocket client backs up report envelopes locally when offline."""
        test_dir = EXTERNAL_DIR / "artifacts" / "test_reports"
        test_dir.mkdir(parents=True, exist_ok=True)
        for f in test_dir.glob("finding_*.json"):
            f.unlink()

        client = WebSocketClient(server_url="ws://localhost:3000/api/ws", backup_dir=test_dir)
        envelope = {
            "schema_version": "kvch.finding/v1",
            "observed_at": "2026-09-06T14:30:00Z",
            "severity": "HIGH",
            "category": "malware",
            "title": "Test EDR Telemetry Finding",
            "summary": "EDR Agent local backup verification",
            "resource": {"type": "file", "path": "/tmp/suspicious.sh"},
            "evidence": ["chmod +x in /tmp"],
            "indicators": ["entropy:7.8"],
            "baseline": {"expected": "clean"},
            "recommended_actions": ["Isolate binary"],
            "details": {"auditor_version": "1.0.0"}
        }

        client._backup_locally(envelope)
        
        # Verify a finding file was generated in test_dir
        findings = list(test_dir.glob("finding_*.json"))
        self.assertTrue(len(findings) > 0, "Expected finding report backup in test_dir folder")
        
        with open(findings[0], "r", encoding="utf-8") as f:
            data = json.load(f)
            self.assertEqual(data["schema_version"], "kvch.finding/v1")
            self.assertEqual(data["title"], "Test EDR Telemetry Finding")

        # Cleanup
        for f in test_dir.glob("finding_*.json"):
            f.unlink()

    def test_file_system_watcher_rich_envelope(self):
        """Test FileSystemWatcher constructs full kvch.finding/v1 JSON envelope."""
        received = []

        async def dummy_callback(envelope):
            received.append(envelope)

        watcher = FileSystemWatcher(callback=dummy_callback, poll_interval=0.1)
        test_file = Path("/tmp/kvch_test_edr_watch.sh")
        test_file.write_text("echo test")

        try:
            asyncio.run(watcher._process_file_event(test_file))
            self.assertTrue(len(received) > 0, "Expected generated finding envelope")
            env = received[0]
            
            # Verify ALL required fields in kvch.finding/v1 envelope schema
            required_keys = [
                "schema_version", "observed_at", "severity", "category",
                "title", "summary", "resource", "evidence", "indicators",
                "baseline", "recommended_actions", "details"
            ]
            for key in required_keys:
                self.assertIn(key, env, f"Missing required envelope field: {key}")
                
            self.assertEqual(env["schema_version"], "kvch.finding/v1")
            self.assertEqual(env["category"], "malware_analyzer")
            self.assertIn("type", env["resource"])
            self.assertIn("id", env["resource"])
            self.assertIn("name", env["resource"])
        finally:
            if test_file.exists():
                test_file.unlink()

    def test_process_monitor_count(self):
        """Test ProcessAndSocketMonitor process count lookup."""
        async def dummy_callback(envelope):
            pass

        proc_mon = ProcessAndSocketMonitor(callback=dummy_callback)
        proc_count = proc_mon._get_process_count()
        self.assertGreater(proc_count, 0, "Expected ps -ax process count > 0")

    def test_run_extension_async(self):
        """Test async invocation of extension scanner engine."""
        async def run_test():
            env = await run_extension_async(5)
            if env:
                self.assertEqual(env["schema_version"], "kvch.finding/v1")

        asyncio.run(run_test())


if __name__ == "__main__":
    unittest.main()
