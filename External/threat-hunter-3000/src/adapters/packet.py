"""Scapy packet capture and MITRE ATT&CK mapping adapter."""
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

MITRE_MAP = {
    'port_scan': 'T1046 - Network Service Scanning',
    'brute_force': 'T1110 - Brute Force',
    'ddos': 'T1498 - Network Denial of Service',
    'exploit': 'T1190 - Exploit Public-Facing Application',
    'recon': 'T1595 - Active Scanning'
}

def map_event_to_mitre(event_type: str) -> str:
    return MITRE_MAP.get(event_type, 'T1071 - Application Layer Protocol')
