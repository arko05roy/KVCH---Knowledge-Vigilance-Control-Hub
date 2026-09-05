"""Core defensive auditing engine for extension supply-chain integrity and remote execution."""

import os
import re
import json
import math
from pathlib import Path
from collections import Counter
from typing import Dict, Any, List, Optional


class SupplyChainAuditor:
    """Audits browser extensions and scripts for supply chain drift and unauthorized remote execution."""

    OFFICIAL_UPDATE_URL_PREFIXES = [
        "https://clients2.google.com/service/update2/crx",
        "https://edge.microsoft.com/extensionwebstorebase/v1/crx",
        "https://versioncheck.addons.mozilla.org"
    ]

    DYNAMIC_SCRIPT_PATTERN = re.compile(r'document\.createElement\([\'"]script[\'"]\)|script\.src\s*=|importScripts\(', re.IGNORECASE)
    EVAL_PATTERN = re.compile(r'\beval\(|\bnew\s+Function\(|setTimeout\(\s*[\'"][^\'"]+[\'"]', re.IGNORECASE)
    WEBSOCKET_C2_PATTERN = re.compile(r'new\s+WebSocket\([\'"]wss?://[^\'"]+[\'"]\)', re.IGNORECASE)
    RAW_IP_ENDPOINT_PATTERN = re.compile(r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?')

    def __init__(self, target_path: Optional[str] = None):
        self.target_path = target_path

    def calculate_entropy(self, data: bytes) -> float:
        """Calculates Shannon entropy of byte sequence."""
        if not data:
            return 0.0
        entropy = 0.0
        length = len(data)
        counts = Counter(data)
        for count in counts.values():
            p = count / length
            entropy -= p * math.log2(p)
        return round(entropy, 3)

    def audit(self) -> Dict[str, Any]:
        results: Dict[str, Any] = {
            "target": self.target_path or "local_browser_profiles",
            "audited_extensions": [],
            "evidence": [],
            "indicators": [],
            "risk_score": 0,
            "overall_severity": "low",
            "baseline": {
                "remote_script_injection_allowed": False,
                "csp_loosening_allowed": False,
                "unverified_update_urls_allowed": False,
                "max_safe_code_entropy": 6.8
            },
            "recommended_actions": []
        }

        if not self.target_path or not os.path.exists(self.target_path):
            results["summary"] = "Target path not found. Baseline clean."
            return results

        target = Path(self.target_path)
        if target.is_file():
            results["audited_extensions"].append(self._audit_file(target))
        else:
            manifests = list(target.glob("**/manifest.json"))
            if manifests:
                for manifest_path in manifests:
                    results["audited_extensions"].append(self._audit_extension_folder(manifest_path.parent))
            else:
                results["audited_extensions"].append(self._audit_directory_scripts(target))

        total_risk = sum(ext.get("risk_score", 0) for ext in results["audited_extensions"])
        results["risk_score"] = min(100, total_risk)

        for ext in results["audited_extensions"]:
            results["evidence"].extend(ext.get("evidence", []))
            results["indicators"].extend(ext.get("indicators", []))

        if results["risk_score"] >= 75:
            results["overall_severity"] = "critical"
        elif results["risk_score"] >= 50:
            results["overall_severity"] = "high"
        elif results["risk_score"] >= 25:
            results["overall_severity"] = "medium"
        else:
            results["overall_severity"] = "low"

        if results["risk_score"] > 0:
            results["recommended_actions"] = [
                "Isolate and disable extensions using unverified update URLs or remote script execution",
                "Lock Content Security Policy to disallow 'unsafe-eval' across managed browsers",
                "Audit high-entropy script files for packed or obfuscated remote beacons"
            ]
        else:
            results["recommended_actions"] = [
                "Maintain periodic automated integrity audits for browser extension updates",
                "Monitor for unauthorized extension ownership transfers in enterprise fleet"
            ]

        return results

    def _audit_extension_folder(self, folder: Path) -> Dict[str, Any]:
        ext_info: Dict[str, Any] = {
            "name": folder.name,
            "path": str(folder),
            "risk_score": 0,
            "evidence": [],
            "indicators": []
        }

        manifest_file = folder / "manifest.json"
        if manifest_file.exists():
            try:
                with open(manifest_file, "r", encoding="utf-8", errors="ignore") as f:
                    manifest_data = json.load(f)

                ext_name = manifest_data.get("name", folder.name)
                ext_info["name"] = ext_name

                # 1. Update URL provenance check
                update_url = manifest_data.get("update_url", "")
                if update_url:
                    is_official = any(update_url.startswith(prefix) for prefix in self.OFFICIAL_UPDATE_URL_PREFIXES)
                    if not is_official:
                        ext_info["risk_score"] += 35
                        ext_info["indicators"].append(f"Unverified update_url detected in manifest: {update_url}")
                        ext_info["evidence"].append(f"manifest.update_url:{update_url}")

                # 2. Content Security Policy auditing
                csp = manifest_data.get("content_security_policy", "")
                if isinstance(csp, dict):
                    csp = json.dumps(csp)
                if "unsafe-eval" in csp:
                    ext_info["risk_score"] += 25
                    ext_info["indicators"].append("Loosened CSP: 'unsafe-eval' permitted in extension manifest")
                    ext_info["evidence"].append("manifest.csp:unsafe-eval")
                if "http://" in csp:
                    ext_info["risk_score"] += 20
                    ext_info["indicators"].append("Insecure HTTP origin declared in extension CSP")
                    ext_info["evidence"].append("manifest.csp:insecure_http")

            except Exception:
                pass

        # Scan code files for remote script injection, eval, entropy
        for script_file in folder.glob("**/*.[jJ][sS]"):
            findings = self._scan_script(script_file)
            ext_info["risk_score"] += findings["risk_delta"]
            ext_info["evidence"].extend(findings["evidence"])
            ext_info["indicators"].extend(findings["indicators"])

        return ext_info

    def _audit_file(self, file_path: Path) -> Dict[str, Any]:
        findings = self._scan_script(file_path)
        return {
            "name": file_path.name,
            "path": str(file_path),
            "risk_score": findings["risk_delta"],
            "evidence": findings["evidence"],
            "indicators": findings["indicators"]
        }

    def _audit_directory_scripts(self, directory: Path) -> Dict[str, Any]:
        total_risk = 0
        evidence = []
        indicators = []
        for script in directory.glob("**/*.[jJ][sS]"):
            res = self._scan_script(script)
            total_risk += res["risk_delta"]
            evidence.extend(res["evidence"])
            indicators.extend(res["indicators"])

        return {
            "name": directory.name,
            "path": str(directory),
            "risk_score": total_risk,
            "evidence": evidence,
            "indicators": indicators
        }

    def _scan_script(self, script_path: Path) -> Dict[str, Any]:
        risk_delta = 0
        evidence = []
        indicators = []

        try:
            raw_bytes = script_path.read_bytes()
            content = raw_bytes.decode("utf-8", errors="ignore")
            rel_name = script_path.name

            # 1. Dynamic script loading
            if self.DYNAMIC_SCRIPT_PATTERN.search(content):
                risk_delta += 35
                indicators.append(f"Dynamic remote script injection pattern in {rel_name}")
                evidence.append(f"dynamic_script_load:{rel_name}")

            # 2. Eval / dynamic execution
            if self.EVAL_PATTERN.search(content):
                risk_delta += 20
                indicators.append(f"Dynamic code evaluation (eval/Function) in {rel_name}")
                evidence.append(f"eval_call:{rel_name}")

            # 3. Shannon Entropy anomaly
            entropy = self.calculate_entropy(raw_bytes)
            if entropy > 6.9 and len(raw_bytes) > 4096:
                risk_delta += 30
                indicators.append(f"High-entropy packed payload anomaly (entropy={entropy}) in {rel_name}")
                evidence.append(f"high_entropy:{rel_name}:{entropy}")

            # 4. Raw IP C2 connection
            if self.RAW_IP_ENDPOINT_PATTERN.search(content):
                risk_delta += 25
                indicators.append(f"Hardcoded raw IP endpoint detected in {rel_name}")
                evidence.append(f"raw_ip_endpoint:{rel_name}")

            # 5. WebSocket C2 beaconing
            if self.WEBSOCKET_C2_PATTERN.search(content):
                risk_delta += 20
                indicators.append(f"WebSocket C2 connection initialized in {rel_name}")
                evidence.append(f"websocket_c2:{rel_name}")

        except Exception:
            pass

        return {
            "risk_delta": risk_delta,
            "evidence": evidence,
            "indicators": indicators
        }
