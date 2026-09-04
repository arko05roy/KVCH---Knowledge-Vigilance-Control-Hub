#!/usr/bin/env python3
"""Standardized Finding Envelope for KVCH integration"""

import json
from datetime import datetime
from typing import Dict, Any, Optional

class FindingEnvelope:
    """Standard finding envelope format for KVCH"""
    
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
            "enforcement_result": "OBSERVE",  # ALLOW, HOLD, BLOCK, OBSERVE
            "safe_summary": "",
            "recipient": "",  # First role in escalation route
            "case_id": None,  # Filled by internal flow
            "technical_details": {},  # For engineers
            "executive_summary": {}   # For management
        }
    
    def set_extension_info(self, extension_id: str, version: str):
        self.data["extension_id"] = extension_id
        self.data["version"] = version
    
    def set_finding(self, finding_type: str, affected_actor: str, affected_resource: str, result: Dict):
        self.data["finding_type"] = finding_type
        self.data["observed_time"] = datetime.now().isoformat()
        self.data["affected_actor"] = affected_actor
        self.data["affected_resource"] = affected_resource
        self.data["result"] = result
    
    def add_evidence(self, evidence_path: str):
        self.data["evidence_refs"].append(evidence_path)
    
    def set_enforcement(self, enforcement: str):
        self.data["enforcement_result"] = enforcement
    
    def set_summary(self, safe_summary: str):
        self.data["safe_summary"] = safe_summary
    
    def set_recipient(self, recipient: str):
        self.data["recipient"] = recipient
    
    def set_technical_details(self, details: Dict):
        self.data["technical_details"] = details
    
    def set_executive_summary(self, summary: Dict):
        self.data["executive_summary"] = summary
    
    def to_json(self) -> str:
        return json.dumps(self.data, indent=2)
    
    def save(self, filename: str):
        with open(filename, 'w') as f:
            f.write(self.to_json())