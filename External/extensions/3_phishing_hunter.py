#!/usr/bin/env python3
"""
PHISHING HUNTER - Combines 3 Security Tools
Tool 1: Typosquatting Domain Generator & Checker
Tool 2: WHOIS Intelligence & Domain Age Analysis
Tool 3: DNS Recon & ML-based Risk Prediction
"""

import sys
import os
import json
import time
import threading
import yaml
from datetime import datetime
import argparse
import random

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.colors import Colors
from utils.ascii_art import BANNER_PHISHING_HUNTER
from utils.finding_envelope import FindingEnvelope
from utils.escalation_routes import get_escalation_route, get_role_report_config

try:
    import dns.resolver
    import whois
    import requests
except ImportError:
    print(f"{Colors.RED}Error: Missing dependencies. Run: pip install dnspython python-whois requests{Colors.RESET}")
    sys.exit(1)


class PhishingHunter:
    """Massive phishing hunter combining 3 tools with KVCH Finding Envelope output"""
    
    def __init__(self, company_domain):
        self.company = company_domain
        self.start_time = datetime.now()
        self.extension_id = "phishing_hunter"
        
        # Load manifest
        self.manifest = self._load_manifest()
        
        # Results
        self.suspicious_domains = []
        self.verified_phishing = []
        self.risk_assessments = []
        self.typosquatting_domains = []
        
        # Common TLDs
        self.tlds = ['com', 'net', 'org', 'io', 'co', 'uk', 'de', 'fr', 'au', 'ca']
        
        # Known phishing keywords
        self.suspicious_keywords = ['secure', 'login', 'verify', 'account', 'update', 
                                   'confirm', 'validate', 'authenticate', 'service']
        
        self.print_banner()
    
    def _load_manifest(self):
        """Load extension manifest from manifests folder"""
        manifest_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            'manifests',
            f'{self.extension_id}.yaml'
        )
        try:
            with open(manifest_path, 'r') as f:
                return yaml.safe_load(f)
        except FileNotFoundError:
            print(f"{Colors.YELLOW}⚠ Manifest not found at {manifest_path}{Colors.RESET}")
            return None
        except Exception as e:
            print(f"{Colors.YELLOW}⚠ Error loading manifest: {e}{Colors.RESET}")
            return None
    
    def print_banner(self):
        """Display massive banner with extension info"""
        os.system('clear' if os.name == 'posix' else 'cls')
        print(BANNER_PHISHING_HUNTER)
        print(f"{Colors.CYAN}╔══ TARGET: {Colors.WHITE}{self.company}{Colors.RESET}")
        print(f"{Colors.CYAN}╚══ TIME: {Colors.WHITE}{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.RESET}")
        
        # Show manifest info if available
        if self.manifest:
            print(f"\n{Colors.DIM}┌─ EXTENSION INFO ───────────────────────────────────────────────┐{Colors.RESET}")
            print(f"{Colors.DIM}│ {Colors.GREEN}Name:{Colors.RESET} {self.manifest.get('identity', {}).get('name', 'Unknown')}")
            print(f"{Colors.DIM}│ {Colors.GREEN}Type:{Colors.RESET} {self.manifest.get('identity', {}).get('type', 'report')}")
            print(f"{Colors.DIM}│ {Colors.GREEN}Creator:{Colors.RESET} {self.manifest.get('identity', {}).get('creator', 'Unknown')}")
            print(f"{Colors.DIM}│ {Colors.GREEN}Escalation Route:{Colors.RESET} {', '.join(self.manifest.get('routing', {}).get('escalation_route', ['security_analyst']))}")
            print(f"{Colors.DIM}└──────────────────────────────────────────────────────────────────┘{Colors.RESET}\n")
        
        print(f"\n{Colors.DIM}┌─ TOOLS LOADED ────────────────────────────────────────────────┐{Colors.RESET}")
        print(f"{Colors.DIM}│ {Colors.GREEN}🔧 Tool 1: {Colors.WHITE}Typosquatting Domain Generator & Checker{Colors.RESET}")
        print(f"{Colors.DIM}│ {Colors.GREEN}🔧 Tool 2: {Colors.WHITE}WHOIS Intelligence & Domain Age Analysis{Colors.RESET}")
        print(f"{Colors.DIM}│ {Colors.GREEN}🔧 Tool 3: {Colors.WHITE}DNS Recon & ML-based Risk Prediction{Colors.RESET}")
        print(f"{Colors.DIM}└──────────────────────────────────────────────────────────────────┘{Colors.RESET}\n")
    
    # ============================================================
    # TOOL 1: TYPOSQUATTING DOMAIN GENERATOR
    # ============================================================
    
    def generate_typosquatting_domains(self):
        """Tool 1: Generate typosquatting variations"""
        print(f"{Colors.BOLD}{Colors.YELLOW}[*] TOOL 1: Typosquatting Domain Generator{Colors.RESET}")
        print(f"{Colors.DIM}    Generating thousands of variations...{Colors.RESET}\n")
        
        domain_parts = self.company.split('.')
        base = domain_parts[0]
        
        variations = []
        
        # Method 1: Common typos
        typo_map = {
            'a': ['4', '@'],
            'e': ['3'],
            'i': ['1', '!'],
            'o': ['0'],
            's': ['5', '$'],
            't': ['7'],
            'l': ['1']
        }
        
        # Method 2: Character swaps
        for i in range(len(base)):
            for j in range(i+1, len(base)):
                swapped = list(base)
                swapped[i], swapped[j] = swapped[j], swapped[i]
                variations.append(''.join(swapped))
        
        # Method 3: Add common prefixes/suffixes
        prefixes = ['', 'secure-', 'verify-', 'login-', 'www-']
        suffixes = ['', '-secure', '-login', '-verify', '-account', '-service']
        
        for prefix in prefixes:
            for suffix in suffixes:
                if prefix or suffix:
                    variations.append(f"{prefix}{base}{suffix}")
        
        # Method 4: Keyboard adjacency (common mistakes)
        keyboard_adj = {
            'a': ['s', 'q', 'z'], 's': ['a', 'd', 'w'], 'd': ['s', 'f', 'e'],
            'f': ['d', 'g', 'r'], 'g': ['f', 'h', 't'], 'h': ['g', 'j', 'y'],
            'j': ['h', 'k', 'u'], 'k': ['j', 'l', 'i'], 'l': ['k', 'p', 'o'],
            'q': ['w', 'a'], 'w': ['q', 'e', 's'], 'e': ['w', 'r', 'd'],
            'r': ['e', 't', 'f'], 't': ['r', 'y', 'g'], 'y': ['t', 'u', 'h'],
            'u': ['y', 'i', 'j'], 'i': ['u', 'o', 'k'], 'o': ['i', 'p', 'l'],
            'p': ['o', 'l']
        }
        
        for i, char in enumerate(base):
            if char in keyboard_adj:
                for adj in keyboard_adj[char][:1]:  # Limit to first adjacency
                    variant = list(base)
                    variant[i] = adj
                    variations.append(''.join(variant))
        
        # Remove duplicates
        variations = list(set(variations))
        
        # Add TLDs
        domains = []
        for var in variations[:200]:  # Limit to 200 to avoid overwhelming
            for tld in self.tlds:
                domains.append(f"{var}.{tld}")
        
        self.typosquatting_domains = domains
        print(f"{Colors.GREEN}✔ Generated {Colors.WHITE}{len(domains)}{Colors.GREEN} typosquatting domains{Colors.RESET}\n")
        return domains
    
    # ============================================================
    # TOOL 2: WHOIS INTELLIGENCE
    # ============================================================
    
    def analyze_whois(self, domains):
        """Tool 2: WHOIS lookup and domain age analysis"""
        print(f"{Colors.BOLD}{Colors.YELLOW}[*] TOOL 2: WHOIS Intelligence & Domain Age Analysis{Colors.RESET}")
        print(f"{Colors.DIM}    Checking {len(domains[:50])} domains (rate limited)...{Colors.RESET}\n")
        
        suspicious = []
        
        for i, domain in enumerate(domains[:50]):  # Limit to 50 to avoid rate limiting
            if i % 10 == 0:
                progress = int((i / 50) * 50)
                bar = '█' * progress + '░' * (50 - progress)
                print(f"\r{Colors.CYAN}    Progress [{Colors.GREEN}{bar}{Colors.CYAN}] {Colors.WHITE}{int((i/50)*100)}%{Colors.RESET}", end='')
            
            try:
                w = whois.whois(domain)
                if w.creation_date:
                    if isinstance(w.creation_date, list):
                        creation_date = w.creation_date[0]
                    else:
                        creation_date = w.creation_date
                    
                    days_old = (datetime.now() - creation_date).days
                    
                    # Suspicious if domain is less than 30 days old
                    if days_old < 30:
                        result = {
                            'domain': domain,
                            'creation_date': creation_date.isoformat(),
                            'days_old': days_old,
                            'registrant': w.name if w.name else 'Unknown',
                            'registrar': w.registrar if w.registrar else 'Unknown',
                            'risk': 'HIGH',
                            'reason': 'Domain recently created'
                        }
                        suspicious.append(result)
                        print(f"\n{Colors.RED}    [!] SUSPICIOUS: {Colors.WHITE}{domain} {Colors.DIM}({days_old} days old){Colors.RESET}")
                    elif days_old < 90:
                        result = {
                            'domain': domain,
                            'creation_date': creation_date.isoformat(),
                            'days_old': days_old,
                            'registrant': w.name if w.name else 'Unknown',
                            'registrar': w.registrar if w.registrar else 'Unknown',
                            'risk': 'MEDIUM',
                            'reason': 'Domain relatively new (3 months)'
                        }
                        suspicious.append(result)
                        print(f"\n{Colors.YELLOW}    [~] SUSPICIOUS: {Colors.WHITE}{domain} {Colors.DIM}({days_old} days old){Colors.RESET}")
                
                time.sleep(0.5)  # Rate limit
                
            except Exception as e:
                # Domain might not exist or WHOIS lookup failed
                pass
        
        self.suspicious_domains = suspicious
        print(f"\n\n{Colors.GREEN}✔ WHOIS analysis complete! Found {Colors.WHITE}{len(suspicious)}{Colors.GREEN} suspicious domains{Colors.RESET}\n")
        return suspicious
    
    # ============================================================
    # TOOL 3: DNS RECON & RISK PREDICTION
    # ============================================================
    
    def dns_recon(self, domains):
        """Tool 3: DNS reconnaissance and risk prediction"""
        print(f"{Colors.BOLD}{Colors.YELLOW}[*] TOOL 3: DNS Recon & ML-based Risk Prediction{Colors.RESET}")
        print(f"{Colors.DIM}    Performing DNS reconnaissance...{Colors.RESET}\n")
        
        risk_assessments = []
        
        for domain in domains[:30]:  # Limit to 30
            try:
                # Check if domain resolves
                answers = dns.resolver.resolve(domain, 'A')
                ip = str(answers[0])
                
                # Risk factors
                risk_score = 0
                risk_factors = []
                
                # Check for phishing keywords
                for keyword in self.suspicious_keywords:
                    if keyword in domain:
                        risk_score += 20
                        risk_factors.append(f"Contains keyword: {keyword}")
                
                # Check for suspicious IP reputation
                try:
                    # Check AbuseIPDB
                    response = requests.get(
                        f'https://api.abuseipdb.com/api/v2/check',
                        params={'ipAddress': ip},
                        headers={'Accept': 'application/json'},
                        timeout=5
                    )
                    if response.status_code == 200:
                        data = response.json()
                        confidence = data.get('data', {}).get('abuseConfidenceScore', 0)
                        if confidence > 50:
                            risk_score += confidence // 10
                            risk_factors.append(f"IP reputation: {confidence}% malicious")
                except:
                    pass
                
                # Check for domain age (if available from previous step)
                for suspicious in self.suspicious_domains:
                    if suspicious['domain'] == domain:
                        if suspicious.get('days_old', 0) < 30:
                            risk_score += 30
                            risk_factors.append("Domain very new")
                
                assessment = {
                    'domain': domain,
                    'ip': ip,
                    'risk_score': min(risk_score, 100),
                    'risk_factors': risk_factors,
                    'risk_level': 'CRITICAL' if risk_score > 70 else 'HIGH' if risk_score > 50 else 'MEDIUM' if risk_score > 30 else 'LOW'
                }
                risk_assessments.append(assessment)
                
                if assessment['risk_level'] in ['CRITICAL', 'HIGH']:
                    print(f"{Colors.RED}    [!] HIGH RISK: {Colors.WHITE}{domain} {Colors.DIM}({assessment['risk_score']}/100){Colors.RESET}")
                elif assessment['risk_level'] == 'MEDIUM':
                    print(f"{Colors.YELLOW}    [~] MEDIUM RISK: {Colors.WHITE}{domain} {Colors.DIM}({assessment['risk_score']}/100){Colors.RESET}")
                
            except:
                # Domain doesn't resolve
                pass
        
        self.risk_assessments = risk_assessments
        print(f"\n{Colors.GREEN}✔ DNS recon complete! Assessed {Colors.WHITE}{len(risk_assessments)}{Colors.GREEN} domains{Colors.RESET}\n")
        return risk_assessments
    
    # ============================================================
    # FINDING ENVELOPE GENERATION (NEW)
    # ============================================================
    
    def generate_finding_envelope(self, domain_data, risk_level):
        """Generate standardized Finding Envelope for KVCH"""
        envelope = FindingEnvelope()
        
        # Set extension info
        envelope.set_extension_info(self.extension_id, "1.0.0")
        
        # Determine finding type based on risk level
        if risk_level in ['CRITICAL', 'HIGH']:
            finding_type = 'phishing_domain_high_risk'
        elif risk_level == 'MEDIUM':
            finding_type = 'phishing_domain_medium_risk'
        else:
            finding_type = 'phishing_domain_low_risk'
        
        # Set finding
        envelope.set_finding(
            finding_type=finding_type,
            affected_actor=domain_data.get('domain', 'unknown'),
            affected_resource=self.company,
            result=domain_data
        )
        
        # Add evidence
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
        envelope.add_evidence(f"reports/phishing_hunt_{self.company}_{timestamp}.json")
        
        # Set enforcement (OBSERVE for report extensions)
        envelope.set_enforcement("OBSERVE")
        
        # Set safe summary
        safe_summary = f"Suspicious domain detected: {domain_data.get('domain', 'unknown')} "
        if domain_data.get('days_old') is not None:
            safe_summary += f"(created {domain_data.get('days_old', 'unknown')} days ago)"
        if domain_data.get('risk_factors'):
            safe_summary += f" - {', '.join(domain_data.get('risk_factors', [])[:2])}"
        envelope.set_summary(safe_summary)
        
        # Set recipient (first in escalation route)
        route = self.manifest.get('routing', {}).get('escalation_route', ['security_analyst'])
        envelope.set_recipient(route[0])
        
        # Set technical details (for engineers)
        envelope.set_technical_details({
            'company': self.company,
            'domain': domain_data,
            'risk_factors': domain_data.get('risk_factors', []),
            'risk_score': domain_data.get('risk_score', 0),
            'recommendation': 'Block domain, monitor for phishing activity, and update threat feeds'
        })
        
        # Set executive summary (for management)
        priority = 'CRITICAL' if risk_level in ['CRITICAL', 'HIGH'] else 'MEDIUM' if risk_level == 'MEDIUM' else 'LOW'
        envelope.set_executive_summary({
            'impact': f'{priority} risk phishing domain detected targeting {self.company}',
            'recommended_action': 'Block domain, alert employees, and investigate',
            'priority': priority,
            'affected_assets': [domain_data.get('domain', 'unknown')]
        })
        
        return envelope
    
    def save_finding(self, envelope):
        """Save finding envelope to reports folder"""
        os.makedirs('reports', exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
        filename = f"reports/finding_{self.extension_id}_{self.company}_{timestamp}.json"
        envelope.save(filename)
        return filename
    
    # ============================================================
    # REPORT GENERATION (UPDATED)
    # ============================================================
    
    def generate_report(self):
        """Generate comprehensive report with Finding Envelopes"""
        print(f"\n{Colors.BOLD}{Colors.CYAN}[*] GENERATING FINDING ENVELOPES{Colors.RESET}")
        print("═"*70)
        
        duration = (datetime.now() - self.start_time).total_seconds()
        
        findings = []
        
        report_data = {
            'hunt_metadata': {
                'target': self.company,
                'started_at': self.start_time.isoformat(),
                'completed_at': datetime.now().isoformat(),
                'duration_seconds': round(duration, 3),
                'tools': ['typosquatting_generation', 'whois_intelligence', 'dns_reconnaissance', 'ip_reputation'],
                'tlds_checked': self.tlds,
            },
            'typosquatting_domains': self.typosquatting_domains,
            'suspicious_domains': self.suspicious_domains,
            'risk_assessments': self.risk_assessments,
            'verified_phishing': self.verified_phishing,
            'counts': {
                'generated_domains': len(self.typosquatting_domains),
                'suspicious_domains': len(self.suspicious_domains),
                'risk_assessments': len(self.risk_assessments),
                'verified_phishing': len(self.verified_phishing),
                'high_risk': len([d for d in self.risk_assessments if d.get('risk_level') in ['CRITICAL', 'HIGH']]),
            },
            'risk_model': {
                'keywords': self.suspicious_keywords,
                'max_domains_per_lookup': 50,
                'max_domains_per_dns_check': 30,
            },
            'recommendations': [
                'Block confirmed phishing domains at DNS and web gateways',
                'Monitor newly registered lookalike domains',
                'Alert users when suspicious domains impersonate the target',
            ],
        }
        envelope = self.generate_finding_envelope(report_data, 'REPORT')
        envelope.set_summary(f"Phishing hunt completed for {self.company}")
        filename = self.save_finding(envelope)
        findings = [filename]
        print(f"{Colors.GREEN}✔ Report saved: {Colors.WHITE}{filename}{Colors.RESET}")
        
        # Display summary
        high_risk = [d for d in self.risk_assessments if d.get('risk_level') in ['CRITICAL', 'HIGH']]
        
        print(f"\n{Colors.BOLD}{Colors.GREEN}  📊 PHISHING HUNT SUMMARY{Colors.RESET}")
        print("═"*70)
        print(f"\n{Colors.CYAN}  Target:{Colors.RESET} {self.company}")
        print(f"{Colors.CYAN}  Duration:{Colors.RESET} {duration:.2f} seconds")
        print(f"{Colors.CYAN}  Suspicious Domains:{Colors.RESET} {len(self.suspicious_domains)}")
        print(f"{Colors.CYAN}  High Risk Domains:{Colors.RESET} {len(high_risk)}")
        print(f"{Colors.CYAN}  Findings Generated:{Colors.RESET} {len(findings)}")
        
        if high_risk:
            print(f"\n{Colors.RED}  ⚠ HIGH RISK DOMAINS:{Colors.RESET}")
            for domain in high_risk[:5]:
                print(f"    {Colors.WHITE}• {domain['domain']} {Colors.DIM}(Risk: {domain.get('risk_score', 0)}/100){Colors.RESET}")
                for factor in domain.get('risk_factors', [])[:2]:
                    print(f"      {Colors.DIM}→ {factor}{Colors.RESET}")
        
        if findings:
            print(f"\n{Colors.GREEN}✅ {len(findings)} finding envelopes saved to reports/ directory{Colors.RESET}")
        
        return findings
    
    # ============================================================
    # MAIN RUN
    # ============================================================
    
    def run(self):
        """Run all tools"""
        print(f"{Colors.BOLD}{Colors.GREEN}🚀 INITIALIZING ALL TOOLS...{Colors.RESET}\n")
        
        domains = self.generate_typosquatting_domains()
        self.analyze_whois(domains)
        self.dns_recon(domains)
        
        findings = self.generate_report()
        return findings


def main():
    parser = argparse.ArgumentParser(description='Phishing Hunter - 3 Tools in 1')
    parser.add_argument('company', help='Company domain to protect')
    
    args = parser.parse_args()
    
    hunter = PhishingHunter(args.company)
    hunter.run()


if __name__ == '__main__':
    main()