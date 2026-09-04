"""Unit tests for Phishing Hunter."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.hunter import PhishingHunter
from src.adapters.envelope import FindingEnvelope

class TestPhishingHunter(unittest.TestCase):
    def test_typosquat_generation(self):
        hunter = PhishingHunter("my-laptop.local")
        perms = hunter.generate_permutations()
        self.assertTrue(len(perms) > 0)
        self.assertTrue(any("my-laptop" in p for p in perms))

    def test_hunter_scan(self):
        hunter = PhishingHunter("my-laptop.local")
        res = hunter.hunt()
        self.assertEqual(res["target_domain"], "my-laptop.local")
        self.assertIn("total_permutations", res)

    def test_finding_envelope(self):
        envelope = FindingEnvelope()
        envelope.set_extension_info("phishing-hunter", "1.0.0")
        envelope.set_finding("phishing", "laptop", "laptop.local", {"perms": 5})
        out = envelope.to_json()
        self.assertIn("phishing-hunter", out)

if __name__ == "__main__":
    unittest.main()
