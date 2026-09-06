"""Finding Envelope for KVCH integration (kvch.finding/v1)."""

import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from pathlib import Path


class FindingEnvelope:
    """Standard kvch.finding/v1 envelope format."""

    def __init__(self):
        self.schema_version: str = "kvch.finding/v1"
        self.observed_at: str = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        self.severity: str = "medium"
        self.category: str = "credential_exposure_auditor"
        self.title: str = "Credential Exposure Audit Finding"
        self.summary: str = "Audit completed."
        self.resource: Dict[str, Any] = {"type": "host", "id": "unknown", "name": "unknown"}
        self.evidence: List[Any] = []
        self.indicators: List[Any] = []
        self.baseline: Dict[str, Any] = {}
        self.recommended_actions: List[Any] = []
        self.details: Dict[str, Any] = {}

        self._extension_id: Optional[str] = "credential-exposure-auditor"
        self._version: str = "1.0.0"

    def set_extension_info(self, extension_id: str, version: str):
        self._extension_id = extension_id
        self._version = version
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
        self.category = category or self._extension_id or finding_type
        self.severity = severity
        self.resource = {
            "type": "resource",
            "id": str(affected_resource),
            "name": str(affected_actor)
        }

        self.evidence = result.get("evidence", [])
        self.indicators = result.get("indicators", [])
        self.baseline = result.get("baseline", {
            "unauthorized_credential_access": False,
            "clipboard_tampering_allowed": False,
            "web3_provider_overrides": False
        })
        self.recommended_actions = result.get("recommended_actions", [
            "Quarantine and remove flagged extensions with unauthorized clipboard permissions",
            "Audit browser extensions requesting broad host access permissions (<all_urls>)",
            "Rotate any credentials or API keys exposed on endpoints"
        ])
        self.details.update(result)

    def set_summary(self, summary: str):
        self.summary = summary

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

    def save(self, filepath: str) -> None:
        Path(filepath).parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(self.to_json())
