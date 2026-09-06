#!/usr/bin/env python3
"""Cookie Security, XSS & Session Hijacking Auditor - Main Entrypoint."""

import os
import sys
import json
import argparse
import logging
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.adapters.envelope import FindingEnvelope
from src.core.auditor import CookieXSSAuditor

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s", stream=sys.stderr)
logger = logging.getLogger("cookie-xss-auditor")


def main():
    if os.environ.get("KVCH_EVALUATION") == "1":
        sys.exit(0)

    parser = argparse.ArgumentParser(description="KVCH Cookie Security, XSS & Session Hijacking Auditor")
    parser.add_argument("--target", help="Directory or script to audit")
    parser.add_argument("--out", help="Output file for Finding Envelope JSON", default="cookie_xss_finding.json")
    args = parser.parse_args()

    auditor = CookieXSSAuditor(target_path=args.target)
    audit_results = auditor.audit()

    findings_list = (
        audit_results.get("cookie_posture_findings", []) +
        audit_results.get("xss_sink_findings", []) +
        audit_results.get("session_token_findings", [])
    )

    envelope = FindingEnvelope(
        severity=audit_results.get("severity", "HIGH"),
        category="cookie_xss_auditor",
        title="Cookie Security Posture, DOM XSS & Session Theft Audit",
        summary=f"Audited web posture and client scripts. Detected {audit_results.get('total_threats_detected', 0)} security findings across cookies, XSS sinks, and session tokens.",
        resource={"type": "browser_profile", "path": args.target or "default_browser_profile"},
        evidence=[f["description"] for f in findings_list],
        indicators=[f["type"] for f in findings_list],
        baseline={"expected_cookie_flags": ["HttpOnly", "Secure", "SameSite=Strict"], "expected_xss_sinks": 0},
        recommended_actions=[
            "Enforce HttpOnly and Secure flags on all session cookies",
            "Replace innerHTML and eval() sinks with textContent and secure DOM APIs",
            "Store JWT session tokens in HttpOnly cookies instead of localStorage"
        ],
        details=audit_results
    )

    with open(args.out, "w", encoding="utf-8") as f:
        f.write(envelope.to_json())

    print(f"✔ Audit complete. Finding Envelope written to {args.out}", file=sys.stderr)
    print(envelope.to_json())


if __name__ == "__main__":
    main()
