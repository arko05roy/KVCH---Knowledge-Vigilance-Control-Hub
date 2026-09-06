"""Unit tests for Credential Exposure Auditor with de-obfuscation and multi-chain support."""

import os
import sys
import json
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.auditor import CredentialAuditor, Deobfuscator


class TestCredentialAuditor(unittest.TestCase):
    def test_deobfuscator_hex_and_unicode(self):
        obfuscated = r"\x65\x76\x61\x6c('window[\"ethereum\"]')"
        normalized = Deobfuscator.normalize(obfuscated)
        self.assertIn("eval", normalized)
        self.assertIn("window.ethereum", normalized)

    def test_auditor_clean_baseline(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            script = Path(tmpdir) / "helper.js"
            script.write_text("console.log('Hello world'); function add(a,b){return a+b;}")

            auditor = CredentialAuditor(target_path=tmpdir)
            results = auditor.audit()

            self.assertEqual(results["risk_score"], 0)
            self.assertEqual(results["overall_severity"], "low")
            self.assertFalse(results["ai_role_projection"]["hold_required"])

    def test_auditor_detects_obfuscated_clipper(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            # Obfuscated clipboard clipper using hex escapes
            script = Path(tmpdir) / "background.js"
            script.write_text(r"""
            navigator['clipboard']['\x77\x72\x69\x74\x65\x54\x65\x78\x74']("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
            """)

            auditor = CredentialAuditor(target_path=tmpdir)
            results = auditor.audit()

            self.assertGreater(results["risk_score"], 0)
            self.assertTrue(any("clipper" in ind.lower() for ind in results["indicators"]))
            self.assertTrue(results["ai_role_projection"]["hold_required"])

    def test_auditor_detects_permit2_drainer(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            script = Path(tmpdir) / "drainer.js"
            script.write_text("""
            window.ethereum.request({
                method: 'eth_signTypedData_v4',
                params: [from, JSON.stringify(permit2Data)]
            });
            """)

            auditor = CredentialAuditor(target_path=tmpdir)
            results = auditor.audit()

            self.assertGreater(results["risk_score"], 0)
            self.assertTrue(any("drainer" in ind.lower() or "signature phishing" in ind.lower() for ind in results["indicators"]))


if __name__ == "__main__":
    unittest.main()

