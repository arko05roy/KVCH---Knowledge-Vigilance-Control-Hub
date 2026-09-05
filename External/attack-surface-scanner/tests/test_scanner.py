"""Unit tests for Attack Surface Scanner."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.adapters.laptop import get_my_ip, get_my_hostname
from src.core.scanner import AttackSurfaceScanner
from src.adapters.envelope import FindingEnvelope

class TestAttackSurfaceScanner(unittest.TestCase):
    def test_laptop_autodetect(self):
        ip = get_my_ip()
        hostname = get_my_hostname()
        self.assertIsNotNone(ip)
        self.assertTrue(len(ip) > 0)
        self.assertIsNotNone(hostname)

    def test_scanner_execution(self):
        scanner = AttackSurfaceScanner(target_ip="127.0.0.1", ports=[80, 443])
        res = scanner.run_scan()
        self.assertEqual(res["target_ip"], "127.0.0.1")
        self.assertIn("open_ports", res)

    def test_finding_envelope(self):
        envelope = FindingEnvelope()
        envelope.set_extension_info("attack-surface-scanner", "1.0.0")
        envelope.set_finding("test", "laptop", "127.0.0.1", {"status": "ok"})
        json_out = envelope.to_json()
        self.assertIn("attack-surface-scanner", json_out)
        self.assertIn("127.0.0.1", json_out)

if __name__ == "__main__":
    unittest.main()
