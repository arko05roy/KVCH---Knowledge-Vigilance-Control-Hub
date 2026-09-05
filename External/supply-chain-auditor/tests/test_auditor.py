"""Unit tests for Extension Supply-Chain & Integrity Auditor with MV3 and deobfuscation support."""

import os
import json
import tempfile
from pathlib import Path
from src.core.auditor import SupplyChainAuditor, Deobfuscator


def test_deobfuscator_normalizes_dynamic_code():
    obfuscated = r"document['create' + 'Element']('\x73\x63\x72\x69\x70\x74')"
    normalized = Deobfuscator.normalize(obfuscated)
    assert "script" in normalized


def test_auditor_clean_baseline():
    with tempfile.TemporaryDirectory() as tmpdir:
        script = Path(tmpdir) / "popup.js"
        script.write_text("console.log('Color picker loaded');")

        auditor = SupplyChainAuditor(target_path=tmpdir)
        results = auditor.audit()

        assert results["risk_score"] == 0
        assert results["overall_severity"] == "low"
        assert results["ai_role_projection"]["hold_required"] is False


def test_auditor_detects_mv3_offscreen_abuse():
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

        assert results["risk_score"] > 0
        assert any("offscreen" in ind.lower() for ind in results["indicators"])
        assert any("externally_connectable" in ind.lower() for ind in results["indicators"])
        assert results["ai_role_projection"]["hold_required"] is True
