#!/usr/bin/env python3
"""
EXTENSION SUPPLY-CHAIN & INTEGRITY AUDITOR - Enhanced Anti-Evasion & MV3 Edition
Tool 1: Update URL & Extension Manifest Provenance Auditor
Tool 2: Remote Code Execution & Dynamic Script Injection Scanner with De-Obfuscation
Tool 3: Mathematical Shannon Entropy & Obfuscated Payload Detector
Tool 4: MV3 Offscreen Abuse & C2 WebSocket Telemetry Beacon Analyzer
"""

import sys
import os
import json
import re
import math
import yaml
import base64
import argparse
from collections import Counter
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


class SupplyChainAuditor:
    """Combines 4 defensive security tools to detect extension supply chain drift, MV3 abuse, and remote execution."""

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
    RAW_IP_PATTERN = re.compile(r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?')
    DGA_PATTERN = re.compile(r'https?://[a-z0-9\-]{14,}\.(?:xyz|top|online|ru|cc|to|pw)')

    MV3_PERMISSIONS = {
        "offscreen": "Can create hidden offscreen DOM documents to bypass service worker limits",
        "scripting": "Can dynamically inject arbitrary JavaScript into any web tab",
        "declarativeNetRequestWithHostAccess": "Can modify HTTP requests without per-site prompts",
        "debugger": "Can attach devtools protocol and capture all user actions"
    }

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
        if not data: return 0.0
        length = len(data)
        counts = Counter(data)
        return round(-sum((c/length) * math.log2(c/length) for c in counts.values()), 3)

    def run_audit(self):
        print(f"\n{Colors.CYAN}╔══════════════════════════════════════════════════════════════════════╗{Colors.RESET}")
        print(f"{Colors.GREEN}║     KVCH SUPPLY-CHAIN & INTEGRITY AUDITOR (ANTI-EVASION EDITION)     ║{Colors.RESET}")
        print(f"{Colors.CYAN}╚══════════════════════════════════════════════════════════════════════╝{Colors.RESET}\n")

        target = self.target_path
        if not target or not os.path.exists(target):
            discovered = self._discover_browser_extensions()
            if discovered:
                print(f"{Colors.BLUE}[*] Discovered {len(discovered)} browser profile(s). Auditing supply-chain integrity...{Colors.RESET}")
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

                    for perm in m.get("permissions", []):
                        if perm in self.MV3_PERMISSIONS:
                            ext_data["risk"] += 20
                            self.indicators.append(f"High-risk MV3 permission '{perm}' in '{name}'")
                            self.evidence.append(f"manifest.mv3_permission:{perm}")

                    ext_conn = m.get("externally_connectable", {})
                    matches = ext_conn.get("matches", [])
                    if any(x in ["*://*/*", "<all_urls>"] for x in matches):
                        ext_data["risk"] += 30
                        self.indicators.append(f"Wildcard externally_connectable in '{name}'")
                        self.evidence.append("manifest.externally_connectable:wildcard")

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
            txt = Deobfuscator.normalize(raw.decode("utf-8", errors="ignore"))

            if self.DYNAMIC_SCRIPT_PATTERN.search(txt):
                risk += 35
                self.indicators.append(f"Dynamic remote script injection in {path.name}")
                self.evidence.append(f"dynamic_script:{path.name}")

            if self.EVAL_PATTERN.search(txt):
                risk += 25
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

            if self.DGA_PATTERN.search(txt):
                risk += 30
                self.indicators.append(f"Suspicious algorithmically-generated domain (DGA) in {path.name}")
                self.evidence.append(f"dga_domain:{path.name}")

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
            "sr_dev": {"technical_action": "Check update_url in manifest.json, verify code hashes against original vendor repository."},
            "management": {"business_impact": "Severe — backdoored endpoint, remote command execution, and network pivoting risk."},
            "hr": {"compliance_action": "Issue internal security advisory warning employees against reinstalling the flagged tool."},
            "intern": {"learning_guidance": "Threat actors buy legitimate extensions and push malicious backend code updates."}
        }

        envelope = FindingEnvelope()
        envelope.set_extension_info("supply_chain_auditor", "1.1.0")
        envelope.set_finding(
            finding_type="supply_chain_audit",
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
            title="Extension Supply-Chain & Remote Execution Audit"
        )
        envelope.set_summary(
            f"Audited {len(self.audited_extensions)} extensions on {hostname}. Risk score: {self.risk_score}/100. "
            f"De-obfuscation and MV3 deep inspection applied."
        )

        reports_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports")
        os.makedirs(reports_dir, exist_ok=True)
        report_path = os.path.join(reports_dir, "finding_7_supply_chain_auditor.json")
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
