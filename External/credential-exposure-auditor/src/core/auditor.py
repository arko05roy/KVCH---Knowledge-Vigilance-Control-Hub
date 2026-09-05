"""Core defensive auditing engine for credential exposure and clipboard protection."""

import os
import re
import json
from pathlib import Path
from typing import Dict, Any, List, Optional


class CredentialAuditor:
    """Audits browser extensions and scripts for credential exposure and clipboard tampering."""

    # Address matching patterns
    ETH_ADDRESS_PATTERN = re.compile(r'\b0x[a-fA-F0-9]{40}\b')
    BTC_LEGACY_PATTERN = re.compile(r'\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b')
    BTC_BECH32_PATTERN = re.compile(r'\bbc1[a-zA-HJ-NP-Z0-9]{39,59}\b')
    SOL_ADDRESS_PATTERN = re.compile(r'\b[1-9A-HJ-NP-Za-km-z]{32,44}\b')

    # Sensitive key/credential patterns
    ETH_PRIVKEY_PATTERN = re.compile(r'\b(?:0x)?[a-fA-F0-9]{64}\b')
    BIP39_MNEMONIC_PATTERN = re.compile(r'(?:[a-z]{3,8}\s+){11,23}[a-z]{3,8}', re.IGNORECASE)

    # Clipboard & Web3 tampering indicators
    CLIPBOARD_OVERRIDE_PATTERN = re.compile(r'navigator\.clipboard\.(?:writeText|readText)|document\.execCommand\([\'"]copy[\'"]\)', re.IGNORECASE)
    WEB3_OVERRIDE_PATTERN = re.compile(r'window\.ethereum|window\.solana|window\.phantom|eth_sendTransaction|eth_signTypedData', re.IGNORECASE)

    HIGH_RISK_PERMISSIONS = {
        "clipboardRead": "Can silently inspect clipboard contents",
        "clipboardWrite": "Can overwrite clipboard data during transactions",
        "<all_urls>": "Unrestricted access to all websites",
        "webRequestBlocking": "Can intercept and modify network traffic",
        "nativeMessaging": "Can communicate with local binary executables"
    }

    UTILITY_NAME_KEYWORDS = [
        "pdf", "ocr", "converter", "scanner", "reader", "calculator", "color", "weather", "downloader"
    ]

    def __init__(self, target_path: Optional[str] = None):
        self.target_path = target_path
        self.audited_files_count = 0
        self.findings_count = 0

    def audit(self) -> Dict[str, Any]:
        """Executes full defensive audit on target path or directory."""
        results: Dict[str, Any] = {
            "target": self.target_path or "local_browser_profiles",
            "audited_extensions": [],
            "evidence": [],
            "indicators": [],
            "risk_score": 0,
            "overall_severity": "low",
            "baseline": {
                "unauthorized_credential_access": False,
                "clipboard_tampering_allowed": False,
                "web3_provider_overrides": False,
                "overprivileged_utility_extensions": 0
            },
            "recommended_actions": []
        }

        if not self.target_path or not os.path.exists(self.target_path):
            # If target doesn't exist, return clean baseline
            results["summary"] = "Target path not found or empty. Baseline clean."
            return results

        target = Path(self.target_path)
        if target.is_file():
            ext_finding = self._audit_file(target)
            if ext_finding:
                results["audited_extensions"].append(ext_finding)
        else:
            # Search for extensions or manifests in target dir
            manifests = list(target.glob("**/manifest.json"))
            if manifests:
                for manifest_path in manifests:
                    ext_finding = self._audit_extension_folder(manifest_path.parent)
                    results["audited_extensions"].append(ext_finding)
            else:
                # Direct scan of JS/HTML files in directory
                dir_finding = self._audit_directory_scripts(target)
                if dir_finding:
                    results["audited_extensions"].append(dir_finding)

        # Aggregate metrics
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
                "Quarantine and remove identified malicious extensions immediately",
                "Revoke broad host access permissions (<all_urls>) from utility extensions",
                "Ensure Web3 wallet extensions are pinned and verify clipboard integrity",
                "Audit recent transaction recipient addresses against known genuine hashes"
            ]
        else:
            results["recommended_actions"] = [
                "Maintain periodic automated scans of browser extensions across endpoints",
                "Enforce enterprise policy disallowing sideloaded or unverified browser extensions"
            ]

        return results

    def _audit_extension_folder(self, folder: Path) -> Dict[str, Any]:
        """Audits an unpacked extension directory."""
        ext_info: Dict[str, Any] = {
            "name": folder.name,
            "path": str(folder),
            "permissions": [],
            "risk_score": 0,
            "evidence": [],
            "indicators": []
        }

        manifest_file = folder / "manifest.json"
        is_utility = False
        if manifest_file.exists():
            try:
                with open(manifest_file, "r", encoding="utf-8", errors="ignore") as f:
                    manifest_data = json.load(f)
                    ext_name = manifest_data.get("name", folder.name)
                    ext_info["name"] = ext_name
                    permissions = manifest_data.get("permissions", [])
                    ext_info["permissions"] = permissions

                    # Check if utility disguised with high-risk permissions
                    lower_name = ext_name.lower()
                    if any(kw in lower_name for kw in self.UTILITY_NAME_KEYWORDS):
                        is_utility = True

                    for perm in permissions:
                        if perm in self.HIGH_RISK_PERMISSIONS:
                            if is_utility:
                                ext_info["risk_score"] += 30
                                ext_info["indicators"].append(f"Deceptive permission: utility '{ext_name}' requests '{perm}'")
                                ext_info["evidence"].append(f"manifest.permission:{perm}")
                            else:
                                ext_info["risk_score"] += 10
            except Exception:
                pass

        # Scan script files
        for script_file in folder.glob("**/*.[jJ][sS]"):
            file_findings = self._scan_script_content(script_file)
            ext_info["risk_score"] += file_findings["risk_delta"]
            ext_info["evidence"].extend(file_findings["evidence"])
            ext_info["indicators"].extend(file_findings["indicators"])

        return ext_info

    def _audit_file(self, file_path: Path) -> Dict[str, Any]:
        """Audits a single script file."""
        findings = self._scan_script_content(file_path)
        return {
            "name": file_path.name,
            "path": str(file_path),
            "risk_score": findings["risk_delta"],
            "evidence": findings["evidence"],
            "indicators": findings["indicators"]
        }

    def _audit_directory_scripts(self, directory: Path) -> Dict[str, Any]:
        """Audits all scripts in a directory without manifest."""
        total_risk = 0
        evidence = []
        indicators = []
        for script in directory.glob("**/*.[jJ][sS]"):
            res = self._scan_script_content(script)
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

    def _scan_script_content(self, script_path: Path) -> Dict[str, Any]:
        """Scans script content for clipboard tampering, seed scraping, and Web3 hooks."""
        risk_delta = 0
        evidence = []
        indicators = []

        try:
            with open(script_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            rel_name = script_path.name

            # 1. Clipboard override detection
            if self.CLIPBOARD_OVERRIDE_PATTERN.search(content):
                # Check if combined with cryptocurrency addresses
                has_eth = bool(self.ETH_ADDRESS_PATTERN.search(content))
                has_btc = bool(self.BTC_LEGACY_PATTERN.search(content) or self.BTC_BECH32_PATTERN.search(content))
                has_sol = bool(self.SOL_ADDRESS_PATTERN.search(content))

                if has_eth or has_btc or has_sol:
                    risk_delta += 45
                    indicators.append(f"Clipboard address clipper pattern detected in {rel_name}")
                    evidence.append(f"clipper_override:{rel_name}")

            # 2. Web3 provider hooking detection
            if self.WEB3_OVERRIDE_PATTERN.search(content):
                if "eth_sendTransaction" in content or "personal_sign" in content:
                    risk_delta += 35
                    indicators.append(f"Web3 transaction interception logic in {rel_name}")
                    evidence.append(f"web3_interception:{rel_name}")

            # 3. Seed phrase harvesting patterns
            if "seed" in content.lower() or "mnemonic" in content.lower():
                if self.BIP39_MNEMONIC_PATTERN.search(content):
                    risk_delta += 40
                    indicators.append(f"Mnemonic seed extraction logic in {rel_name}")
                    evidence.append(f"mnemonic_harvest:{rel_name}")

        except Exception:
            pass

        return {
            "risk_delta": risk_delta,
            "evidence": evidence,
            "indicators": indicators
        }
