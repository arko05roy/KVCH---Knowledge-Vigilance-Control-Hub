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
from utils.laptop_utils import get_my_hostname, get_my_ip, get_netstat_snapshot, print_laptop_info


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
        self.netstat_snapshot = {}
        
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
        try:
            socket.inet_aton(self.domain)
            self.subdomains = [{'name': get_my_hostname(), 'ips': [self.domain]}]
            print(f"{Colors.CYAN}    Local laptop target detected: {self.domain}{Colors.RESET}\n")
            return self.subdomains
        except OSError:
            pass

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

        # Check HTTP Security Headers on open web ports
        try:
            res = requests.get(f"http://{self.domain}", timeout=3)
            headers = res.headers
            missing_headers = []
            for h in ['Strict-Transport-Security', 'Content-Security-Policy', 'X-Frame-Options', 'X-Content-Type-Options']:
                if h not in headers:
                    missing_headers.append(h)
            if missing_headers:
                self.vulnerabilities.append({
                    'title': 'Missing HTTP Security Headers',
                    'missing': missing_headers
                })
        except Exception:
            pass

        self.ssl_results = ssl_results
        print(f"\n{Colors.GREEN}✔ SSL & Header analysis complete! Analyzed {Colors.WHITE}{len(ssl_results)}{Colors.GREEN} hosts{Colors.RESET}\n")
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
        envelope.set_extension_info(self.extension_id, "1.0.0")
        
        open_ports_list = [p.get('port') for p in self.open_ports if isinstance(p, dict) and 'port' in p]
        open_services_list = [f"{p.get('port')}/{p.get('service', 'unknown')}" for p in self.open_ports if isinstance(p, dict)]
        
        severity = "high" if (open_ports_list or self.cloud_buckets) else "medium" if self.subdomains else "low"
        
        envelope.severity = severity
        envelope.category = self.extension_id
        envelope.title = "Attack Surface Open Ports & Exposure Finding"
        envelope.summary = f"Scanned host {self.domain}. Discovered {len(self.open_ports)} open ports ({', '.join(open_services_list)}) and {len(self.cloud_buckets)} exposed storage buckets."
        
        envelope.resource = {
            "type": "host",
            "id": self.domain,
            "name": get_my_hostname()
        }
        
        envelope.evidence = [
            f"Open ports: {', '.join(open_services_list) if open_services_list else 'None'}",
            f"Exposed cloud buckets: {len(self.cloud_buckets)}"
        ]
        
        envelope.indicators = [f"open_port:{p}" for p in open_ports_list]
        envelope.baseline = {"max_allowed_open_ports": 0, "exposed_buckets_allowed": 0}
        
        envelope.recommended_actions = [
            "Restrict open ports to authorized IP ranges using firewall rules",
            "Close unused background services running on non-standard ports",
            "Verify cloud storage permissions to ensure no public read access"
        ]
        
        envelope.details = {
            "target": self.domain,
            "target_hostname": get_my_hostname(),
            "scan_timestamp": self.start_time.isoformat() + "Z",
            "execution_metrics": {
                "threads": self.threads,
                "timeout_seconds": self.timeout,
                "duration_seconds": round((datetime.now() - self.start_time).total_seconds(), 3)
            },
            "subdomain_enumeration": {
                "subdomains_count": len(self.subdomains),
                "discovered_subdomains": self.subdomains,
                "tested_wordlist_size": len(self.common_subdomains),
                "tested_subdomains_sample": self.common_subdomains[:15]
            },
            "port_scanner": {
                "open_ports_count": len(self.open_ports),
                "open_ports": open_services_list,
                "open_port_records": self.open_ports,
                "scanned_ports_total": len(self.ports),
                "scanned_ports_list": self.ports
            },
            "ssl_analysis": {
                "analyzed_endpoints_count": len(self.ssl_results),
                "ssl_results": self.ssl_results
            },
            "cloud_storage": {
                "exposed_buckets_count": len(self.cloud_buckets),
                "cloud_buckets": self.cloud_buckets
            },
            "netstat_snapshot": self.netstat_snapshot,
            "manifest": self.manifest or {},
            "escalation_route": get_escalation_route(severity),
            "risk_assessment": {
                "risk_level": "HIGH" if severity == "high" else "MEDIUM" if severity == "medium" else "LOW",
                "severity": severity,
                "open_ports_risk": len(open_ports_list) > 0,
                "cloud_exposure_risk": len(self.cloud_buckets) > 0
            }
        }
        
        return envelope
    
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
        
        envelope = self.generate_finding_envelope('attack_surface_scan', {}, self.domain)
        filename = self.save_finding(envelope)
        findings = [filename]
        print(f"{Colors.GREEN}✔ Report saved: {Colors.WHITE}{filename}{Colors.RESET}")
        print(f"\n{Colors.GREEN}✅ {len(findings)} finding envelope saved to reports/ directory{Colors.RESET}")
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
        self.netstat_snapshot = get_netstat_snapshot()
        
        findings = self.generate_report()
        return findings


def main():
    parser = argparse.ArgumentParser(description='Attack Surface Scanner - 4 Tools in 1')
    parser.add_argument('-t', '--threads', type=int, default=100, help='Number of threads')
    parser.add_argument('-T', '--timeout', type=int, default=5, help='Timeout in seconds')
    
    args = parser.parse_args()
    
    print_laptop_info()
    scanner = AttackSurfaceScanner(get_my_ip(), args.threads, args.timeout)
    scanner.run()


if __name__ == '__main__':
    main()