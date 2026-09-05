"""Unit tests for Credential Exposure Auditor."""

import os
import json
import tempfile
from pathlib import Path
from src.core.auditor import CredentialAuditor


def test_auditor_clean_baseline():
    with tempfile.TemporaryDirectory() as tmpdir:
        # Create benign script
        script = Path(tmpdir) / "helper.js"
        script.write_text("console.log('Hello world'); function add(a,b){return a+b;}")

        auditor = CredentialAuditor(target_path=tmpdir)
        results = auditor.audit()

        assert results["risk_score"] == 0
        assert results["overall_severity"] == "low"


def test_auditor_detects_clipper_pattern():
    with tempfile.TemporaryDirectory() as tmpdir:
        # Create suspicious clipper script
        script = Path(tmpdir) / "background.js"
        script.write_text("""
        navigator.clipboard.writeText("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
        """)

        auditor = CredentialAuditor(target_path=tmpdir)
        results = auditor.audit()

        assert results["risk_score"] > 0
        assert any("clipper" in ind.lower() for ind in results["indicators"])


def test_auditor_detects_deceptive_utility_permissions():
    with tempfile.TemporaryDirectory() as tmpdir:
        manifest = Path(tmpdir) / "manifest.json"
        manifest.write_text(json.dumps({
            "name": "Super PDF Converter & OCR Reader",
            "version": "1.0.0",
            "permissions": ["clipboardRead", "clipboardWrite", "<all_urls>"]
        }))

        auditor = CredentialAuditor(target_path=tmpdir)
        results = auditor.audit()

        assert results["risk_score"] > 0
        assert any("deceptive permission" in ind.lower() for ind in results["indicators"])
