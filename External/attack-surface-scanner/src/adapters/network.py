"""Network interaction adapter for socket, SSL, and netstat operations."""

import socket
import ssl
import subprocess
from datetime import datetime
from typing import Dict, Any, List

COMMON_SERVICES = {
    21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP', 53: 'DNS',
    80: 'HTTP', 110: 'POP3', 111: 'RPCBIND', 135: 'MSRPC', 139: 'NETBIOS',
    143: 'IMAP', 443: 'HTTPS', 445: 'SMB', 993: 'IMAPS', 995: 'POP3S',
    1723: 'PPTP', 3306: 'MySQL', 3389: 'RDP', 5432: 'PostgreSQL', 5900: 'VNC',
    6379: 'Redis', 8080: 'HTTP-Proxy', 8443: 'HTTPS-Alt', 27017: 'MongoDB'
}

def scan_single_port(ip: str, port: int, timeout: float = 1.0) -> Dict[str, Any]:
    """Scan a single TCP port."""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((ip, port))
        sock.close()
        if result == 0:
            return {'port': port, 'state': 'open', 'service': COMMON_SERVICES.get(port, 'Unknown')}
    except (OSError, socket.error):
        pass
    return {'port': port, 'state': 'closed', 'service': COMMON_SERVICES.get(port, 'Unknown')}

def analyze_ssl_cert(hostname: str, port: int = 443) -> Dict[str, Any]:
    """Fetch SSL certificate information for a host."""
    try:
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        with socket.create_connection((hostname, port), timeout=3.0) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert(binary_form=False) or {}
                cipher = ssock.cipher()
                return {
                    'port': port,
                    'protocol': ssock.version(),
                    'cipher': cipher[0] if cipher else 'Unknown',
                    'cert_subject': dict(x[0] for x in cert.get('subject', ())),
                    'cert_issuer': dict(x[0] for x in cert.get('issuer', ())),
                }
    except Exception as error:
        return {'port': port, 'error': str(error)}

def get_netstat_snapshot(max_lines: int = 100) -> Dict[str, Any]:
    """Return netstat snapshot."""
    try:
        result = subprocess.run(['netstat', '-anv'], capture_output=True, text=True, timeout=5, check=False)
        lines = result.stdout.splitlines()
        return {'available': True, 'lines': lines[:max_lines]}
    except Exception as error:
        return {'available': False, 'error': str(error), 'lines': []}
