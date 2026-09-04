"""KVCH Finding Envelope generator."""
import json
from datetime import datetime
from typing import Dict, Any, List

class FindingEnvelope:
    def __init__(self):
        self.data = {
            "extension_id": None,
            "version": "1.0.0",
            "finding_type": None,
            "observed_time": None,
            "affected_actor": None,
            "affected_resource": None,
            "result": {},
            "evidence_refs": [],
            "enforcement_result": "OBSERVE",
            "safe_summary": "",
            "recipient": "security_analyst",
            "technical_details": {},
            "executive_summary": {}
        }

    def set_extension_info(self, extension_id: str, version: str):
        self.data["extension_id"] = extension_id
        self.data["version"] = version

    def set_finding(self, finding_type: str, affected_actor: str, affected_resource: str, result: Dict[str, Any]):
        self.data["finding_type"] = finding_type
        self.data["observed_time"] = datetime.now().isoformat()
        self.data["affected_actor"] = affected_actor
        self.data["affected_resource"] = affected_resource
        self.data["result"] = result

    def set_summary(self, summary: str):
        self.data["safe_summary"] = summary

    def to_json(self) -> str:
        return json.dumps(self.data, indent=2)

    def save(self, filename: str):
        with open(filename, 'w') as f:
            f.write(self.to_json())
