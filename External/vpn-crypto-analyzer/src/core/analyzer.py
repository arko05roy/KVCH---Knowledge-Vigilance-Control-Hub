"""VPN Crypto Analyzer core engine."""
import logging
from datetime import datetime
from typing import Dict, Any, List

from ..adapters.laptop import get_my_ip, get_my_hostname, get_my_interface
from ..adapters.pcap import run_tshark_summary

logger = logging.getLogger(__name__)

WEAK_CIPHERS = ['DES', '3DES', 'RC4', 'MD5']
WEAK_DH_GROUPS = ['1', '2', '5']
STRONG_CIPHERS = ['AES-256-GCM', 'AES-128-GCM', 'ChaCha20-Poly1305']

class VPNAnalyzer:
    def __init__(self, pcap_file: str = None):
        self.pcap_file = pcap_file
        self.target_ip = get_my_ip()
        self.hostname = get_my_hostname()
        self.interface = get_my_interface()
        self.security_score = 100
        self.weaknesses = []
        self.recommendations = []
        self.traffic_classes = []

    def analyze(self) -> Dict[str, Any]:
        logger.info("Starting VPN Crypto Analysis...")

        pcap_summary = None
        if self.pcap_file:
            pcap_summary = run_tshark_summary(self.pcap_file)
            self.traffic_classes.append("PCAP Analysis")
        else:
            self.traffic_classes.append("Live Interface Monitoring")
            self.recommendations.append("Provide explicit PCAP capture for deep packet IKE extraction")

        return {
            "target_ip": self.target_ip,
            "hostname": self.hostname,
            "interface": self.interface,
            "pcap_file": self.pcap_file,
            "security_score": self.security_score,
            "weaknesses": self.weaknesses,
            "recommendations": self.recommendations,
            "traffic_classes": self.traffic_classes,
            "pcap_summary": pcap_summary,
            "timestamp": datetime.now().isoformat()
        }
