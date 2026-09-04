"""Unit tests for VPN Crypto Analyzer."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.analyzer import VPNAnalyzer
from src.adapters.envelope import FindingEnvelope

class TestVPNAnalyzer(unittest.TestCase):
    def test_vpn_analyzer_basic(self):
        analyzer = VPNAnalyzer()
        res = analyzer.analyze()
        self.assertIn("security_score", res)
        self.assertIsNotNone(res["target_ip"])

    def test_vpn_finding_envelope(self):
        envelope = FindingEnvelope()
        envelope.set_extension_info("vpn-crypto-analyzer", "1.0.0")
        envelope.set_finding("vpn_crypto", "laptop", "127.0.0.1", {"score": 90})
        out = envelope.to_json()
        self.assertIn("vpn-crypto-analyzer", out)

if __name__ == "__main__":
    unittest.main()
