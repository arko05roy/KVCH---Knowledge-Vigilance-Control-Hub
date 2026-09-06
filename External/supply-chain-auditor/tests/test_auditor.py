"""Unit tests for Extension Supply-Chain & Integrity Auditor with MV3 and deobfuscation support."""

import os
import sys
import json
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.auditor import SupplyChainAuditor, Deobfuscator


class TestSupplyChainAuditor(unittest.TestCase):
    def test_deobfuscator_normalizes_dynamic_code(self):
        obfuscated = r"document['create' + 'Element']('\x73\x63\x72\x69\x70\x74')"
        normalized = Deobfuscator.normalize(obfuscated)
        self.assertIn("script", normalized)

    def test_auditor_clean_baseline(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            script = Path(tmpdir) / "popup.js"
            script.write_text("console.log('Color picker loaded');")

            auditor = SupplyChainAuditor(target_path=tmpdir)
            results = auditor.audit()

            self.assertEqual(results["risk_score"], 0)
            self.assertEqual(results["overall_severity"], "low")
            self.assertFalse(results["ai_role_projection"]["hold_required"])

    def test_auditor_detects_mv3_offscreen_abuse(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            manifest = Path(tmpdir) / "manifest.json"
            manifest.write_text(json.dumps({
                "name": "Simple Weather Monitor",
                "version": "2.0.0",
                "permissions": ["offscreen", "scripting"],
                "externally_connectable": {"matches": ["*://*/*"]}
            }))

            auditor = SupplyChainAuditor(target_path=tmpdir)
            results = auditor.audit()

            self.assertGreater(results["risk_score"], 0)
            self.assertTrue(any("offscreen" in ind.lower() for ind in results["indicators"]))
            self.assertTrue(any("externally_connectable" in ind.lower() for ind in results["indicators"]))
            self.assertTrue(results["ai_role_projection"]["hold_required"])


if __name__ == "__main__":
    unittest.main()

