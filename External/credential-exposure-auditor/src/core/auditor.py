"""Core defensive auditing engine for credential exposure, multi-chain clippers, and Web3 drainers."""

import os
import re
import json
import base64
from pathlib import Path
from typing import Dict, Any, List, Optional


class Deobfuscator:
    """In-memory de-obfuscation and anti-evasion normalization layer."""

    HEX_ESCAPE_PATTERN = re.compile(r'\\x([0-9a-fA-F]{2})')
    UNICODE_ESCAPE_PATTERN = re.compile(r'\\u([0-9a-fA-F]{4})')
    CHAR_CODE_PATTERN = re.compile(r'String\.fromCharCode\s*\(([\d\s,]+)\)')
    BASE64_CANDIDATE_PATTERN = re.compile(r'[\'"]([A-Za-z0-9+/]{28,}={0,2})[\'"]')
    COMPUTED_PROPERTY_PATTERN = re.compile(r'\[\s*\\?[\'"]([a-zA-Z0-9_]+)\\?[\'"]\s*\]')

    @classmethod
    def normalize(cls, content: str) -> str:
        """Applies normalization passes to uncover obfuscated strings and APIs."""
        normalized = content

        # 1. Decode hex escapes: \x65\x76\x61\x6c -> eval
        def replace_hex(match):
            try:
                return chr(int(match.group(1), 16))
            except Exception:
                return match.group(0)
        normalized = cls.HEX_ESCAPE_PATTERN.sub(replace_hex, normalized)

        # 2. Decode unicode escapes: \u0065\u0076\u0061\u006c -> eval
        def replace_unicode(match):
            try:
                return chr(int(match.group(1), 16))
            except Exception:
                return match.group(0)
        normalized = cls.UNICODE_ESCAPE_PATTERN.sub(replace_unicode, normalized)

        # 3. Resolve String.fromCharCode(101, 118, 97, 108)
        def replace_char_codes(match):
            try:
                numbers = [int(n.strip()) for n in match.group(1).split(',') if n.strip().isdigit()]
                return ''.join(chr(n) for n in numbers)
            except Exception:
                return match.group(0)
        normalized = cls.CHAR_CODE_PATTERN.sub(replace_char_codes, normalized)

        # 4. Normalize computed property access: window["ethereum"] -> window.ethereum
        normalized = cls.COMPUTED_PROPERTY_PATTERN.sub(r'.\1', normalized)

        # 5. Extract and decode Base64 strings to append as readable tokens
        b64_decoded = []
        for candidate in cls.BASE64_CANDIDATE_PATTERN.findall(content):
            try:
                decoded_bytes = base64.b64decode(candidate)
                decoded_str = decoded_bytes.decode('utf-8', errors='ignore')
                if any(c.isalnum() for c in decoded_str) and len(decoded_str) > 4:
                    b64_decoded.append(decoded_str)
            except Exception:
                pass
        if b64_decoded:
            normalized += "\n/* DECODED_BASE64_STREAM */\n" + "\n".join(b64_decoded)

        return normalized


