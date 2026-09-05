"""PCAP & tshark integration adapter."""
import shutil
import subprocess
from typing import Dict, Any, List

def check_tshark_installed() -> bool:
    return shutil.which('tshark') is not None

def run_tshark_summary(pcap_file: str) -> Dict[str, Any]:
    if not check_tshark_installed():
        return {'available': False, 'error': 'tshark is not installed'}
    try:
        stats = subprocess.run(
            ['tshark', '-r', pcap_file, '-q', '-z', 'io,phs'],
            capture_output=True, text=True, timeout=15, check=False
        )
        return {
            'available': True,
            'return_code': stats.returncode,
            'output': stats.stdout[-4000:],
            'error': stats.stderr[-1000:] if stats.returncode else ''
        }
    except Exception as e:
        return {'available': False, 'error': str(e)}
