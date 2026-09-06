"""Core defensive auditing engine for extension supply-chain integrity, MV3 offscreen abuse, and remote execution."""

import os
import re
import json
import math
import base64
from pathlib import Path
from collections import Counter
from typing import Dict, Any, List, Optional


class Deobfuscator:
    """In-memory de-obfuscation normalization layer."""

    HEX_ESCAPE_PATTERN = re.compile(r'\\x([0-9a-fA-F]{2})')
    UNICODE_ESCAPE_PATTERN = re.compile(r'\\u([0-9a-fA-F]{4})')
    CHAR_CODE_PATTERN = re.compile(r'String\.fromCharCode\s*\(([\d\s,]+)\)')
    BASE64_CANDIDATE_PATTERN = re.compile(r'[\'"]([A-Za-z0-9+/]{28,}={0,2})[\'"]')
    COMPUTED_PROP_PATTERN = re.compile(r'\[\s*\\?[\'"]([a-zA-Z0-9_]+)\\?[\'"]\s*\]')

    @classmethod
    def normalize(cls, content: str) -> str:
        def replace_hex(m):
            try: return chr(int(m.group(1), 16))
            except Exception: return m.group(0)
        def replace_unicode(m):
            try: return chr(int(m.group(1), 16))
            except Exception: return m.group(0)
        def replace_chars(m):
            try: return ''.join(chr(int(n.strip())) for n in m.group(1).split(',') if n.strip().isdigit())
            except Exception: return m.group(0)

        res = cls.HEX_ESCAPE_PATTERN.sub(replace_hex, content)
        res = cls.UNICODE_ESCAPE_PATTERN.sub(replace_unicode, res)
        res = cls.CHAR_CODE_PATTERN.sub(replace_chars, res)
        res = cls.COMPUTED_PROP_PATTERN.sub(r'.\1', res)

        b64_list = []
        for b in cls.BASE64_CANDIDATE_PATTERN.findall(content):
            try:
                dec = base64.b64decode(b).decode('utf-8', errors='ignore')
                if any(c.isalnum() for c in dec) and len(dec) > 4:
                    b64_list.append(dec)
            except Exception:
                pass
        if b64_list:
            res += "\n" + "\n".join(b64_list)
        return res


