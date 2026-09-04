"""Unit tests for Threat Hunter 3000."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.threat_hunter import ThreatHunter3000
from src.adapters.envelope import FindingEnvelope

class TestThreatHunter(unittest.TestCase):
    def test_threat_hunter_execution(self):
        hunter = ThreatHunter3000(interface="en0", duration=1)
        res = hunter.start_hunt()
        self.assertEqual(res["interface"], "en0")
        self.assertIn("packets_observed", res)
        self.assertIn("mitre_mappings", res)

    def test_finding_envelope(self):
        envelope = FindingEnvelope()
        envelope.set_extension_info("threat-hunter-3000", "1.0.0")
        envelope.set_finding("threat_hunter", "laptop", "192.168.31.204", {"packets": 10})
        out = envelope.to_json()
        self.assertIn("threat-hunter-3000", out)

if __name__ == "__main__":
    unittest.main()
