"""Unit tests for Cookie Security, XSS & Session Hijacking Auditor."""

import os
import sys
import unittest
from pathlib import Path

# Path setup
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.core.auditor import CookieXSSAuditor
from src.adapters.envelope import FindingEnvelope


class TestCookieXSSAuditor(unittest.TestCase):

    def test_cookie_posture_audit(self):
        """Test Cookie Security Posture audit routine."""
        auditor = CookieXSSAuditor()
        findings = auditor.audit_browser_cookie_posture()
        self.assertGreater(len(findings), 0, "Expected cookie posture findings")
        self.assertTrue(any(f["type"] == "COOKIE_MISSING_HTTPONLY" for f in findings))

    def test_script_xss_sinks_audit(self):
        """Test DOM XSS sink detection routine."""
        auditor = CookieXSSAuditor()
        findings = auditor.audit_script_xss_sinks()
        self.assertGreater(len(findings), 0, "Expected DOM XSS sink findings")
        self.assertTrue(any(f["type"] == "DOM_XSS_SINK" for f in findings))

    def test_session_token_exposure_audit(self):
        """Test unencrypted session token exposure detection."""
        auditor = CookieXSSAuditor()
        findings = auditor.audit_session_token_exposure()
        self.assertGreater(len(findings), 0, "Expected session token exposure findings")
        self.assertTrue(any(f["type"] == "UNENCRYPTED_JWT_SESSION_TOKEN" for f in findings))

    def test_envelope_adapter(self):
        """Test FindingEnvelope formatting for kvch.finding/v1 compliance."""
        envelope = FindingEnvelope(
            severity="HIGH",
            category="cookie_xss_auditor",
            title="Test Cookie XSS Finding",
            summary="Test summary",
            resource={"type": "test"},
            evidence=["test evidence"],
            indicators=["DOM_XSS_SINK"],
            baseline={"expected": "clean"},
            recommended_actions=["Remediate XSS"],
            details={"auditor": "1.0.0"}
        )
        dict_data = envelope.to_dict()
        self.assertEqual(dict_data["schema_version"], "kvch.finding/v1")
        self.assertEqual(dict_data["severity"], "HIGH")
        self.assertEqual(dict_data["title"], "Test Cookie XSS Finding")


if __name__ == "__main__":
    unittest.main()
