"""Standardized Finding Envelope for KVCH integration (kvch.finding/v1)."""

import json
import copy
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

class FindingEnvelope:
    """Standard kvch.finding/v1 envelope format for KVCH."""
    
    def __init__(self):
        self.schema_version: str = "kvch.finding/v1"
        self.observed_at: str = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        self.severity: str = "medium"
        self.category: str = "security_finding"
        self.title: str = "Security Finding"
        self.summary: str = "Security observation detected."
        self.resource: Dict[str, Any] = {"type": "host", "id": "unknown", "name": "unknown"}
        self.evidence: List[Any] = []
        self.indicators: List[Any] = []
        self.baseline: Dict[str, Any] = {}
        self.recommended_actions: List[Any] = []
        self.details: Dict[str, Any] = {}
        
        self._extension_id: Optional[str] = None
        self._version: str = "1.0.0"

    def set_extension_info(self, extension_id: str, version: str):
        self._extension_id = extension_id
        self._version = version
        if not self.category or self.category == "security_finding":
            self.category = extension_id
        self.details["extension_id"] = extension_id
        self.details["version"] = version

    def set_finding(
        self,
        finding_type: str,
        affected_actor: str,
        affected_resource: str,
        result: Dict[str, Any],
        severity: str = "medium",
        title: Optional[str] = None,
        category: Optional[str] = None,
    ):
        self.observed_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        self.title = title or finding_type.replace("_", " ").title()
        if category:
            self.category = category
        elif self._extension_id:
            self.category = self._extension_id
        else:
            self.category = finding_type
            
        self.severity = severity
        self.resource = {
            "type": "resource",
            "id": str(affected_resource),
            "name": str(affected_actor)
        }
        self.details = copy.deepcopy(result) if isinstance(result, dict) else {"result": result}
        if self._extension_id:
            self.details["extension_id"] = self._extension_id
        if self._version:
            self.details["version"] = self._version

    def set_summary(self, summary: str):
        self.summary = summary or "Security observation detected."

    def add_evidence(self, item: Any):
        self.evidence.append(copy.deepcopy(item) if isinstance(item, (dict, list)) else item)

    def add_indicator(self, indicator: Any):
        self.indicators.append(copy.deepcopy(indicator) if isinstance(indicator, (dict, list)) else indicator)

    def add_recommended_action(self, action: Any):
        self.recommended_actions.append(copy.deepcopy(action) if isinstance(action, (dict, list)) else action)

    def set_baseline(self, baseline: Dict[str, Any]):
        self.baseline = copy.deepcopy(baseline) if isinstance(baseline, dict) else {}

    def set_enforcement(self, enforcement: str):
        self.details["enforcement_result"] = enforcement

    def set_recipient(self, recipient: str):
        self.details["recipient"] = recipient

    def set_technical_details(self, details: Dict[str, Any]):
        self.details["technical_details"] = copy.deepcopy(details) if isinstance(details, dict) else {"details": details}

    def set_executive_summary(self, summary: Dict[str, Any]):
        self.details["executive_summary"] = copy.deepcopy(summary) if isinstance(summary, dict) else {"summary": summary}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "schema_version": "kvch.finding/v1",
            "observed_at": self.observed_at or datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "severity": self.severity or "medium",
            "category": self.category or "security_finding",
            "title": self.title or "Security Finding",
            "summary": self.summary or "Security observation detected.",
            "resource": self.resource if isinstance(self.resource, dict) and self.resource else {"type": "host", "id": "unknown", "name": "unknown"},
            "evidence": self.evidence if isinstance(self.evidence, list) else [],
            "indicators": self.indicators if isinstance(self.indicators, list) else [],
            "baseline": self.baseline if isinstance(self.baseline, dict) else {},
            "recommended_actions": self.recommended_actions if isinstance(self.recommended_actions, list) else [],
            "details": self.details if isinstance(self.details, dict) else {}
        }

    def to_json(self, indent: Optional[int] = None) -> str:
        return json.dumps(self.to_dict(), indent=indent)

    def save(self, filename: str):
        with open(filename, 'w') as f:
            f.write(self.to_json(indent=2))