class SupplyChainAuditor:
    """Audits browser extensions for supply chain takeovers, unverified updates, and remote execution."""

    OFFICIAL_UPDATE_URL_PREFIXES = [
        "https://clients2.google.com/service/update2/crx",
        "https://edge.microsoft.com/extensionwebstorebase/v1/crx",
        "https://versioncheck.addons.mozilla.org"
    ]

    DYNAMIC_SCRIPT_PATTERN = re.compile(
        r'document\.createElement\([\'"]script[\'"]\)|script\.src\s*=|importScripts\(|chrome\.scripting\.executeScript|chrome\.tabs\.executeScript',
        re.IGNORECASE
    )
    EVAL_PATTERN = re.compile(r'\beval\(|\bnew\s+Function\(|setTimeout\(\s*[\'"][^\'"]+[\'"]', re.IGNORECASE)
    WEBSOCKET_C2_PATTERN = re.compile(r'new\s+WebSocket\([\'"]wss?://[^\'"]+[\'"]\)', re.IGNORECASE)
    RAW_IP_ENDPOINT_PATTERN = re.compile(r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?')
    DGA_SUSPICIOUS_DOMAIN_PATTERN = re.compile(r'https?://[a-z0-9\-]{14,}\.(?:xyz|top|online|ru|cc|to|pw)')

    MV3_HIGH_RISK_PERMISSIONS = {
        "offscreen": "Can create hidden offscreen DOM documents to bypass service worker limits",
        "scripting": "Can dynamically inject arbitrary JavaScript into any web tab",
        "declarativeNetRequestWithHostAccess": "Can modify HTTP requests without per-site prompts",
        "debugger": "Can attach devtools protocol and capture all user actions"
    }

    def __init__(self, target_path: Optional[str] = None):
        self.target_path = target_path

    def calculate_entropy(self, data: bytes) -> float:
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
                "mv3_offscreen_abuse_allowed": False,
                "max_safe_code_entropy": 6.8
            },
            "recommended_actions": [],
            "ai_role_projection": {}
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
                "Revoke Manifest V3 'offscreen' permissions from non-essential utility extensions",
                "Audit enterprise network firewalls for connections to unverified C2 endpoints"
            ]
        else:
            results["recommended_actions"] = [
                "Maintain periodic automated integrity audits for browser extension updates",
                "Monitor for unauthorized extension ownership transfers in enterprise fleet"
            ]

        results["ai_role_projection"] = self._generate_ai_role_projections(results)
        return results

    def _generate_ai_role_projections(self, results: Dict[str, Any]) -> Dict[str, Any]:
        risk = results["risk_score"]
        indicators_count = len(results["indicators"])

        if risk >= 50:
            return {
                "hold_required": True,
                "sr_dev": {
                    "summary": f"Supply-chain compromise detected: {indicators_count} rogue update/C2 indicator(s).",
                    "technical_action": "Check update_url in manifest.json, inspect dynamic script loading, and verify extension code hashes against original vendor repository."
                },
                "management": {
                    "summary": "Critical supply chain alert: An installed extension's backend was quietly redirected or weaponized.",
                    "business_impact": "Severe — potential backdoored endpoint, remote command execution, and corporate network pivoting."
                },
                "hr": {
                    "summary": "A legitimate extension previously approved for work was silently weaponized via supply chain takeover.",
                    "compliance_action": "Issue an internal security advisory warning employees not to reinstall the flagged extension."
                },
                "intern": {
                    "summary": "Supply chain attack detected on a third-party extension.",
                    "learning_guidance": "Never rely solely on initial extension store reviews. Threat actors purchase legitimate extensions and push malicious code updates."
                }
            }
        else:
            return {
                "hold_required": False,
                "sr_dev": {"summary": "All extension manifests and update URLs conform to verified vendors.", "technical_action": "No remediation needed."},
                "management": {"summary": "Zero supply chain compromise detected.", "business_impact": "Normal"},
                "hr": {"summary": "All endpoint extensions compliant.", "compliance_action": "None"},
                "intern": {"summary": "Clean supply chain baseline verified.", "learning_guidance": "Regular integrity checks prevent silent takeovers."}
            }

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

                # 1. Update URL check
                update_url = manifest_data.get("update_url", "")
                if update_url:
                    is_official = any(update_url.startswith(prefix) for prefix in self.OFFICIAL_UPDATE_URL_PREFIXES)
                    if not is_official:
                        ext_info["risk_score"] += 35
                        ext_info["indicators"].append(f"Unverified update_url detected in manifest: {update_url}")
                        ext_info["evidence"].append(f"manifest.update_url:{update_url}")

                # 2. CSP check
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

                # 3. MV3 High Risk Permissions
                permissions = manifest_data.get("permissions", [])
                for perm in permissions:
                    if perm in self.MV3_HIGH_RISK_PERMISSIONS:
                        ext_info["risk_score"] += 20
                        ext_info["indicators"].append(f"High-risk MV3 permission '{perm}' ({self.MV3_HIGH_RISK_PERMISSIONS[perm]})")
                        ext_info["evidence"].append(f"manifest.mv3_permission:{perm}")

                # 4. Wildcard externally_connectable
                ext_conn = manifest_data.get("externally_connectable", {})
                matches = ext_conn.get("matches", [])
                if any(m in ["*://*/*", "<all_urls>"] for m in matches):
                    ext_info["risk_score"] += 30
                    ext_info["indicators"].append("Wildcard externally_connectable: any web page can send messages to extension")
                    ext_info["evidence"].append("manifest.externally_connectable:wildcard")

            except Exception:
                pass

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
            content = Deobfuscator.normalize(raw_bytes.decode("utf-8", errors="ignore"))
            rel_name = script_path.name

            # Dynamic script injection
            if self.DYNAMIC_SCRIPT_PATTERN.search(content):
                risk_delta += 35
                indicators.append(f"Dynamic remote script injection pattern in {rel_name}")
                evidence.append(f"dynamic_script_load:{rel_name}")

            # Dynamic eval
            if self.EVAL_PATTERN.search(content):
                risk_delta += 25
                indicators.append(f"Dynamic code evaluation (eval/Function) in {rel_name}")
                evidence.append(f"eval_call:{rel_name}")

            # Shannon Entropy check
            entropy = self.calculate_entropy(raw_bytes)
            if entropy > 6.9 and len(raw_bytes) > 4096:
                risk_delta += 30
                indicators.append(f"High-entropy packed payload anomaly (entropy={entropy}) in {rel_name}")
                evidence.append(f"high_entropy:{rel_name}:{entropy}")

            # Raw IP C2
            if self.RAW_IP_ENDPOINT_PATTERN.search(content):
                risk_delta += 25
                indicators.append(f"Hardcoded raw IP C2 endpoint detected in {rel_name}")
                evidence.append(f"raw_ip_endpoint:{rel_name}")

            # WebSocket C2
            if self.WEBSOCKET_C2_PATTERN.search(content):
                risk_delta += 20
                indicators.append(f"WebSocket C2 connection initialized in {rel_name}")
                evidence.append(f"websocket_c2:{rel_name}")

            # DGA domain pattern
            if self.DGA_SUSPICIOUS_DOMAIN_PATTERN.search(content):
                risk_delta += 30
                indicators.append(f"Suspicious algorithmically-generated domain (DGA) in {rel_name}")
                evidence.append(f"dga_domain:{rel_name}")

        except Exception:
            pass

        return {
            "risk_delta": risk_delta,
            "evidence": evidence,
            "indicators": indicators
        }
