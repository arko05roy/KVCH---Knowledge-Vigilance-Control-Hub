#!/usr/bin/env python3
"""
DIGITAL ASSET & CREDENTIAL EXPOSURE AUDITOR - Combines 4 Defensive Security Tools
Tool 1: Seed Phrase & Private Credential Scraping Scanner
Tool 2: Clipboard Address Tampering & Clipper Heuristic Detector
Tool 3: Web3 Provider & Wallet Interface Hooking Auditor
Tool 4: Deceptive Utility Permission Analyzer (e.g. PDF/OCR tools)
"""

import sys
import os
import json
import re
import yaml
import argparse
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.colors import Colors
from utils.finding_envelope import FindingEnvelope
from utils.laptop_utils import get_my_hostname, get_my_ip


class CredentialExposureAuditor:
    """Combines 4 defensive security tools to detect credential scraping and clipboard tampering."""

    ETH_ADDRESS_PATTERN = re.compile(r'\b0x[a-fA-F0-9]{40}\b')
    BTC_LEGACY_PATTERN = re.compile(r'\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b')
    BTC_BECH32_PATTERN = re.compile(r'\bbc1[a-zA-HJ-NP-Z0-9]{39,59}\b')
    SOL_ADDRESS_PATTERN = re.compile(r'\b[1-9A-HJ-NP-Za-km-z]{32,44}\b')
    ETH_PRIVKEY_PATTERN = re.compile(r'\b(?:0x)?[a-fA-F0-9]{64}\b')
    BIP39_MNEMONIC_PATTERN = re.compile(r'(?:[a-z]{3,8}\s+){11,23}[a-z]{3,8}', re.IGNORECASE)

    CLIPBOARD_OVERRIDE_PATTERN = re.compile(r'navigator\.clipboard\.(?:writeText|readText)|document\.execCommand\([\'"]copy[\'"]\)', re.IGNORECASE)
    WEB3_OVERRIDE_PATTERN = re.compile(r'window\.ethereum|window\.solana|window\.phantom|eth_sendTransaction|eth_signTypedData', re.IGNORECASE)

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
        print(f"\n{Colors.CYAN}╔══════════════════════════════════════════════════════════════════╗{Colors.RESET}")
        print(f"{Colors.GREEN}║     KVCH DIGITAL ASSET & CREDENTIAL EXPOSURE AUDITOR             ║{Colors.RESET}")
        print(f"{Colors.CYAN}╚══════════════════════════════════════════════════════════════════╝{Colors.RESET}\n")

        target = self.target_path
        if not target or not os.path.exists(target):
            # Attempt to discover local browser extensions
            discovered = self._discover_browser_extensions()
            if discovered:
                print(f"{Colors.BLUE}[*] Discovered {len(discovered)} browser profile(s). Auditing extensions...{Colors.RESET}")
                for b_name, b_path in discovered:
                    print(f"{Colors.WHITE}  → Scanning {b_name}: {b_path}{Colors.RESET}")
                    self._scan_directory(Path(b_path))
            else:
                print(f"{Colors.YELLOW}[!] No local browser profiles discovered. Auditing current workspace...{Colors.RESET}")
                self._scan_directory(Path.cwd())
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
                            ext_data["risk"] += 30
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
                txt = f.read()

            if self.CLIPBOARD_OVERRIDE_PATTERN.search(txt):
                if self.ETH_ADDRESS_PATTERN.search(txt) or self.BTC_LEGACY_PATTERN.search(txt) or self.SOL_ADDRESS_PATTERN.search(txt):
                    risk += 45
                    self.indicators.append(f"Clipboard address clipper pattern in {path.name}")
                    self.evidence.append(f"clipboard_clipper:{path.name}")

            if self.WEB3_OVERRIDE_PATTERN.search(txt):
                if "eth_sendTransaction" in txt or "personal_sign" in txt:
                    risk += 35
                    self.indicators.append(f"Web3 transaction interception hook in {path.name}")
                    self.evidence.append(f"web3_interception:{path.name}")

            if "seed" in txt.lower() or "mnemonic" in txt.lower():
                if self.BIP39_MNEMONIC_PATTERN.search(txt):
                    risk += 40
                    self.indicators.append(f"Mnemonic seed extraction logic in {path.name}")
                    self.evidence.append(f"mnemonic_scrape:{path.name}")
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
        for ind in self.indicators[:5]:
            print(f" {Colors.YELLOW}⚠{Colors.RESET} {ind}")
        if len(self.indicators) > 5:
            print(f" ... and {len(self.indicators) - 5} more.")

    def _generate_report(self):
        severity = "critical" if self.risk_score >= 75 else "high" if self.risk_score >= 50 else "medium" if self.risk_score >= 25 else "low"
        hostname = get_my_hostname()
        target = self.target_path or "local_browser_extensions"

        envelope = FindingEnvelope()
        envelope.set_extension_info("credential_exposure_auditor", "1.0.0")
        envelope.set_finding(
            finding_type="credential_exposure_audit",
            affected_actor=hostname,
            affected_resource=str(target),
            result={
                "evidence": self.evidence,
                "indicators": self.indicators,
                "risk_score": self.risk_score,
                "audited_count": len(self.audited_extensions)
            },
            severity=severity,
            title="Digital Asset & Credential Exposure Audit"
        )
        envelope.set_summary(
            f"Audited {len(self.audited_extensions)} extensions/scripts on {hostname}. Risk score: {self.risk_score}/100."
        )

        reports_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports")
        os.makedirs(reports_dir, exist_ok=True)
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = os.path.join(reports_dir, f"finding_credential_exposure_auditor_{ts}.json")
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
