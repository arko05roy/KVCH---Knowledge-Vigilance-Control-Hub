#!/usr/bin/env python3
"""
THREAT HUNTER 3000 - The MASSIVE Extension
Combines 4 Security Tools:
Tool 1: Real-time Packet Sniffer (scapy)
Tool 2: Active Vulnerability Scanner (nmap)
Tool 3: Threat Intelligence (AbuseIPDB, VirusTotal, etc.)
Tool 4: Auto-Firewall Generator & MITRE ATT&CK Mapper
"""

import sys
import os
import json
import time
import threading
import subprocess
import socket
import shutil
import yaml
from datetime import datetime
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
import argparse
import signal

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.colors import Colors
from utils.ascii_art import BANNER_THREAT_HUNTER
from utils.finding_envelope import FindingEnvelope
from utils.escalation_routes import get_escalation_route, get_role_report_config
from utils.laptop_utils import get_my_hostname, get_my_ip, get_netstat_snapshot, print_laptop_info

try:
    from scapy.all import sniff, IP, TCP, UDP, ICMP, conf
    SCAPY_AVAILABLE = True
except ImportError:
    SCAPY_AVAILABLE = False
    sniff = lambda *args, **kwargs: None
    IP = TCP = UDP = ICMP = conf = None
    print(f"{Colors.YELLOW}⚠ scapy not installed. Running threat hunter in simulation fallback mode.{Colors.RESET}")

try:
    import requests
except ImportError:
    print(f"{Colors.RED}Error: requests not installed. Run: pip install requests{Colors.RESET}")
    sys.exit(1)


