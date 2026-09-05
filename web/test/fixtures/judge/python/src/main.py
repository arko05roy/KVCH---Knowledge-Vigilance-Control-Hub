import json
import os

if os.environ.get("KVCH_EVALUATION") != "1":
    for index in (1, 2):
        print(json.dumps({
            "schema_version": "kvch.finding/v1",
            "observed_at": "2026-09-04T14:00:00Z",
            "severity": "high",
            "category": "fixture_threshold",
            "title": f"Synthetic threshold concern {index}",
            "summary": "Embedded fixture observation exceeds its baseline.",
            "resource": {"type": "fixture", "id": "python", "name": "Offline Python fixture"},
            "evidence": [],
            "indicators": [],
            "baseline": {"threshold": 10},
            "recommended_actions": [],
            "details": {"observed": index + 10, "threshold": 10, "synthetic": True},
        }))
