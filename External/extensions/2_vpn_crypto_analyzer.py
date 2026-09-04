#!/usr/bin/env python3
"""
VPN CRYPTO ANALYZER - Combines 3 Security Tools
Tool 1: PCAP Parser & IKE Extractor (wireshark style)
Tool 2: Crypto Strength Analyzer (sslscan style)
Tool 3: Traffic Classifier (packet metadata analysis)
"""

import sys
import os
import json
import time
import yaml
import shutil
from datetime import datetime
import argparse

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.colors import Colors
from utils.ascii_art import BANNER_VPN_ANALYZER
from utils.finding_envelope import FindingEnvelope
from utils.escalation_routes import get_escalation_route, get_role_report_config

try:
    import pyshark
except ImportError:
    print(f"{Colors.RED}Error: pyshark not installed. Run: pip install pyshark{Colors.RESET}")
    sys.exit(1)


class VPNAnalyzer:
    """Massive VPN analyzer combining 3 tools with KVCH Finding Envelope output"""
    
    def __init__(self, pcap_file):
        self.pcap_file = pcap_file
        self.start_time = datetime.now()
        self.extension_id = "vpn_crypto_analyzer"
        
        # Load manifest
        self.manifest = self._load_manifest()
        
        # Results
        self.ike_exchanges = []
        self.security_associations = []
        self.traffic_classes = []
        self.traffic_observations = []
        self.weaknesses = []
        self.recommendations = []
        
        # Security scoring
        self.security_score = 100
        
        # Crypto profiles
        self.weak_ciphers = ['DES', '3DES', 'RC4', 'MD5']
        self.weak_dh_groups = ['1', '2', '5']
        self.strong_ciphers = ['AES-256-GCM', 'AES-128-GCM', 'ChaCha20-Poly1305']
        
        self.print_banner()
    
    def _load_manifest(self):
        """Load extension manifest from manifests folder"""
        manifest_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            'manifests',
            'vpn_analyzer.yaml'
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
        print(BANNER_VPN_ANALYZER)
        print(f"{Colors.CYAN}╔══ PCAP FILE: {Colors.WHITE}{self.pcap_file}{Colors.RESET}")
        print(f"{Colors.CYAN}╚══ TIME: {Colors.WHITE}{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.RESET}")
        
        # Show manifest info if available
        if self.manifest:
            print(f"\n{Colors.DIM}┌─ EXTENSION INFO ───────────────────────────────────────────────┐{Colors.RESET}")
            print(f"{Colors.DIM}│ {Colors.GREEN}Name:{Colors.RESET} {self.manifest.get('identity', {}).get('name', 'Unknown')}")
            print(f"{Colors.DIM}│ {Colors.GREEN}Type:{Colors.RESET} {self.manifest.get('identity', {}).get('type', 'report')}")
            print(f"{Colors.DIM}│ {Colors.GREEN}Creator:{Colors.RESET} {self.manifest.get('identity', {}).get('creator', 'Unknown')}")
            print(f"{Colors.DIM}│ {Colors.GREEN}Escalation Route:{Colors.RESET} {', '.join(self.manifest.get('routing', {}).get('escalation_route', ['network_engineer']))}")
            print(f"{Colors.DIM}└──────────────────────────────────────────────────────────────────┘{Colors.RESET}\n")
        
        print(f"\n{Colors.DIM}┌─ TOOLS LOADED ────────────────────────────────────────────────┐{Colors.RESET}")
        print(f"{Colors.DIM}│ {Colors.GREEN}🔧 Tool 1: {Colors.WHITE}PCAP Parser & IKE Extractor{Colors.RESET}")
        print(f"{Colors.DIM}│ {Colors.GREEN}🔧 Tool 2: {Colors.WHITE}Crypto Strength Analyzer{Colors.RESET}")
        print(f"{Colors.DIM}│ {Colors.GREEN}🔧 Tool 3: {Colors.WHITE}Traffic Classifier (packet evidence){Colors.RESET}")
        print(f"{Colors.DIM}└──────────────────────────────────────────────────────────────────┘{Colors.RESET}\n")
    
    # ============================================================
    # TOOL 1: PCAP PARSER & IKE EXTRACTOR
    # ============================================================
    
    def parse_pcap(self):
        """Tool 1: Parse PCAP and extract IKE data"""
        print(f"{Colors.BOLD}{Colors.YELLOW}[*] TOOL 1: PCAP Parser & IKE Extractor{Colors.RESET}")
        print(f"{Colors.DIM}    Reading PCAP file...{Colors.RESET}\n")

        if shutil.which('tshark') is None:
            print(f"{Colors.YELLOW}⚠ tshark is not installed. Skipping PCAP parsing.{Colors.RESET}")
            return
        
        try:
            cap = pyshark.FileCapture(self.pcap_file)
        except Exception as e:
            print(f"{Colors.RED}✖ Error reading PCAP: {e}{Colors.RESET}")
            return
        
        packet_count = 0
        ike_count = 0
        
        for packet in cap:
            packet_count += 1
            if packet_count % 100 == 0:
                print(f"\r{Colors.CYAN}    Processing packets: {Colors.WHITE}{packet_count}{Colors.RESET}", end='')
            
            try:
                observation = self._extract_traffic_observation(packet)
                if observation:
                    self.traffic_observations.append(observation)

                if hasattr(packet, 'isakmp') or hasattr(packet, 'ike'):
                    ike_count += 1
                    ike_data = self._extract_ike_data(packet)
                    if ike_data:
                        self.ike_exchanges.append(ike_data)
                        print(f"\n{Colors.GREEN}    [+] IKE Exchange #{ike_count}: {Colors.WHITE}{ike_data.get('exchange_type', 'Unknown')}{Colors.RESET}")
            except:
                continue
        
        cap.close()
        print(f"\n\n{Colors.GREEN}✔ PCAP parsing complete!{Colors.RESET}")
        print(f"{Colors.DIM}    Total packets: {Colors.WHITE}{packet_count}{Colors.RESET}")
        print(f"{Colors.DIM}    IKE exchanges: {Colors.WHITE}{ike_count}{Colors.RESET}\n")
    
    def _extract_ike_data(self, packet):
        """Extract IKE data from packet"""
        ike_data = {}
        
        try:
            ike_layer = getattr(packet, 'ike', None) or getattr(packet, 'isakmp', None)
            if ike_layer is None:
                return None
            if hasattr(ike_layer, 'version'):
                ike_data['version'] = ike_layer.version
            if hasattr(ike_layer, 'exchange_type'):
                ike_data['exchange_type'] = ike_layer.exchange_type
            if hasattr(ike_layer, 'encryption_algorithm'):
                ike_data['encryption'] = ike_layer.encryption_algorithm
            if hasattr(ike_layer, 'prf_algorithm'):
                ike_data['prf'] = ike_layer.prf_algorithm
            if hasattr(ike_layer, 'dh_group'):
                ike_data['dh_group'] = ike_layer.dh_group
            if hasattr(ike_layer, 'sa_lifetime'):
                ike_data['sa_lifetime'] = ike_layer.sa_lifetime
            
            # Extract source/dest
            if hasattr(packet, 'ip'):
                ike_data['src_ip'] = packet.ip.src
                ike_data['dst_ip'] = packet.ip.dst
            
        except:
            pass
        
        return ike_data if ike_data else None

    def _extract_traffic_observation(self, packet):
        """Extract observed network metadata from one captured packet."""
        observation = {'protocol': str(getattr(packet, 'highest_layer', 'UNKNOWN'))}

        for network_layer in ('ip', 'ipv6'):
            layer = getattr(packet, network_layer, None)
            if layer:
                observation['src_ip'] = getattr(layer, 'src', None)
                observation['dst_ip'] = getattr(layer, 'dst', None)
                break

        for transport_layer in ('tcp', 'udp', 'sctp'):
            layer = getattr(packet, transport_layer, None)
            if layer:
                observation['protocol'] = transport_layer.upper()
                observation['src_port'] = int(getattr(layer, 'srcport', 0))
                observation['dst_port'] = int(getattr(layer, 'dstport', 0))
                break

        if hasattr(packet, 'length'):
            observation['length'] = int(packet.length)

        return observation if 'src_port' in observation or observation.get('src_ip') else None
    
    # ============================================================
    # TOOL 2: CRYPTO STRENGTH ANALYZER
    # ============================================================
    
    def analyze_crypto(self):
        """Tool 2: Analyze cryptographic strength"""
        print(f"{Colors.BOLD}{Colors.YELLOW}[*] TOOL 2: Crypto Strength Analyzer{Colors.RESET}")
        print(f"{Colors.DIM}    Analyzing cryptographic configurations...{Colors.RESET}\n")
        
        if not self.ike_exchanges:
            print(f"{Colors.YELLOW}⚠ No IKE exchanges found. Skipping crypto analysis.{Colors.RESET}")
            return
        
        for i, exchange in enumerate(self.ike_exchanges):
            print(f"{Colors.CYAN}    Analyzing Exchange #{i+1}{Colors.RESET}")
            
            encryption = exchange.get('encryption', 'Unknown')
            dh_group = exchange.get('dh_group', 'Unknown')
            prf = exchange.get('prf', 'Unknown')
            
            # Check encryption
            if encryption in self.weak_ciphers:
                self.weaknesses.append({
                    'type': 'WEAK_ENCRYPTION',
                    'algorithm': encryption,
                    'severity': 'HIGH',
                    'recommendation': f'Replace {encryption} with AES-256-GCM or ChaCha20-Poly1305'
                })
                self.security_score -= 20
                print(f"{Colors.RED}    [!] WEAK ENCRYPTION: {encryption}{Colors.RESET}")
            elif encryption in self.strong_ciphers:
                print(f"{Colors.GREEN}    [✓] Strong encryption: {encryption}{Colors.RESET}")
            else:
                print(f"{Colors.YELLOW}    [~] Unknown encryption: {encryption}{Colors.RESET}")
            
            # Check DH group
            if str(dh_group) in self.weak_dh_groups:
                self.weaknesses.append({
                    'type': 'WEAK_DH_GROUP',
                    'group': dh_group,
                    'severity': 'HIGH',
                    'recommendation': 'Use DH group 14 (2048-bit) or higher, or ECDH'
                })
                self.security_score -= 15
                print(f"{Colors.RED}    [!] WEAK DH GROUP: {dh_group}{Colors.RESET}")
            elif str(dh_group) == '14' or str(dh_group) == '15' or str(dh_group) == '16':
                print(f"{Colors.GREEN}    [✓] Strong DH group: {dh_group}{Colors.RESET}")
            else:
                print(f"{Colors.YELLOW}    [~] Unknown DH group: {dh_group}{Colors.RESET}")
            
            # Check PRF
            if 'MD5' in str(prf):
                self.weaknesses.append({
                    'type': 'WEAK_PRF',
                    'prf': prf,
                    'severity': 'MEDIUM',
                    'recommendation': f'Replace {prf} with SHA-256 or SHA-384'
                })
                self.security_score -= 10
                print(f"{Colors.RED}    [!] WEAK PRF: {prf}{Colors.RESET}")
        
        print(f"\n{Colors.GREEN}✔ Crypto analysis complete! Security score: {Colors.WHITE}{self.security_score}/100{Colors.RESET}\n")
    
    # ============================================================
    # TOOL 3: TRAFFIC CLASSIFIER
    # ============================================================
    
    def classify_traffic(self):
        """Tool 3: Classify traffic from observed packet metadata"""
        print(f"{Colors.BOLD}{Colors.YELLOW}[*] TOOL 3: Traffic Classifier{Colors.RESET}")
        print(f"{Colors.DIM}    Analyzing traffic patterns...{Colors.RESET}\n")
        
        traffic_types = {
            'VOIP': [5060, 5061],
            'WEB': [80, 443, 8080, 8443],
            'FILE_TRANSFER': [20, 21, 22],
            'VIDEO_STREAMING': [1935, 554],
            'EMAIL': [25, 110, 143, 465, 587, 993, 995],
        }
        observed_ports = [
            port for observation in self.traffic_observations
            for port in (observation.get('src_port'), observation.get('dst_port'))
            if port
        ]
        total_packets = len(self.traffic_observations)

        for traffic_type, candidate_ports in traffic_types.items():
            matching_packets = [
                observation for observation in self.traffic_observations
                if observation.get('src_port') in candidate_ports or observation.get('dst_port') in candidate_ports
            ]
            if not matching_packets:
                continue
            confidence = len(matching_packets) / total_packets if total_packets else 0
            observed_matching_ports = sorted(set(observed_ports).intersection(candidate_ports))
            self.traffic_classes.append({
                'type': traffic_type,
                'confidence': round(confidence, 3),
                'ports': observed_matching_ports,
                'packet_count': len(matching_packets),
                'evidence': 'Observed source or destination ports in captured packets',
            })
            print(f"{Colors.GREEN}    [+] Observed: {Colors.WHITE}{traffic_type} {Colors.DIM}({confidence*100:.0f}% of captured packets){Colors.RESET}")
        
        print(f"\n{Colors.GREEN}✔ Traffic classification complete!{Colors.RESET}\n")
    
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
            affected_actor=self.pcap_file,
            affected_resource=affected_resource,
            result=details
        )
        
        # Add evidence
        envelope.add_evidence(self.pcap_file)
        
        # Set enforcement (OBSERVE for report extensions)
        envelope.set_enforcement("OBSERVE")
        
        # Set safe summary
        safe_summaries = {
            'WEAK_ENCRYPTION': f"Weak encryption {details.get('algorithm', 'unknown')} detected in VPN traffic",
            'WEAK_DH_GROUP': f"Weak Diffie-Hellman group {details.get('group', 'unknown')} detected in VPN traffic",
            'WEAK_PRF': f"Weak PRF {details.get('prf', 'unknown')} detected in VPN traffic",
            'TRAFFIC_CLASS': f"Traffic classified as {details.get('type', 'unknown')} with {details.get('confidence', 0)*100:.0f}% confidence"
        }
        envelope.set_summary(safe_summaries.get(finding_type, "VPN security issue detected"))
        
        # Set recipient (first in escalation route)
        route = self.manifest.get('routing', {}).get('escalation_route', ['network_engineer'])
        envelope.set_recipient(route[0])
        
        # Set technical details (for engineers)
        envelope.set_technical_details({
            'pcap_file': self.pcap_file,
            'security_score': self.security_score,
            'details': details,
            'recommendation': details.get('recommendation', 'Review VPN configuration')
        })
        
        # Set executive summary (for management)
        severity = details.get('severity', 'MEDIUM')
        envelope.set_executive_summary({
            'impact': f'{severity} severity VPN security issue detected',
            'recommended_action': 'Update VPN cryptographic configuration',
            'priority': severity,
            'affected_assets': ['VPN Gateway']
        })
        
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
        
        duration = (datetime.now() - self.start_time).total_seconds()
        
        risk_level = 'CRITICAL' if self.security_score < 40 else 'HIGH' if self.security_score < 60 else 'MEDIUM' if self.security_score < 80 else 'LOW'
        
        findings = []
        
        report_data = {
            'analysis_metadata': {
                'pcap_file': self.pcap_file,
                'started_at': self.start_time.isoformat(),
                'completed_at': datetime.now().isoformat(),
                'duration_seconds': round(duration, 3),
                'tools': ['pcap_parser', 'ike_extractor', 'crypto_analyzer', 'traffic_classifier'],
                'tshark_available': shutil.which('tshark') is not None,
            },
            'ike_exchanges': self.ike_exchanges,
            'traffic_observations': self.traffic_observations,
            'security_associations': self.security_associations,
            'traffic_classes': self.traffic_classes,
            'weaknesses': self.weaknesses,
            'recommendations': self.recommendations,
            'security_score': self.security_score,
            'counts': {
                'ike_exchanges': len(self.ike_exchanges),
                'security_associations': len(self.security_associations),
                'traffic_classes': len(self.traffic_classes),
                'weaknesses': len(self.weaknesses),
            },
            'crypto_profiles': {
                'weak_ciphers': self.weak_ciphers,
                'weak_dh_groups': self.weak_dh_groups,
                'strong_ciphers': self.strong_ciphers,
            },
        }
        envelope = self.generate_finding_envelope('vpn_crypto_analysis', report_data, self.pcap_file)
        envelope.set_summary(f"VPN crypto analysis completed for {self.pcap_file}")
        filename = self.save_finding(envelope)
        findings = [filename]
        print(f"{Colors.GREEN}✔ Report saved: {Colors.WHITE}{filename}{Colors.RESET}")
        
        # Display summary
        print(f"\n{Colors.BOLD}{Colors.GREEN}  📊 VPN ANALYSIS SUMMARY{Colors.RESET}")
        print("═"*70)
        print(f"\n{Colors.CYAN}  PCAP File:{Colors.RESET} {self.pcap_file}")
        print(f"{Colors.CYAN}  Duration:{Colors.RESET} {duration:.2f} seconds")
        print(f"{Colors.CYAN}  IKE Exchanges:{Colors.RESET} {len(self.ike_exchanges)}")
        print(f"{Colors.CYAN}  Weaknesses Found:{Colors.RESET} {len(self.weaknesses)}")
        print(f"{Colors.CYAN}  Findings Generated:{Colors.RESET} {len(findings)}")
        
        risk_color = Colors.RED if risk_level in ['CRITICAL', 'HIGH'] else Colors.YELLOW if risk_level == 'MEDIUM' else Colors.GREEN
        print(f"\n{Colors.BOLD}  Security Score: {risk_color}{self.security_score}/100 ({risk_level}){Colors.RESET}")
        
        if self.weaknesses:
            print(f"\n{Colors.RED}  ⚠ CRITICAL WEAKNESSES:{Colors.RESET}")
            for w in self.weaknesses[:5]:
                print(f"    {Colors.WHITE}• {w['type']}: {w.get('algorithm', w.get('group', w.get('prf', 'Unknown')))}")
                print(f"      {Colors.DIM}→ {w['recommendation']}{Colors.RESET}")
        
        if findings:
            print(f"\n{Colors.GREEN}✅ {len(findings)} finding envelopes saved to reports/ directory{Colors.RESET}")
        
        return findings
    
    # ============================================================
    # MAIN RUN
    # ============================================================
    
    def run(self):
        """Run all tools"""
        print(f"{Colors.BOLD}{Colors.GREEN}🚀 INITIALIZING ALL TOOLS...{Colors.RESET}\n")
        
        self.parse_pcap()
        self.analyze_crypto()
        self.classify_traffic()
        
        findings = self.generate_report()
        return findings


def main():
    parser = argparse.ArgumentParser(description='VPN Crypto Analyzer - 3 Tools in 1')
    parser.add_argument('pcap_file', help='PCAP file to analyze')
    
    args = parser.parse_args()
    
    analyzer = VPNAnalyzer(args.pcap_file)
    analyzer.run()


if __name__ == '__main__':
    main()