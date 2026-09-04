#!/usr/bin/env python3
"""
ATTACK SURFACE SCANNER - Combines 4 Security Tools
Tool 1: Subdomain Enumeration (dnsmap style)
Tool 2: Port Scanning (nmap style)  
Tool 3: SSL/TLS Analysis (sslscan style)
Tool 4: Cloud Storage Detection (S3 bucket finder)
"""

import sys
import os
import json
import socket
import ssl
import time
import threading
import yaml
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import dns.resolver
import requests
import whois
import argparse

# Add parent directory to path for utils
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.colors import Colors
from utils.ascii_art import BANNER_ATTACK_SCANNER
from utils.finding_envelope import FindingEnvelope
from utils.escalation_routes import get_escalation_route, get_role_report_config


class AttackSurfaceScanner:
    """Massive scanner combining 4 tools with KVCH Finding Envelope output"""
    
    def __init__(self, domain, threads=100, timeout=5):
        self.domain = domain
        self.threads = threads
        self.timeout = timeout
        self.start_time = datetime.now()
        self.extension_id = "attack_surface_scanner"
        
        # Load manifest
        self.manifest = self._load_manifest()
        
        # Results storage
        self.subdomains = []
        self.open_ports = []
        self.ssl_results = []
        self.cloud_buckets = []
        self.technologies = []
        self.vulnerabilities = []
        
        # Progress tracking
        self.total_checks = 0
        self.completed_checks = 0
        self.lock = threading.Lock()
        
        # Common subdomains for enumeration
        self.common_subdomains = [
            'www', 'mail', 'ftp', 'dev', 'test', 'api', 'admin', 'vpn',
            'remote', 'portal', 'login', 'dashboard', 'staging', 'prod',
            'backup', 'cdn', 'static', 'assets', 'media', 'docs', 'support',
            'help', 'blog', 'shop', 'store', 'cloud', 'server', 'host',
            'web', 'app', 'mobile', 'api2', 'stage', 'demo', 'sandbox',
            'internal', 'monitor', 'metrics', 'status', 'health'
        ]
        
        # Common ports
        self.ports = [21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143,
                      443, 445, 993, 995, 1723, 3306, 3389, 5432, 5900,
                      6379, 8080, 8443, 27017, 9200, 9300, 11211, 27017,
                      1433, 1521, 2181, 2888, 3888, 5000, 5001, 5433]
        
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
        print(BANNER_ATTACK_SCANNER)
        print(f"{Colors.CYAN}╔══ TARGET: {Colors.WHITE}{self.domain}{Colors.RESET}")
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
        print(f"{Colors.DIM}│ {Colors.GREEN}🔧 Tool 1: {Colors.WHITE}Subdomain Enumeration (DNS brute-force){Colors.RESET}")
        print(f"{Colors.DIM}│ {Colors.GREEN}🔧 Tool 2: {Colors.WHITE}Port Scanner (SYN/Connect){Colors.RESET}")
        print(f"{Colors.DIM}│ {Colors.GREEN}🔧 Tool 3: {Colors.WHITE}SSL/TLS Analyzer (Cert & Crypto){Colors.RESET}")
        print(f"{Colors.DIM}│ {Colors.GREEN}🔧 Tool 4: {Colors.WHITE}Cloud Storage Detector (S3, Azure, GCP){Colors.RESET}")
        print(f"{Colors.DIM}└──────────────────────────────────────────────────────────────────┘{Colors.RESET}\n")
    
    # ============================================================
    # TOOL 1: SUBDOMAIN ENUMERATION
    # ============================================================
    
    def enumerate_subdomains(self):
        """Tool 1: Discover subdomains via DNS brute-force"""
        print(f"{Colors.BOLD}{Colors.YELLOW}[*] TOOL 1: Subdomain Enumeration Started{Colors.RESET}")
        print(f"{Colors.DIM}    Brute-forcing {len(self.common_subdomains)} common subdomains...{Colors.RESET}\n")
        
        found_subdomains = []
        
        def check_subdomain(sub):
            try:
                target = f"{sub}.{self.domain}"
                answers = dns.resolver.resolve(target, 'A')
                ips = [str(r) for r in answers]
                return (target, ips)
            except:
                return None
        
        with ThreadPoolExecutor(max_workers=self.threads) as executor:
            futures = {executor.submit(check_subdomain, sub): sub for sub in self.common_subdomains}
            
            for i, future in enumerate(as_completed(futures)):
                self.total_checks += 1
                self.completed_checks += 1
                
                progress = int((self.completed_checks / len(self.common_subdomains)) * 50)
                bar = '█' * progress + '░' * (50 - progress)
                print(f"\r{Colors.CYAN}    Progress [{Colors.GREEN}{bar}{Colors.CYAN}] {Colors.WHITE}{int((self.completed_checks/len(self.common_subdomains))*100)}%{Colors.RESET}", end='')
                
                result = future.result()
                if result:
                    subdomain, ips = result
                    found_subdomains.append({'name': subdomain, 'ips': ips})
                    print(f"\n{Colors.GREEN}    [+] Found: {Colors.WHITE}{subdomain} {Colors.DIM}-> {', '.join(ips)}{Colors.RESET}")
        
        self.subdomains = found_subdomains
        print(f"\n\n{Colors.GREEN}✔ Subdomain enumeration complete! Found {Colors.WHITE}{len(found_subdomains)}{Colors.GREEN} subdomains{Colors.RESET}\n")
        return found_subdomains
    
    # ============================================================
    # TOOL 2: PORT SCANNER
    # ============================================================
    
    def scan_ports(self):
        """Tool 2: Scan for open ports on discovered subdomains"""
        print(f"{Colors.BOLD}{Colors.YELLOW}[*] TOOL 2: Port Scanner Started{Colors.RESET}")
        print(f"{Colors.DIM}    Scanning {len(self.subdomains)} hosts across {len(self.ports)} ports...{Colors.RESET}\n")
        
        if not self.subdomains:
            print(f"{Colors.YELLOW}⚠ No subdomains to scan. Skipping port scan.{Colors.RESET}")
            return []
        
        # Get unique IPs
        ips = set()
        for sub in self.subdomains:
            for ip in sub.get('ips', []):
                ips.add(ip)
        
        print(f"{Colors.CYAN}    Unique IPs to scan: {Colors.WHITE}{len(ips)}{Colors.RESET}\n")
        
        open_ports_found = []
        total_checks = len(ips) * len(self.ports)
        check_count = 0
        
        def check_port(ip, port):
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(1.0)
                result = sock.connect_ex((ip, port))
                sock.close()
                if result == 0:
                    service = self._get_service_name(port)
                    return {'ip': ip, 'port': port, 'service': service}
            except:
                pass
            return None
        
        with ThreadPoolExecutor(max_workers=50) as executor:
            futures = []
            for ip in ips:
                for port in self.ports:
                    futures.append(executor.submit(check_port, ip, port))
            
            for future in as_completed(futures):
                check_count += 1
                if check_count % 50 == 0:
                    progress = int((check_count / total_checks) * 50)
                    bar = '█' * progress + '░' * (50 - progress)
                    print(f"\r{Colors.CYAN}    Scanning [{Colors.GREEN}{bar}{Colors.CYAN}] {Colors.WHITE}{int((check_count/total_checks)*100)}%{Colors.RESET}", end='')
                
                result = future.result()
                if result:
                    open_ports_found.append(result)
                    print(f"\n{Colors.RED}    [!] Open port: {Colors.WHITE}{result['ip']}:{result['port']} {Colors.DIM}({result['service']}){Colors.RESET}")
        
        self.open_ports = open_ports_found
        print(f"\n\n{Colors.GREEN}✔ Port scan complete! Found {Colors.WHITE}{len(open_ports_found)}{Colors.GREEN} open ports{Colors.RESET}\n")
        return open_ports_found
    
    def _get_service_name(self, port):
        services = {
            21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP', 53: 'DNS',
            80: 'HTTP', 110: 'POP3', 111: 'RPC', 135: 'MSRPC', 139: 'NetBIOS',
            143: 'IMAP', 443: 'HTTPS', 445: 'SMB', 993: 'IMAPS', 995: 'POP3S',
            1723: 'PPTP', 3306: 'MySQL', 3389: 'RDP', 5432: 'PostgreSQL',
            5900: 'VNC', 6379: 'Redis', 8080: 'HTTP-Alt', 8443: 'HTTPS-Alt',
            27017: 'MongoDB', 9200: 'Elasticsearch', 9300: 'Elasticsearch',
            11211: 'Memcached', 1433: 'MSSQL', 1521: 'Oracle', 2181: 'ZooKeeper',
            2888: 'ZooKeeper', 3888: 'ZooKeeper', 5000: 'Flask', 5001: 'Flask',
            5433: 'PostgreSQL'
        }
        return services.get(port, 'Unknown')
    
    # ============================================================
    # TOOL 3: SSL/TLS ANALYZER
    # ============================================================
    
    def analyze_ssl(self):
        """Tool 3: Analyze SSL/TLS certificates and configurations"""
        print(f"{Colors.BOLD}{Colors.YELLOW}[*] TOOL 3: SSL/TLS Analyzer Started{Colors.RESET}")
        print(f"{Colors.DIM}    Analyzing SSL/TLS configurations...{Colors.RESET}\n")
        
        ssl_results = []
        
        for sub in self.subdomains:
            hostname = sub['name']
            print(f"{Colors.CYAN}    Checking: {Colors.WHITE}{hostname}{Colors.RESET}", end=' ')
            
            try:
                context = ssl.create_default_context()
                with socket.create_connection((hostname, 443), timeout=5) as sock:
                    with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                        cert = ssock.getpeercert()
                        
                        # Extract certificate info
                        issued_to = cert.get('subject', [{}])[0].get('commonName', 'Unknown')
                        issuer = cert.get('issuer', [{}])[0].get('commonName', 'Unknown')
                        expire_date = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                        days_left = (expire_date - datetime.now()).days
                        cipher = ssock.cipher()
                        
                        result = {
                            'hostname': hostname,
                            'issued_to': issued_to,
                            'issuer': issuer,
                            'expires_in_days': days_left,
                            'cipher': cipher[0] if cipher else 'Unknown',
                            'protocol': ssock.version()
                        }
                        ssl_results.append(result)
                        
                        # Status indicator
                        if days_left < 30:
                            print(f"{Colors.RED}⚠ EXPIRING in {days_left} days!{Colors.RESET}")
                        elif days_left < 90:
                            print(f"{Colors.YELLOW}⚠ Expires in {days_left} days{Colors.RESET}")
                        else:
                            print(f"{Colors.GREEN}✓ Valid ({days_left} days){Colors.RESET}")
                        
            except Exception as e:
                print(f"{Colors.DIM}✗ No HTTPS or error{Colors.RESET}")
        
        self.ssl_results = ssl_results
        print(f"\n{Colors.GREEN}✔ SSL analysis complete! Analyzed {Colors.WHITE}{len(ssl_results)}{Colors.GREEN} hosts{Colors.RESET}\n")
        return ssl_results
    
    # ============================================================
    # TOOL 4: CLOUD STORAGE DETECTOR
    # ============================================================
    
    def detect_cloud_storage(self):
        """Tool 4: Detect exposed cloud storage (S3, Azure, GCP)"""
        print(f"{Colors.BOLD}{Colors.YELLOW}[*] TOOL 4: Cloud Storage Detector Started{Colors.RESET}")
        print(f"{Colors.DIM}    Checking for exposed cloud storage...{Colors.RESET}\n")
        
        cloud_buckets = []
        
        # Generate bucket name variations
        variations = [
            f"{self.domain}",
            f"{self.domain}-backup",
            f"{self.domain}-data",
            f"{self.domain}-assets",
            f"{self.domain}-files",
            f"{self.domain}-logs",
            f"{self.domain}-storage",
            f"assets-{self.domain}",
            f"media-{self.domain}",
            f"static-{self.domain}"
        ]
        
        # Check S3
        for bucket in variations:
            try:
                url = f"http://{bucket}.s3.amazonaws.com"
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    cloud_buckets.append({
                        'provider': 'AWS S3',
                        'name': bucket,
                        'url': url,
                        'risk': 'CRITICAL'
                    })
                    print(f"{Colors.RED}    [!] EXPOSED S3 BUCKET: {Colors.WHITE}{bucket}.s3.amazonaws.com{Colors.RESET}")
                elif response.status_code == 403:
                    print(f"{Colors.DIM}    ✓ {bucket}.s3.amazonaws.com (private){Colors.RESET}")
            except:
                pass
            
            # Check Azure Blob
            try:
                url = f"https://{bucket}.blob.core.windows.net"
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    cloud_buckets.append({
                        'provider': 'Azure Blob',
                        'name': bucket,
                        'url': url,
                        'risk': 'CRITICAL'
                    })
                    print(f"{Colors.RED}    [!] EXPOSED AZURE BLOB: {Colors.WHITE}{bucket}.blob.core.windows.net{Colors.RESET}")
            except:
                pass
            
            # Check GCP Storage
            try:
                url = f"https://storage.googleapis.com/{bucket}"
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    cloud_buckets.append({
                        'provider': 'GCP Storage',
                        'name': bucket,
                        'url': url,
                        'risk': 'CRITICAL'
                    })
                    print(f"{Colors.RED}    [!] EXPOSED GCP BUCKET: {Colors.WHITE}{url}{Colors.RESET}")
            except:
                pass
        
        self.cloud_buckets = cloud_buckets
        print(f"\n{Colors.GREEN}✔ Cloud storage detection complete! Found {Colors.WHITE}{len(cloud_buckets)}{Colors.GREEN} exposed buckets{Colors.RESET}\n")
        return cloud_buckets
    
    # ============================================================
    # FINDING ENVELOPE GENERATION (NEW)
    # ============================================================
    
    def generate_finding_envelope(self, finding_type, details, affected_resource):
        """Generate standardized Finding Envelope for KVCH"""
        envelope = FindingEnvelope()
        
        # Set extension info
        envelope.set_extension_info(self.extension_id, "1.0.0")
        
        # Set finding
        envelope.set_finding(
            finding_type=finding_type,
            affected_actor=self.domain,
            affected_resource=affected_resource,
            result=details
        )
        
        # Add evidence
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
        envelope.add_evidence(f"reports/attack_scan_{self.domain}_{timestamp}.json")
        
        # Set enforcement (OBSERVE for report extensions)
        envelope.set_enforcement("OBSERVE")
        
        # Set safe summary
        safe_summaries = {
            'open_port': f"Open {details.get('service', 'unknown')} port detected on {affected_resource}",
            'ssl_issue': f"SSL certificate expiring on {affected_resource} ({details.get('days_left', 'unknown')} days left)",
            'exposed_bucket': f"Exposed storage bucket found: {details.get('name', 'unknown')} on {details.get('provider', 'unknown')}",
            'subdomain_discovered': f"New subdomain discovered: {details.get('name', 'unknown')}"
        }
        envelope.set_summary(safe_summaries.get(finding_type, "Security issue detected"))
        
        # Set recipient (first in escalation route)
        route = self.manifest.get('routing', {}).get('escalation_route', ['security_analyst'])
        envelope.set_recipient(route[0])
        
        # Set technical details (for engineers)
        envelope.set_technical_details({
            'domain': self.domain,
            'affected_resource': affected_resource,
            'details': details,
            'recommendation': self._get_recommendation(finding_type, details)
        })
        
        # Set executive summary (for management)
        envelope.set_executive_summary({
            'impact': 'Potential security risk to company infrastructure',
            'recommended_action': 'Review and secure affected resource',
            'priority': 'HIGH' if finding_type in ['exposed_bucket', 'open_port'] else 'MEDIUM',
            'affected_assets': [self.domain, affected_resource]
        })
        
        return envelope
    
    def _get_recommendation(self, finding_type, details):
        """Get recommendation for finding type"""
        recommendations = {
            'open_port': f"Close port {details.get('port', 'unknown')} if not needed, or restrict access",
            'ssl_issue': f"Renew SSL certificate for {details.get('hostname', 'unknown')}",
            'exposed_bucket': f"Make bucket {details.get('name', 'unknown')} private immediately",
            'subdomain_discovered': f"Verify subdomain {details.get('name', 'unknown')} is intended"
        }
        return recommendations.get(finding_type, "Review and secure affected resource")
    
    def save_finding(self, envelope):
        """Save finding envelope to reports folder"""
        os.makedirs('reports', exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
        filename = f"reports/finding_{self.extension_id}_{self.domain}_{timestamp}.json"
        envelope.save(filename)
        return filename
    
    # ============================================================
    # REPORT GENERATION (UPDATED)
    # ============================================================
    
    def generate_report(self):
        """Generate comprehensive scan report with Finding Envelopes"""
        print(f"\n{Colors.BOLD}{Colors.CYAN}[*] GENERATING FINDING ENVELOPES{Colors.RESET}")
        print("═"*70)
        
        duration = (datetime.now() - self.start_time).total_seconds()
        
        # Calculate risk score
        risk_score = 0
        risk_score += len(self.cloud_buckets) * 30
        risk_score += len([s for s in self.ssl_results if s.get('expires_in_days', 365) < 30]) * 15
        risk_score += len(self.open_ports) * 2
        
        risk_level = 'CRITICAL' if risk_score > 50 else 'HIGH' if risk_score > 30 else 'MEDIUM' if risk_score > 15 else 'LOW'
        
        report_data = {
            'scan_metadata': {
                'target': self.domain,
                'started_at': self.start_time.isoformat(),
                'completed_at': datetime.now().isoformat(),
                'duration_seconds': round(duration, 3),
                'threads': self.threads,
                'timeout_seconds': self.timeout,
                'tools': ['dns_enumeration', 'tcp_connect_scan', 'tls_analysis', 'cloud_storage_detection'],
            },
            'subdomains': self.subdomains,
            'open_ports': self.open_ports,
            'ssl_results': self.ssl_results,
            'cloud_buckets': self.cloud_buckets,
            'technologies': self.technologies,
            'vulnerabilities': self.vulnerabilities,
            'counts': {
                'subdomains': len(self.subdomains),
                'open_ports': len(self.open_ports),
                'ssl_hosts': len(self.ssl_results),
                'exposed_buckets': len(self.cloud_buckets),
                'vulnerabilities': len(self.vulnerabilities),
            },
            'risk_assessment': {
                'score': min(risk_score, 100),
                'level': risk_level,
                'factors': [
                    f'{len(self.open_ports)} open ports',
                    f'{len(self.cloud_buckets)} exposed cloud buckets',
                    f'{len(self.vulnerabilities)} vulnerabilities',
                ],
            },
            'recommendations': [
                'Review discovered hosts and remove unauthorized services',
                'Restrict exposed ports to required sources',
                'Renew certificates nearing expiration',
                'Verify cloud storage access policies',
            ],
        }
        envelope = self.generate_finding_envelope('attack_surface_scan', report_data, self.domain)
        envelope.set_summary(f"Attack surface scan completed for {self.domain}")
        filename = self.save_finding(envelope)
        findings = [filename]
        print(f"{Colors.GREEN}✔ Report saved: {Colors.WHITE}{filename}{Colors.RESET}")
        
        # Display summary
        print(f"\n{Colors.BOLD}{Colors.GREEN}  📊 SCAN SUMMARY{Colors.RESET}")
        print("═"*70)
        print(f"\n{Colors.CYAN}  Target:{Colors.RESET} {self.domain}")
        print(f"{Colors.CYAN}  Duration:{Colors.RESET} {duration:.2f} seconds")
        print(f"{Colors.CYAN}  Subdomains Found:{Colors.RESET} {len(self.subdomains)}")
        print(f"{Colors.CYAN}  Open Ports Found:{Colors.RESET} {len(self.open_ports)}")
        print(f"{Colors.CYAN}  SSL Analyzed:{Colors.RESET} {len(self.ssl_results)}")
        print(f"{Colors.CYAN}  Exposed Buckets:{Colors.RESET} {len(self.cloud_buckets)}")
        print(f"{Colors.CYAN}  Findings Generated:{Colors.RESET} {len(findings)}")
        
        risk_color = Colors.RED if risk_level in ['CRITICAL', 'HIGH'] else Colors.YELLOW if risk_level == 'MEDIUM' else Colors.GREEN
        print(f"\n{Colors.BOLD}  Risk Score: {risk_color}{min(risk_score, 100)}/100 ({risk_level}){Colors.RESET}")
        
        if findings:
            print(f"\n{Colors.GREEN}✅ {len(findings)} finding envelopes saved to reports/ directory{Colors.RESET}")
        
        return findings
    
    # ============================================================
    # MAIN RUN
    # ============================================================
    
    def run(self):
        """Run all tools"""
        print(f"{Colors.BOLD}{Colors.GREEN}🚀 INITIALIZING ALL TOOLS...{Colors.RESET}\n")
        
        self.enumerate_subdomains()
        self.scan_ports()
        self.analyze_ssl()
        self.detect_cloud_storage()
        
        findings = self.generate_report()
        return findings


def main():
    parser = argparse.ArgumentParser(description='Attack Surface Scanner - 4 Tools in 1')
    parser.add_argument('domain', help='Domain to scan')
    parser.add_argument('-t', '--threads', type=int, default=100, help='Number of threads')
    parser.add_argument('-T', '--timeout', type=int, default=5, help='Timeout in seconds')
    
    args = parser.parse_args()
    
    scanner = AttackSurfaceScanner(args.domain, args.threads, args.timeout)
    scanner.run()


if __name__ == '__main__':
    main()