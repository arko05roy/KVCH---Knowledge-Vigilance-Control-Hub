#!/usr/bin/env python3
"""
EXTENSION SUPPLY-CHAIN & INTEGRITY AUDITOR - Combines 4 Defensive Security Tools
Tool 1: Update URL & Extension Manifest Provenance Auditor
Tool 2: Remote Code Execution & Dynamic Script Injection Scanner
Tool 3: Mathematical Shannon Entropy & Obfuscated Payload Detector
Tool 4: C2 WebSocket & Telemetry Endpoint Beacon Analyzer
"""

import sys
import os
import json
import re
import math
import yaml
import argparse
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.colors import Colors
from utils.finding_envelope import FindingEnvelope
from utils.laptop_utils import get_my_hostname, get_my_ip


class SupplyChainAuditor:
    """Combines 4 defensive security tools to detect extension supply chain drift and remote code injection."""

    OFFICIAL_UPDATE_URL_PREFIXES = [
        "https://clients2.google.com/service/update2/crx",
        "https://edge.microsoft.com/extensionwebstorebase/v1/crx",
        "https://versioncheck.addons.mozilla.org"
    ]

    DYNAMIC_SCRIPT_PATTERN = re.compile(r'document\.createElement\([\'"]script[\'"]\)|script\.src\s*=|importScripts\(', re.IGNORECASE)
    EVAL_PATTERN = re.compile(r'\beval\(|\bnew\s+Function\(|setTimeout\(\s*[\'"][^\'"]+[\'"]', re.IGNORECASE)
    WEBSOCKET_C2_PATTERN = re.compile(r'new\s+WebSocket\([\'"]wss?://[^\'"]+[\'"]\)', re.IGNORECASE)
    RAW_IP_PATTERN = re.compile(r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?')

    def __init__(self, target_path=None):
        self.target_path = target_path
        self.start_time = datetime.now(timezone.utc)
        self.extension_id = "supply_chain_auditor"
        self.manifest = self._load_manifest()
        self.audited_extensions = []
        self.evidence = []
        self.indicators = []
        self.risk_score = 0

    def _load_manifest(self):
        manifest_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "manifests",
            "supply_chain_auditor.yaml"
        )
        if os.path.exists(manifest_path):
            with open(manifest_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        return {}

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

    def run_audit(self):
        print(f"\n{Colors.CYAN}╔══════════════════════════════════════════════════════════════════╗{Colors.RESET}")
        print(f"{Colors.GREEN}║     KVCH EXTENSION SUPPLY-CHAIN & INTEGRITY AUDITOR              ║{Colors.RESET}")
        print(f"{Colors.CYAN}╚══════════════════════════════════════════════════════════════════╝{Colors.RESET}\n")

        target = self.target_path
        if not target or not os.path.exists(target):
            discovered = self._discover_browser_extensions()
            if discovered:
                print(f"{Colors.BLUE}[*] Discovered {len(discovered)} browser profile(s). Auditing supply-chain integrity...{Colors.RESET}")
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

                    update_url = m.get("update_url", "")
                    if update_url and not any(update_url.startswith(p) for p in self.OFFICIAL_UPDATE_URL_PREFIXES):
                        ext_data["risk"] += 35
                        self.indicators.append(f"Unverified update_url in '{name}': {update_url}")
                        self.evidence.append(f"manifest.update_url:{update_url}")

                    csp = str(m.get("content_security_policy", ""))
                    if "unsafe-eval" in csp:
                        ext_data["risk"] += 25
                        self.indicators.append(f"Loosened CSP ('unsafe-eval') in '{name}'")
                        self.evidence.append(f"manifest.csp:unsafe-eval")
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
            raw = path.read_bytes()
            txt = raw.decode("utf-8", errors="ignore")

            if self.DYNAMIC_SCRIPT_PATTERN.search(txt):
                risk += 35
                self.indicators.append(f"Dynamic remote script injection in {path.name}")
                self.evidence.append(f"dynamic_script:{path.name}")

            if self.EVAL_PATTERN.search(txt):
                risk += 20
                self.indicators.append(f"Runtime eval() invocation in {path.name}")
                self.evidence.append(f"eval_call:{path.name}")

            entropy = self.calculate_entropy(raw)
            if entropy > 6.9 and len(raw) > 4096:
                risk += 30
                self.indicators.append(f"High-entropy obfuscated payload anomaly (entropy={entropy}) in {path.name}")
                self.evidence.append(f"high_entropy:{path.name}:{entropy}")

            if self.RAW_IP_PATTERN.search(txt):
                risk += 25
                self.indicators.append(f"Hardcoded raw IP C2 beacon in {path.name}")
                self.evidence.append(f"raw_ip_beacon:{path.name}")

            if self.WEBSOCKET_C2_PATTERN.search(txt):
                risk += 20
                self.indicators.append(f"WebSocket C2 connection initialized in {path.name}")
                self.evidence.append(f"websocket_c2:{path.name}")
        except Exception:
            pass
        return risk

    def _calculate_risk(self):
        total = sum(e.get("risk", 0) for e in self.audited_extensions)
        self.risk_score = min(100, total)

    def _print_summary(self):
        print(f"{Colors.CYAN}──────────────────────────────────────────────────────────────────{Colors.RESET}")
        print(f"Audited Extensions/Scripts: {Colors.WHITE}{len(self.audited_extensions)}{Colors.RESET}")
        print(f"Supply-Chain Indicators:    {Colors.YELLOW if self.indicators else Colors.GREEN}{len(self.indicators)}{Colors.RESET}")
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
        envelope.set_extension_info("supply_chain_auditor", "1.0.0")
        envelope.set_finding(
            finding_type="supply_chain_audit",
            affected_actor=hostname,
            affected_resource=str(target),
            result={
                "evidence": self.evidence,
                "indicators": self.indicators,
                "risk_score": self.risk_score,
                "audited_count": len(self.audited_extensions)
            },
            severity=severity,
            title="Extension Supply-Chain & Remote Execution Audit"
        )
        envelope.set_summary(
            f"Audited {len(self.audited_extensions)} extensions/scripts on {hostname}. Risk score: {self.risk_score}/100."
        )

        reports_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports")
        os.makedirs(reports_dir, exist_ok=True)
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = os.path.join(reports_dir, f"finding_supply_chain_auditor_{ts}.json")
        envelope.save(report_path)
        print(f"\n{Colors.GREEN}✔ Standardized Finding Envelope saved to:{Colors.RESET} {report_path}\n")
        return report_path


def main():
    parser = argparse.ArgumentParser(description="KVCH Extension Supply-Chain & Integrity Auditor")
    parser.add_argument("target", nargs="?", help="Directory or file to audit (defaults to local browser extensions)")
    args = parser.parse_args()

    auditor = SupplyChainAuditor(target_path=args.target)
    auditor.run_audit()


if __name__ == "__main__":
    main()
