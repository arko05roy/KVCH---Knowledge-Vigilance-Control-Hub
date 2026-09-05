"""Phishing Hunter core logic engine."""
import logging
from typing import Dict, Any, List
from ..adapters.laptop import get_my_hostname, get_my_ip
from ..adapters.dns import resolve_domain_a_record

logger = logging.getLogger(__name__)

TLDS = ['com', 'net', 'org', 'io', 'co']
KEYWORDS = ['login', 'secure', 'verify', 'update', 'account']

class PhishingHunter:
    def __init__(self, target_domain: str = None):
        self.target_domain = target_domain or get_my_hostname()
        self.target_ip = get_my_ip()
        self.typosquatting_domains = []
        self.active_phishing_domains = []

    def generate_permutations(self) -> List[str]:
        base = self.target_domain.split('.')[0].lower()
        perms = set()
        for tld in TLDS:
            perms.add(f"{base}.{tld}")
            for kw in KEYWORDS:
                perms.add(f"{base}-{kw}.{tld}")
                perms.add(f"{kw}-{base}.{tld}")
        # Homoglyphs / simple typos
        perms.add(f"{base}s.com")
        perms.add(f"{base}1.com")
        self.typosquatting_domains = list(perms)
        return self.typosquatting_domains

    def hunt(self) -> Dict[str, Any]:
        logger.info(f"Starting Phishing Hunter for target: {self.target_domain}")
        permutations = self.generate_permutations()

        # Resolve first 10 variants to avoid network blocking in standard scan
        for dom in permutations[:10]:
            ips = resolve_domain_a_record(dom)
            if ips:
                self.active_phishing_domains.append({"domain": dom, "ips": ips})

        return {
            "target_domain": self.target_domain,
            "laptop_ip": self.target_ip,
            "total_permutations": len(permutations),
            "active_phishing_domains": self.active_phishing_domains,
            "sample_typosquats": permutations[:10]
        }
