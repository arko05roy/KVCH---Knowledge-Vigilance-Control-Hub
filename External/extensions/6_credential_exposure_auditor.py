#!/usr/bin/env python3
"""
DIGITAL ASSET & CREDENTIAL EXPOSURE AUDITOR - Enhanced Anti-Evasion & Multi-Chain Edition
Tool 1: Seed Phrase & Private Credential Scraping Scanner
Tool 2: Multi-Chain Clipboard Address Tampering & Clipper Detector (ETH, BTC, SOL, TRON, XMR)
Tool 3: Web3 Provider & Drainer Signature Auditor (Permit2, Seaport, Approval Phishing)
Tool 4: Deceptive Utility Permission Analyzer (e.g. PDF/OCR tools) with De-Obfuscation Engine
"""

import sys
import os
import json
import re
import yaml
import base64
import argparse
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.colors import Colors
from utils.finding_envelope import FindingEnvelope
from utils.laptop_utils import get_my_hostname, get_my_ip


class Deobfuscator:
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


class CredentialExposureAuditor:
    """Combines 4 defensive security tools to detect credential scraping, clippers, and Web3 drainers."""

    ETH_ADDRESS_PATTERN = re.compile(r'\b0x[a-fA-F0-9]{40}\b')
    BTC_LEGACY_PATTERN = re.compile(r'\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b')
    BTC_SEGWIT_PATTERN = re.compile(r'\bbc1[a-zA-HJ-NP-Z0-9]{39,59}\b')
    SOL_ADDRESS_PATTERN = re.compile(r'\b[1-9A-HJ-NP-Za-km-z]{32,44}\b')
    TRON_ADDRESS_PATTERN = re.compile(r'\bT[A-Za-z1-9]{33}\b')
    MONERO_ADDRESS_PATTERN = re.compile(r'\b[48][0-9AB][1-9A-HJ-NP-Za-km-z]{93}\b')

    ETH_PRIVKEY_PATTERN = re.compile(r'\b(?:0x)?[a-fA-F0-9]{64}\b')
    BIP39_MNEMONIC_PATTERN = re.compile(r'(?:[a-z]{3,8}\s+){11,23}[a-z]{3,8}', re.IGNORECASE)

    CLIPBOARD_OVERRIDE_PATTERN = re.compile(r'navigator\.clipboard\.(?:writeText|readText)|document\.execCommand\([\'"]copy[\'"]\)', re.IGNORECASE)
    WEB3_PROVIDER_PATTERN = re.compile(r'window\.ethereum|window\.solana|window\.phantom|globalThis\.ethereum', re.IGNORECASE)

    DRAINER_SIGNATURES = [
        (re.compile(r'setApprovalForAll\s*\(|approve\s*\(\s*0x', re.IGNORECASE), "Unlimited token/NFT approval drainer signature"),
        (re.compile(r'Permit2|permit\s*\([^)]+,\s*uint256', re.IGNORECASE), "Permit2 signature phishing drainer pattern"),
        (re.compile(r'eth_signTypedData_v4|personal_sign', re.IGNORECASE), "Off-chain signature phishing interception"),
        (re.compile(r'seaport|blur\.io|looksrare', re.IGNORECASE), "NFT marketplace order hijacking pattern")
    ]

    HIGH_RISK_PERMISSIONS = {
        "clipboardRead": "Can inspect clipboard contents",
        "clipboardWrite": "Can overwrite clipboard buffers during transactions",
        "<all_urls>": "Unrestricted access to all web origins",
        "webRequestBlocking": "Can intercept and alter active network traffic",
        "nativeMessaging": "Can invoke local host processes"
    }

    UTILITY_KEYWORDS = ["pdf", "ocr", "converter", "scanner", "reader", "calculator", "color", "weather"]

    def __init__(self, target_path=None):
        self.target_path = target_path
        self.start_time = datetime.now(timezone.utc)
        self.extension_id = "credential_exposure_auditor"
        self.manifest = self._load_manifest()
        self.audited_extensions = []
        self.evidence = []
        self.indicators = []
        self.risk_score = 0

    def _load_manifest(self):
        manifest_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "manifests",
            "credential_exposure_auditor.yaml"
        )
        if os.path.exists(manifest_path):
            with open(manifest_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        return {}

    def run_audit(self):
        print(f"\n{Colors.CYAN}╔══════════════════════════════════════════════════════════════════════╗{Colors.RESET}")
        print(f"{Colors.GREEN}║   KVCH DIGITAL ASSET & CREDENTIAL AUDITOR (ANTI-EVASION EDITION)     ║{Colors.RESET}")
        print(f"{Colors.CYAN}╚══════════════════════════════════════════════════════════════════════╝{Colors.RESET}\n")

        target = self.target_path
        if not target or not os.path.exists(target):
            discovered = self._discover_browser_extensions()
            if discovered:
                print(f"{Colors.BLUE}[*] Discovered {len(discovered)} browser profile(s). Auditing extensions...{Colors.RESET}")
                for b_name, b_path in discovered:
                    print(f"{Colors.WHITE}  → Scanning {b_name}: {b_path}{Colors.RESET}")
                    self._scan_directory(Path(b_path))
            else:
                print(f"{Colors.YELLOW}[!] No local browser profiles discovered. Auditing External/fixtures...{Colors.RESET}")
                fixtures_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "fixtures")
                self._scan_directory(Path(fixtures_dir))
        else:
            p = Path(target)
            if p.is_file():
                self._scan_file(p)
            else:
                self._scan_directory(p)

        self._calculate_risk()
        self._print_summary()
        return self._generate_report()

    def _discover_browser_extensions(self):
        home = Path.home()
        profiles = []
        if sys.platform == "win32":
            local = Path(os.environ.get("LOCALAPPDATA", home / "AppData" / "Local"))
            candidates = [
                ("Chrome", local / "Google" / "Chrome" / "User Data" / "Default" / "Extensions"),
                ("Edge", local / "Microsoft" / "Edge" / "User Data" / "Default" / "Extensions"),
                ("Brave", local / "BraveSoftware" / "Brave-Browser" / "User Data" / "Default" / "Extensions"),
            ]
        elif sys.platform == "darwin":
            app_sup = home / "Library" / "Application Support"
            candidates = [
                ("Chrome", app_sup / "Google" / "Chrome" / "Default" / "Extensions"),
                ("Edge", app_sup / "Microsoft Edge" / "Default" / "Extensions"),
                ("Brave", app_sup / "BraveSoftware" / "Brave-Browser" / "Default" / "Extensions"),
            ]
        else:
            conf = home / ".config"
            candidates = [
                ("Chrome", conf / "google-chrome" / "Default" / "Extensions"),
                ("Chromium", conf / "chromium" / "Default" / "Extensions"),
                ("Brave", conf / "BraveSoftware" / "Brave-Browser" / "Default" / "Extensions"),
            ]
        for name, path in candidates:
            if path.exists() and path.is_dir():
                profiles.append((name, str(path)))
        return profiles

    def _scan_directory(self, dir_path: Path):
        manifests = list(dir_path.glob("**/manifest.json"))
        if manifests:
            for m in manifests:
                self._audit_extension_folder(m.parent)
        else:
            for js_file in dir_path.glob("**/*.[jJ][sS]"):
                self._scan_file(js_file)

    def _audit_extension_folder(self, folder: Path):
        manifest_file = folder / "manifest.json"
        ext_data = {"name": folder.name, "path": str(folder), "risk": 0}
        if manifest_file.exists():
            try:
                with open(manifest_file, "r", encoding="utf-8", errors="ignore") as f:
                    m = json.load(f)
                    name = m.get("name", folder.name)
                    ext_data["name"] = name
                    perms = m.get("permissions", [])
                    is_util = any(k in name.lower() for k in self.UTILITY_KEYWORDS)
                    for p in perms:
                        if p in self.HIGH_RISK_PERMISSIONS and is_util:
                            ext_data["risk"] += 35
                            self.indicators.append(f"Deceptive utility '{name}' requests sensitive permission '{p}'")
                            self.evidence.append(f"manifest.permission:{p}")
            except Exception:
                pass

        for js in folder.glob("**/*.[jJ][sS]"):
            r = self._scan_script_content(js)
            ext_data["risk"] += r
        self.audited_extensions.append(ext_data)

    def _scan_file(self, file_path: Path):
        r = self._scan_script_content(file_path)
        self.audited_extensions.append({"name": file_path.name, "path": str(file_path), "risk": r})

    def _scan_script_content(self, path: Path) -> int:
        risk = 0
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                raw_txt = f.read()

            txt = Deobfuscator.normalize(raw_txt)

            # Multi-chain clipper
            if self.CLIPBOARD_OVERRIDE_PATTERN.search(txt):
                chains = []
                if self.ETH_ADDRESS_PATTERN.search(txt): chains.append("EVM/ETH")
                if self.BTC_LEGACY_PATTERN.search(txt) or self.BTC_SEGWIT_PATTERN.search(txt): chains.append("Bitcoin")
                if self.SOL_ADDRESS_PATTERN.search(txt): chains.append("Solana")
                if self.TRON_ADDRESS_PATTERN.search(txt): chains.append("Tron")
                if self.MONERO_ADDRESS_PATTERN.search(txt): chains.append("Monero")
                if chains:
                    risk += 50
                    c_str = ", ".join(chains)
                    self.indicators.append(f"Multi-chain clipboard clipper pattern ({c_str}) in {path.name}")
                    self.evidence.append(f"clipboard_clipper:{c_str}:{path.name}")

            # Web3 drainer signatures
            if self.WEB3_PROVIDER_PATTERN.search(txt):
                risk += 20
                for pattern, desc in self.DRAINER_SIGNATURES:
                    if pattern.search(txt):
                        risk += 30
                        self.indicators.append(f"{desc} detected in {path.name}")
                        self.evidence.append(f"drainer_signature:{desc}:{path.name}")

            # Mnemonic / Key scraping
            if "seed" in txt.lower() or "mnemonic" in txt.lower():
                if self.BIP39_MNEMONIC_PATTERN.search(txt):
                    risk += 40
                    self.indicators.append(f"Mnemonic seed extraction logic in {path.name}")
                    self.evidence.append(f"mnemonic_scrape:{path.name}")
            if self.ETH_PRIVKEY_PATTERN.search(txt):
                risk += 35
                self.indicators.append(f"Private key extraction pattern in {path.name}")
                self.evidence.append(f"privkey_scrape:{path.name}")

        except Exception:
            pass
        return risk

    def _calculate_risk(self):
        total = sum(e.get("risk", 0) for e in self.audited_extensions)
        self.risk_score = min(100, total)

    def _print_summary(self):
        print(f"{Colors.CYAN}──────────────────────────────────────────────────────────────────{Colors.RESET}")
        print(f"Audited Extensions/Scripts: {Colors.WHITE}{len(self.audited_extensions)}{Colors.RESET}")
        print(f"Indicators Detected:        {Colors.YELLOW if self.indicators else Colors.GREEN}{len(self.indicators)}{Colors.RESET}")
        print(f"Risk Score:                 {Colors.RED if self.risk_score >= 50 else Colors.GREEN}{self.risk_score}/100{Colors.RESET}")
        print(f"{Colors.CYAN}──────────────────────────────────────────────────────────────────{Colors.RESET}")
        for ind in self.indicators[:6]:
            print(f" {Colors.YELLOW}⚠{Colors.RESET} {ind}")
        if len(self.indicators) > 6:
            print(f" ... and {len(self.indicators) - 6} more.")

    def _generate_report(self):
        severity = "critical" if self.risk_score >= 75 else "high" if self.risk_score >= 50 else "medium" if self.risk_score >= 25 else "low"
        hostname = get_my_hostname()
        target = self.target_path or "local_browser_extensions"

        ai_projection = {
            "hold_required": self.risk_score >= 50,
            "sr_dev": {"technical_action": "Quarantine extension, inspect Permit2/Clipper listeners in background scripts."},
            "management": {"business_impact": "Loss of digital assets, exposed seed phrases, and clipboard tampering."},
            "hr": {"compliance_action": "Notify affected employee and initiate security compliance review."},
            "intern": {"learning_guidance": "Utilities should never access clipboard write or Web3 transaction signing."}
        }

        envelope = FindingEnvelope()
        envelope.set_extension_info("credential_exposure_auditor", "1.1.0")
        envelope.set_finding(
            finding_type="credential_exposure_audit",
            affected_actor=hostname,
            affected_resource=str(target),
            result={
                "evidence": self.evidence,
                "indicators": self.indicators,
                "risk_score": self.risk_score,
                "audited_count": len(self.audited_extensions),
                "ai_role_projection": ai_projection
            },
            severity=severity,
            title="Digital Asset & Credential Exposure Audit"
        )
        envelope.set_summary(
            f"Audited {len(self.audited_extensions)} extensions on {hostname}. Risk score: {self.risk_score}/100. "
            f"De-obfuscation and multi-chain detection applied."
        )

        reports_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports")
        os.makedirs(reports_dir, exist_ok=True)
        report_path = os.path.join(reports_dir, "finding_6_credential_exposure_auditor.json")
        envelope.save(report_path)
        print(f"\n{Colors.GREEN}✔ Standardized Finding Envelope saved to:{Colors.RESET} {report_path}\n")
        return report_path


def main():
    parser = argparse.ArgumentParser(description="KVCH Digital Asset & Credential Exposure Auditor")
    parser.add_argument("target", nargs="?", help="Directory or file to audit (defaults to local browser extensions)")
    args = parser.parse_args()

    auditor = CredentialExposureAuditor(target_path=args.target)
    auditor.run_audit()


if __name__ == "__main__":
    main()