class CredentialAuditor:
    """Audits browser extensions and scripts for credential exposure, multi-chain clippers, and drainers."""

    # Multi-chain address patterns
    ETH_ADDRESS_PATTERN = re.compile(r'\b0x[a-fA-F0-9]{40}\b')
    BTC_LEGACY_PATTERN = re.compile(r'\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b')
    BTC_SEGWIT_PATTERN = re.compile(r'\bbc1[a-zA-HJ-NP-Z0-9]{39,59}\b')
    SOL_ADDRESS_PATTERN = re.compile(r'\b[1-9A-HJ-NP-Za-km-z]{32,44}\b')
    TRON_ADDRESS_PATTERN = re.compile(r'\bT[A-Za-z1-9]{33}\b')
    MONERO_ADDRESS_PATTERN = re.compile(r'\b[48][0-9AB][1-9A-HJ-NP-Za-km-z]{93}\b')

    # Seed and credential patterns
    BIP39_MNEMONIC_PATTERN = re.compile(r'(?:[a-z]{3,8}\s+){11,23}[a-z]{3,8}', re.IGNORECASE)
    ETH_PRIVKEY_PATTERN = re.compile(r'\b(?:0x)?[a-fA-F0-9]{64}\b')

    # Clipboard tampering & API interception patterns
    CLIPBOARD_OVERRIDE_PATTERN = re.compile(r'navigator\.clipboard\.(?:writeText|readText)|document\.execCommand\([\'"]copy[\'"]\)', re.IGNORECASE)
    WEB3_PROVIDER_PATTERN = re.compile(r'window\.ethereum|window\.solana|window\.phantom|globalThis\.ethereum', re.IGNORECASE)

    # Web3 drainer signature patterns (Permit2, Seaport, Approval Phishing)
    DRAINER_SIGNATURE_PATTERNS = [
        (re.compile(r'setApprovalForAll\s*\(|approve\s*\(\s*0x', re.IGNORECASE), "Unlimited token/NFT approval drainer signature"),
        (re.compile(r'Permit2|permit\s*\([^)]+,\s*uint256', re.IGNORECASE), "Permit2 signature phishing drainer pattern"),
        (re.compile(r'eth_signTypedData_v4|personal_sign', re.IGNORECASE), "Off-chain signature phishing interception"),
        (re.compile(r'seaport|blur\.io|looksrare', re.IGNORECASE), "NFT marketplace order hijacking pattern")
    ]

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
            "recommended_actions": [],
            "ai_role_projection": {}
        }

        if not self.target_path or not os.path.exists(self.target_path):
            results["summary"] = "Target path not found or empty. Baseline clean."
            return results

        target = Path(self.target_path)
        if target.is_file():
            ext_finding = self._audit_file(target)
            if ext_finding:
                results["audited_extensions"].append(ext_finding)
        else:
            manifests = list(target.glob("**/manifest.json"))
            if manifests:
                for manifest_path in manifests:
                    ext_finding = self._audit_extension_folder(manifest_path.parent)
                    results["audited_extensions"].append(ext_finding)
            else:
                dir_finding = self._audit_directory_scripts(target)
                if dir_finding:
                    results["audited_extensions"].append(dir_finding)

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
                "Audit recent crypto transaction destination hashes across enterprise endpoints",
                "Enable hardware wallet confirmation policies for Web3 operations"
            ]
        else:
            results["recommended_actions"] = [
                "Maintain periodic automated scans of browser extensions across endpoints",
                "Enforce enterprise policy disallowing sideloaded or unverified browser extensions"
            ]

        # Attach AI Role Projections
        results["ai_role_projection"] = self._generate_ai_role_projections(results)
        return results

    def _generate_ai_role_projections(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Generates tailored role-based insights for KVCH dashboards."""
        risk = results["risk_score"]
        indicators_count = len(results["indicators"])

        if risk >= 50:
            return {
                "hold_required": True,
                "sr_dev": {
                    "summary": f"Critical security concern: {indicators_count} malicious drainer/clipper indicator(s) detected.",
                    "technical_action": "Quarantine extension manifest, inspect background script clipper listeners, check Permit2/approval hooks."
                },
                "management": {
                    "summary": f"High risk exposure: Endpoint compromised with digital asset drainer activity.",
                    "financial_risk": "Critical — potential loss of cryptocurrency funds, exposed corporate seed phrases, and clipboard tampering."
                },
                "hr": {
                    "summary": "Employee endpoint downloaded an overprivileged utility (e.g. PDF/OCR tool) with malicious data harvesting.",
                    "compliance_action": "Schedule mandatory security awareness training on extension permissions."
                },
                "intern": {
                    "summary": "A security safeguard was triggered on an untrusted utility extension.",
                    "learning_guidance": "Utilities like PDF readers should never ask for clipboard read/write or Web3 access. Always adhere to least privilege."
                }
            }
        else:
            return {
                "hold_required": False,
                "sr_dev": {"summary": "All audited extension scripts conform to clean baseline.", "technical_action": "No remediation needed."},
                "management": {"summary": "Zero digital asset exposure detected.", "financial_risk": "Low"},
                "hr": {"summary": "Endpoint policy compliant.", "compliance_action": "None"},
                "intern": {"summary": "Extension passed all security checks.", "learning_guidance": "Clean baseline maintained."}
            }

    def _audit_extension_folder(self, folder: Path) -> Dict[str, Any]:
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

                    lower_name = ext_name.lower()
                    if any(kw in lower_name for kw in self.UTILITY_NAME_KEYWORDS):
                        is_utility = True

                    for perm in permissions:
                        if perm in self.HIGH_RISK_PERMISSIONS:
                            if is_utility:
                                ext_info["risk_score"] += 35
                                ext_info["indicators"].append(f"Deceptive permission: utility '{ext_name}' requests sensitive permission '{perm}'")
                                ext_info["evidence"].append(f"manifest.permission:{perm}")
                            else:
                                ext_info["risk_score"] += 10
            except Exception:
                pass

        for script_file in folder.glob("**/*.[jJ][sS]"):
            file_findings = self._scan_script_content(script_file)
            ext_info["risk_score"] += file_findings["risk_delta"]
            ext_info["evidence"].extend(file_findings["evidence"])
            ext_info["indicators"].extend(file_findings["indicators"])

        return ext_info

    def _audit_file(self, file_path: Path) -> Dict[str, Any]:
        findings = self._scan_script_content(file_path)
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
        risk_delta = 0
        evidence = []
        indicators = []

        try:
            with open(script_path, "r", encoding="utf-8", errors="ignore") as f:
                raw_content = f.read()

            # Apply in-memory de-obfuscation normalization
            content = Deobfuscator.normalize(raw_content)
            rel_name = script_path.name

            # 1. Multi-chain clipboard address clipper detection
            if self.CLIPBOARD_OVERRIDE_PATTERN.search(content):
                detected_chains = []
                if self.ETH_ADDRESS_PATTERN.search(content):
                    detected_chains.append("EVM/ETH")
                if self.BTC_LEGACY_PATTERN.search(content) or self.BTC_SEGWIT_PATTERN.search(content):
                    detected_chains.append("Bitcoin")
                if self.SOL_ADDRESS_PATTERN.search(content):
                    detected_chains.append("Solana")
                if self.TRON_ADDRESS_PATTERN.search(content):
                    detected_chains.append("Tron")
                if self.MONERO_ADDRESS_PATTERN.search(content):
                    detected_chains.append("Monero")

                if detected_chains:
                    risk_delta += 50
                    chains_str = ", ".join(detected_chains)
                    indicators.append(f"Multi-chain clipboard clipper pattern ({chains_str}) in {rel_name}")
                    evidence.append(f"clipper_chains:{chains_str}:{rel_name}")

            # 2. Web3 provider hooking and Drainer signatures
            if self.WEB3_PROVIDER_PATTERN.search(content):
                risk_delta += 20
                for pattern, desc in self.DRAINER_SIGNATURE_PATTERNS:
                    if pattern.search(content):
                        risk_delta += 30
                        indicators.append(f"{desc} detected in {rel_name}")
                        evidence.append(f"drainer_sig:{desc}:{rel_name}")

            # 3. Seed phrase & private key scraping
            if "seed" in content.lower() or "mnemonic" in content.lower() or "privatekey" in content.lower():
                if self.BIP39_MNEMONIC_PATTERN.search(content):
                    risk_delta += 40
                    indicators.append(f"BIP-39 mnemonic seed harvesting pattern in {rel_name}")
                    evidence.append(f"mnemonic_scrape:{rel_name}")
                if self.ETH_PRIVKEY_PATTERN.search(content):
                    risk_delta += 35
                    indicators.append(f"Private key extraction pattern in {rel_name}")
                    evidence.append(f"privkey_scrape:{rel_name}")

        except Exception:
            pass

        return {
            "risk_delta": risk_delta,
            "evidence": evidence,
            "indicators": indicators
        }
