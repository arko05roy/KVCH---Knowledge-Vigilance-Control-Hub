"""Finding Envelope adapter for kvch.finding/v1 specification."""

import json
import time
import socket
from datetime import datetime
from typing import Dict, Any, List, Optional


class FindingEnvelope:
    """Constructs schema-compliant kvch.finding/v1 envelopes."""

    def __init__(
        self,
        severity: str,
        category: str,
        title: str,
        summary: str,
        resource: Dict[str, Any],
        evidence: List[Any],
        indicators: List[Any],
        baseline: Dict[str, Any],
        recommended_actions: List[Any],
        details: Dict[str, Any],
        observed_at: Optional[str] = None,
    ):
        self.schema_version = "kvch.finding/v1"
        self.observed_at = observed_at or datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        self.severity = severity
        self.category = category
        self.title = title
        self.summary = summary
        self.resource = resource
        self.evidence = evidence
        self.indicators = indicators
        self.baseline = baseline
        self.recommended_actions = recommended_actions
        self.details = details

    def to_dict(self) -> Dict[str, Any]:
        return {
            "schema_version": self.schema_version,
            "observed_at": self.observed_at,
            "severity": self.severity,
            "category": self.category,
            "title": self.title,
            "summary": self.summary,
            "resource": self.resource,
            "evidence": self.evidence,
            "indicators": self.indicators,
            "baseline": self.baseline,
            "recommended_actions": self.recommended_actions,
            "details": self.details,
        }

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent)
