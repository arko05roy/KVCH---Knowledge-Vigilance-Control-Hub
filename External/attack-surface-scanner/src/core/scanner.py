"""Attack Surface Scanner core analysis engine."""

import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from typing import Dict, Any, List

from ..adapters.laptop import get_my_ip, get_my_hostname
from ..adapters.network import scan_single_port, analyze_ssl_cert, get_netstat_snapshot

logger = logging.getLogger(__name__)

DEFAULT_PORTS = [21, 22, 23, 25, 53, 80, 110, 135, 139, 143, 443, 445, 1433, 3306, 3389, 5432, 5900, 6379, 8080, 8443, 27017]

class AttackSurfaceScanner:
    def __init__(self, target_ip: str = None, ports: List[int] = None, max_threads: int = 20):
        self.target_ip = target_ip or get_my_ip()
        self.hostname = get_my_hostname()
        self.ports = ports or DEFAULT_PORTS
        self.max_threads = max_threads
        self.open_ports = []
        self.ssl_results = []
        self.cloud_buckets = []
        self.start_time = datetime.now()

    def run_scan(self) -> Dict[str, Any]:
        logger.info(f"Starting Attack Surface Scan on target {self.target_ip} ({self.hostname})")

        # 1. Port Scan
        with ThreadPoolExecutor(max_workers=self.max_threads) as executor:
            futures = [executor.submit(scan_single_port, self.target_ip, p) for p in self.ports]
            for future in as_completed(futures):
                try:
                    res = future.result()
                    if res.get('state') == 'open':
                        self.open_ports.append(res)
                except Exception as e:
                    logger.error(f"Error scanning port: {e}")

        # 2. SSL Inspection if port 443 is open or scanned
        if any(p['port'] == 443 for p in self.open_ports) or 443 in self.ports:
            ssl_info = analyze_ssl_cert(self.target_ip, 443)
            if 'error' not in ssl_info:
                self.ssl_results.append(ssl_info)

        # 3. Netstat snapshot
        netstat = get_netstat_snapshot()

        return {
            'target_ip': self.target_ip,
            'hostname': self.hostname,
            'timestamp': datetime.now().isoformat(),
            'open_ports': self.open_ports,
            'ssl_results': self.ssl_results,
            'cloud_buckets': self.cloud_buckets,
            'netstat_available': netstat.get('available', False)
        }
