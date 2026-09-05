"""DNS & WHOIS adapter."""
import socket
from typing import Dict, Any, List

def resolve_domain_a_record(domain: str) -> List[str]:
    try:
        results = socket.gethostbyname_ex(domain)
        return results[2]
    except OSError:
        return []