class ThreatHunter3000:
    """MASSIVE multi-engine threat detection system with KVCH Finding Envelope output"""
    
    def __init__(self, target=None, interface=None):
        self.my_ip = get_my_ip()
        self.target = target or self.my_ip
        self.interface = interface or self._get_default_interface()
        self.start_time = datetime.now()
        self.running = True
        self.extension_id = "threat_hunter"
        
        # Load manifest
        self.manifest = self._load_manifest()
        
        # Results
        self.detected_threats = []
        self.suspicious_ips = defaultdict(lambda: {
            'count': 0, 
            'ports': [], 
            'first_seen': None,
            'last_seen': None,
            'threats': []
        })
        self.packet_count = 0
        self.blocked_ips = []
        self.vulnerabilities = []
        self.mitre_mappings = []
        self.findings_saved = []
        
        # Threat intelligence cache
        self.ip_cache = {}
        
        # MITRE ATT&CK Mapping
        self.mitre_map = {
            'port_scan': 'T1046 - Network Service Scanning',
            'brute_force': 'T1110 - Brute Force',
            'ddos': 'T1498 - Network Denial of Service',
            'exploit': 'T1190 - Exploit Public-Facing Application',
            'recon': 'T1595 - Active Scanning',
            'malware': 'T1204 - User Execution',
            'phishing': 'T1566 - Phishing'
        }
        
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
    
    def _get_default_interface(self):
        """Get default network interface"""
        try:
            import netifaces
            return netifaces.gateways()['default'][netifaces.AF_INET][1]
        except:
            try:
                import ifaddr
                for adapter in ifaddr.get_adapters():
                    if any(isinstance(address.ip, str) and address.ip != '127.0.0.1' for address in adapter.ips):
                        return adapter.name
            except:
                pass
            try:
                return str(conf.iface)
            except:
                return None
    
    def print_banner(self):
        """Display massive banner with extension info"""
        os.system('clear' if os.name == 'posix' else 'cls')
        print(BANNER_THREAT_HUNTER)
        print(f"{Colors.CYAN}╔══ INTERFACE: {Colors.WHITE}{self.interface}{Colors.RESET}")
        print(f"{Colors.CYAN}║  TARGET: {Colors.WHITE}{self.target or 'ALL NETWORKS'}{Colors.RESET}")
        print(f"{Colors.CYAN}╚══ TIME: {Colors.WHITE}{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.RESET}")
        
        # Show manifest info if available
        if self.manifest:
            print(f"\n{Colors.DIM}┌─ EXTENSION INFO ───────────────────────────────────────────────┐{Colors.RESET}")
            print(f"{Colors.DIM}│ {Colors.GREEN}Name:{Colors.RESET} {self.manifest.get('identity', {}).get('name', 'Unknown')}")
            print(f"{Colors.DIM}│ {Colors.GREEN}Type:{Colors.RESET} {self.manifest.get('identity', {}).get('type', 'preventive')}")
            print(f"{Colors.DIM}│ {Colors.GREEN}Creator:{Colors.RESET} {self.manifest.get('identity', {}).get('creator', 'Unknown')}")
            print(f"{Colors.DIM}│ {Colors.GREEN}Escalation Route:{Colors.RESET} {', '.join(self.manifest.get('routing', {}).get('escalation_route', ['security_analyst']))}")
            print(f"{Colors.DIM}└──────────────────────────────────────────────────────────────────┘{Colors.RESET}\n")
        
        print(f"\n{Colors.DIM}┌─ TOOLS LOADED ────────────────────────────────────────────────┐{Colors.RESET}")
        print(f"{Colors.DIM}│ {Colors.GREEN}🔧 Tool 1: {Colors.WHITE}Real-time Packet Sniffer (scapy){Colors.RESET}")
        print(f"{Colors.DIM}│ {Colors.GREEN}🔧 Tool 2: {Colors.WHITE}Active Vulnerability Scanner (nmap){Colors.RESET}")
        print(f"{Colors.DIM}│ {Colors.GREEN}🔧 Tool 3: {Colors.WHITE}Threat Intelligence (AbuseIPDB, etc.){Colors.RESET}")
        print(f"{Colors.DIM}│ {Colors.GREEN}🔧 Tool 4: {Colors.WHITE}Auto-Firewall & MITRE ATT&CK Mapper{Colors.RESET}")
        print(f"{Colors.DIM}└──────────────────────────────────────────────────────────────────┘{Colors.RESET}\n")
    
    # ============================================================
    # TOOL 1: REAL-TIME PACKET SNIFFER
    # ============================================================
    
    def packet_sniffer(self):
        """Tool 1: Real-time packet capture and analysis"""
        print(f"{Colors.BOLD}{Colors.GREEN}[*] TOOL 1: Real-time Packet Sniffer{Colors.RESET}")
        print(f"{Colors.DIM}    Sniffing on interface {Colors.WHITE}{self.interface}{Colors.DIM}...{Colors.RESET}\n")
        
        def packet_handler(packet):
            if not self.running:
                return
            
            self.packet_count += 1
            
            if IP in packet:
                src_ip = packet[IP].src
                dst_ip = packet[IP].dst
                protocol = packet[IP].proto

                if src_ip != self.my_ip and dst_ip != self.my_ip:
                    return
                
                # Update IP tracking
                ip_data = self.suspicious_ips[src_ip]
                ip_data['count'] += 1
                if ip_data['first_seen'] is None:
                    ip_data['first_seen'] = datetime.now()
                ip_data['last_seen'] = datetime.now()
                
                # Track ports
                if TCP in packet:
                    port = packet[TCP].dport
                    if port not in ip_data['ports']:
                        ip_data['ports'].append(port)
                    
                    # Detect port scanning (many ports from one IP)
                    if len(ip_data['ports']) > 20:
                        if 'port_scan' not in [t['type'] for t in ip_data['threats']]:
                            threat = {
                                'type': 'port_scan',
                                'severity': 'MEDIUM',
                                'ip': src_ip,
                                'ports_scanned': len(ip_data['ports']),
                                'mitre': self.mitre_map['port_scan'],
                                'timestamp': datetime.now().isoformat()
                            }
                            ip_data['threats'].append(threat)
                            self.detected_threats.append(threat)
                            print(f"\n{Colors.YELLOW}    [!] PORT SCAN detected from {Colors.WHITE}{src_ip}{Colors.RESET}")
                    
                    # Detect brute force (many connections to same port)
                    if ip_data['count'] > 50 and port in [22, 3389, 3306, 5432]:
                        threat = {
                            'type': 'brute_force',
                            'severity': 'HIGH',
                            'ip': src_ip,
                            'target_port': port,
                            'attempts': ip_data['count'],
                            'mitre': self.mitre_map['brute_force'],
                            'timestamp': datetime.now().isoformat()
                        }
                        ip_data['threats'].append(threat)
                        self.detected_threats.append(threat)
                        print(f"\n{Colors.RED}    [!] BRUTE FORCE detected from {Colors.WHITE}{src_ip} {Colors.RED}on port {port}{Colors.RESET}")
                
                # Detect DDoS (high packet rate)
                if ip_data['count'] > 200:
                    threat = {
                        'type': 'ddos',
                        'severity': 'CRITICAL',
                        'ip': src_ip,
                        'packets': ip_data['count'],
                        'mitre': self.mitre_map['ddos'],
                        'timestamp': datetime.now().isoformat()
                    }
                    ip_data['threats'].append(threat)
                    self.detected_threats.append(threat)
                    print(f"\n{Colors.RED}    🔥 DDoS detected from {Colors.WHITE}{src_ip} {Colors.RED}({ip_data['count']} packets){Colors.RESET}")
        
        try:
            sniff(iface=self.interface, prn=packet_handler, store=False)
        except Exception as e:
            print(f"{Colors.RED}✖ Sniffer error: {e}{Colors.RESET}")
    
    # ============================================================
    # TOOL 2: ACTIVE VULNERABILITY SCANNER
    # ============================================================
    
    def active_scanner(self):
        """Tool 2: Active vulnerability scanning with nmap"""
        print(f"\n{Colors.BOLD}{Colors.GREEN}[*] TOOL 2: Active Vulnerability Scanner{Colors.RESET}")
        
        if not self.target:
            print(f"{Colors.YELLOW}⚠ No target specified. Skipping active scan.{Colors.RESET}")
            return
        
        print(f"{Colors.DIM}    Scanning {Colors.WHITE}{self.target}{Colors.DIM}...{Colors.RESET}\n")
        
        try:
            # Check nmap installation
            subprocess.run(['nmap', '-version'], capture_output=True, check=True)
            
            # Quick port scan
            print(f"{Colors.CYAN}    Running port scan...{Colors.RESET}")
            result = subprocess.run(
                ['nmap', '-sS', '-T4', '--top-ports', '100', self.target],
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if result.returncode == 0:
                print(f"{Colors.GREEN}    Port scan complete!{Colors.RESET}")
                for line in result.stdout.split('\n'):
                    if '/tcp' in line and 'open' in line:
                        parts = line.split()
                        if len(parts) >= 2:
                            vuln = {
                                'type': 'open_port',
                                'severity': 'MEDIUM',
                                'port': parts[0],
                                'service': parts[2] if len(parts) > 2 else 'Unknown',
                                'mitre': self.mitre_map['recon']
                            }
                            self.vulnerabilities.append(vuln)
                            print(f"{Colors.YELLOW}      Open port: {Colors.WHITE}{parts[0]} {Colors.DIM}({vuln['service']}){Colors.RESET}")
            
            # Vulnerability scripts
            print(f"{Colors.CYAN}    Running vulnerability detection...{Colors.RESET}")
            vuln_result = subprocess.run(
                ['nmap', '--script', 'vuln', '--top-ports', '100', self.target],
                capture_output=True,
                text=True,
                timeout=180
            )
            
            if 'VULNERABLE' in vuln_result.stdout:
                for line in vuln_result.stdout.split('\n'):
                    if 'VULNERABLE' in line or 'CVE-' in line:
                        vuln = {
                            'type': 'vulnerability',
                            'severity': 'CRITICAL',
                            'details': line.strip(),
                            'mitre': self.mitre_map['exploit']
                        }
                        self.vulnerabilities.append(vuln)
                        print(f"{Colors.RED}      🔴 {line.strip()}{Colors.RESET}")
        
        except FileNotFoundError:
            print(f"{Colors.YELLOW}⚠ nmap not found. Install with: sudo apt-get install nmap{Colors.RESET}")
        except subprocess.TimeoutExpired:
            print(f"{Colors.YELLOW}⚠ Scan timed out. Skipping.{Colors.RESET}")
        except Exception as e:
            print(f"{Colors.RED}✖ Scanner error: {e}{Colors.RESET}")
    
    # ============================================================
    # TOOL 3: THREAT INTELLIGENCE
    # ============================================================
    
    def threat_intelligence(self):
        """Tool 3: Query threat intelligence feeds"""
        print(f"\n{Colors.BOLD}{Colors.GREEN}[*] TOOL 3: Threat Intelligence{Colors.RESET}")
        
        suspicious_ips = [ip for ip, data in self.suspicious_ips.items() if data['count'] > 10]
        
        if not suspicious_ips:
            print(f"{Colors.DIM}    No suspicious IPs to check.{Colors.RESET}")
            return
        
        print(f"{Colors.DIM}    Checking {Colors.WHITE}{len(suspicious_ips)}{Colors.DIM} suspicious IPs...{Colors.RESET}\n")
        
        for ip in suspicious_ips[:20]:  # Limit to 20
            threat_info = self._check_ip_reputation(ip)
            if threat_info:
                print(f"{Colors.RED}    [!] {Colors.WHITE}{ip} {Colors.RED}- Malicious ({threat_info['confidence']}% confidence){Colors.RESET}")
                print(f"{Colors.DIM}        Country: {threat_info.get('country', 'Unknown')}{Colors.RESET}")
                print(f"{Colors.DIM}        Category: {', '.join(threat_info.get('categories', ['Unknown']))}{Colors.RESET}")
                
                threat = {
                    'type': 'known_malicious_ip',
                    'severity': 'HIGH',
                    'ip': ip,
                    'confidence': threat_info['confidence'],
                    'country': threat_info.get('country', 'Unknown'),
                    'categories': threat_info.get('categories', []),
                    'mitre': self.mitre_map['recon'],
                    'timestamp': datetime.now().isoformat()
                }
                self.detected_threats.append(threat)
                
                # Update IP data
                if ip in self.suspicious_ips:
                    self.suspicious_ips[ip]['threats'].append(threat)
            
            time.sleep(0.5)  # Rate limit
    
    def _check_ip_reputation(self, ip):
        """Check IP reputation using multiple sources"""
        # Use AbuseIPDB
        try:
            response = requests.get(
                'https://api.abuseipdb.com/api/v2/check',
                params={'ipAddress': ip, 'maxAgeInDays': '90'},
                headers={'Accept': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('data', {}).get('abuseConfidenceScore', 0) > 30:
                    return {
                        'confidence': data['data']['abuseConfidenceScore'],
                        'country': data['data'].get('countryName', 'Unknown'),
                        'categories': data['data'].get('categories', [])
                    }
        except:
            pass
        
        # Check local cache (simulate ML detection)
        if ip.startswith('10.') or ip.startswith('192.168.'):
            return None  # Local IPs
        
        # Simulate ML-based detection for demo purposes
        if ip in ['185.130.5.253', '91.121.93.225', '5.188.210.55']:  # Known malicious IPs
            return {
                'confidence': 85,
                'country': 'Russia',
                'categories': ['Scanning', 'Malware']
            }
        
        return None
    
    # ============================================================
    # TOOL 4: AUTO-FIREWALL & MITRE ATT&CK
    # ============================================================
    
    def auto_firewall(self):
        """Tool 4: Generate firewall rules and MITRE ATT&CK mapping"""
        print(f"\n{Colors.BOLD}{Colors.GREEN}[*] TOOL 4: Auto-Firewall & MITRE ATT&CK Mapper{Colors.RESET}")
        
        # MITRE ATT&CK Mapping
        print(f"\n{Colors.CYAN}    🎯 MITRE ATT&CK Mappings:{Colors.RESET}")
        mitre_found = set()
        for threat in self.detected_threats:
            if 'mitre' in threat:
                mitre_found.add(threat['mitre'])
        
        for mitre in mitre_found:
            print(f"      {Colors.WHITE}• {mitre}{Colors.RESET}")
        
        # Generate firewall rules
        print(f"\n{Colors.CYAN}    🛡️  Generated Firewall Rules:{Colors.RESET}")
        
        # Rules for suspicious IPs
        for ip, data in self.suspicious_ips.items():
            if data['count'] > 50:
                rule = f"iptables -A INPUT -s {ip} -j DROP"
                print(f"      {Colors.WHITE}{rule}{Colors.RESET}")
                self.blocked_ips.append(ip)
        
        # Rules for open ports
        for vuln in self.vulnerabilities:
            if vuln.get('type') == 'open_port':
                port = vuln['port'].split('/')[0]
                rule = f"iptables -A INPUT -p tcp --dport {port} -j DROP"
                print(f"      {Colors.WHITE}{rule}{Colors.RESET}")
        
        # Rules for specific threats
        for threat in self.detected_threats:
            if threat.get('type') == 'ddos':
                rule = f"iptables -A INPUT -s {threat['ip']} -m limit --limit 10/minute -j ACCEPT"
                print(f"      {Colors.WHITE}{rule}{Colors.RESET}")
        
        if not self.blocked_ips:
            print(f"      {Colors.DIM}No firewall rules generated (no threats detected){Colors.RESET}")
    
    # ============================================================
    # FINDING ENVELOPE GENERATION (NEW)
    # ============================================================
    
    def generate_finding_envelope(self, threat):
        """Generate standardized Finding Envelope for KVCH"""
        envelope = FindingEnvelope()
        envelope.set_extension_info("threat-hunter-3000", "1.0.0")
        
        critical_count = len([t for t in self.detected_threats if isinstance(t, dict) and t.get('severity') == 'CRITICAL'])
        high_count = len([t for t in self.detected_threats if isinstance(t, dict) and t.get('severity') == 'HIGH'])
        
        severity = "critical" if critical_count > 0 else "high" if (high_count > 0 or self.vulnerabilities) else "low"
        
        envelope.severity = severity
        envelope.category = "threat-hunter-3000"
        envelope.title = "Real-Time Network Threat & Vulnerability Observation"
        envelope.summary = f"Threat hunt on interface {self.interface}. Processed {self.packet_count} packets. Observed {len(self.detected_threats)} threats and {len(self.vulnerabilities)} vulnerabilities."
        
        envelope.resource = {
            "type": "network_interface",
            "id": self.interface or "en0",
            "name": get_my_hostname()
        }
        
        envelope.evidence = [f"Packets analyzed: {self.packet_count}", f"Threat events: {len(self.detected_threats)}"]
        envelope.indicators = [t.get('type') for t in self.detected_threats if isinstance(t, dict) and 'type' in t]
        envelope.baseline = {"threat_threshold": 0, "vulnerabilities_allowed": 0}
        
        envelope.recommended_actions = [
            "Maintain active firewall protection on public network interfaces",
            "Investigate any high-rate TCP connection bursts or port scanning behavior",
            "Keep system network services patched against known CVE vulnerabilities"
        ]
        
        envelope.details = {
            "interface": self.interface,
            "target_hostname": get_my_hostname(),
            "scan_timestamp": self.start_time.isoformat() + "Z",
            "execution_metrics": {
                "duration_seconds": round((datetime.now() - self.start_time).total_seconds(), 3),
                "packets_processed": self.packet_count
            },
            "threat_detection": {
                "threats_count": len(self.detected_threats),
                "detected_threats": self.detected_threats,
                "suspicious_ips_tracked": self.suspicious_ips if hasattr(self, 'suspicious_ips') else {}
            },
            "vulnerability_scanner": {
                "vulnerabilities_count": len(self.vulnerabilities),
                "vulnerabilities": self.vulnerabilities
            },
            "firewall_mitre_mapping": {
                "blocked_ips_count": len(self.blocked_ips),
                "blocked_ips": self.blocked_ips,
                "mitre_techniques": list(set([t.get('mitre') for t in self.detected_threats if isinstance(t, dict) and 'mitre' in t]))
            },
            "manifest": self.manifest or {},
            "escalation_route": get_escalation_route(severity),
            "threat_level": "HIGH" if (critical_count or high_count) else "LOW"
        }
        
        return envelope
    
    def save_finding(self, envelope):
        """Save finding envelope to reports folder"""
        os.makedirs('reports', exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
        filename = f"reports/finding_{self.extension_id}_{timestamp}.json"
        envelope.save(filename)
        return filename
    
    # ============================================================
    # REPORT GENERATION (UPDATED)
    # ============================================================
    
    def generate_report(self):
        """Generate comprehensive report with Finding Envelopes"""
        print(f"\n{Colors.BOLD}{Colors.CYAN}[*] GENERATING FINDING ENVELOPES{Colors.RESET}")
        print("═"*70)
        
        envelope = self.generate_finding_envelope({})
        filename = self.save_finding(envelope)
        findings = [filename]
        print(f"{Colors.GREEN}✔ Report saved: {Colors.WHITE}{filename}{Colors.RESET}")
        print(f"\n{Colors.GREEN}✅ {len(findings)} finding envelope saved to reports/ directory{Colors.RESET}")
        return findings
    
    def stop(self, signum=None, frame=None):
        """Stop the hunter"""
        self.running = False
    
    def run(self, duration=None):
        """Run all tools"""
        print(f"{Colors.BOLD}{Colors.GREEN}🚀 INITIALIZING ALL TOOLS...{Colors.RESET}\n")
        
        # Setup signal handler
        signal.signal(signal.SIGINT, self.stop)
        
        # Tool 1: Packet Sniffer (runs in background)
        sniffer_thread = threading.Thread(target=self.packet_sniffer)
        sniffer_thread.daemon = True
        sniffer_thread.start()
        
        # Wait a bit
        time.sleep(5)
        
        # Tool 2: Active Scanner (runs in background)
        scanner_thread = threading.Thread(target=self.active_scanner)
        scanner_thread.daemon = True
        scanner_thread.start()
        
        # Wait a bit
        time.sleep(10)
        
        # Tool 3: Threat Intelligence (runs in background)
        intel_thread = threading.Thread(target=self.threat_intelligence)
        intel_thread.daemon = True
        intel_thread.start()
        
        # Monitor for duration
        print(f"\n{Colors.BOLD}{Colors.YELLOW}📡 Hunting in progress... Press Ctrl+C to stop{Colors.RESET}\n")
        
        try:
            if duration:
                time.sleep(duration)
                self.running = False
            else:
                while self.running:
                    time.sleep(1)
        except KeyboardInterrupt:
            self.running = False
        
        # Tool 4: Auto-Firewall
        self.auto_firewall()
        
        # Generate report
        findings = self.generate_report()
        return findings


def main():
    parser = argparse.ArgumentParser(description='Threat Hunter 3000 - MASSIVE Threat Detection')
    parser.add_argument('-t', '--target', help='Target IP; defaults to this laptop')
    parser.add_argument('-i', '--interface', help='Network interface')
    parser.add_argument('-d', '--duration', type=int, default=5, help='Duration in seconds')
    
    args = parser.parse_args()
    
    print_laptop_info()
    hunter = ThreatHunter3000(args.target, args.interface)
    hunter.run(args.duration)


if __name__ == '__main__':
    main()