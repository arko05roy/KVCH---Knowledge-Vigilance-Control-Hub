#!/usr/bin/env python3
"""Massive ASCII art banners for each extension"""

from utils.colors import Colors

# Attack Scanner Banner
BANNER_ATTACK_SCANNER = f"""
{Colors.RED}   █████  ████████ ████████  █████  ██████  ██   ██     ███████ ███████  █████  ███    ██ ███    ██ ███████ ██████  
{Colors.RED}  ██   ██    ██       ██    ██   ██ ██   ██ ██   ██     ██      ██      ██   ██ ████   ██ ████   ██ ██      ██   ██ 
{Colors.RED}  ███████    ██       ██    ███████ ██████  ███████     ███████ █████   ███████ ██ ██  ██ ██ ██  ██ █████   ██████  
{Colors.RED}  ██   ██    ██       ██    ██   ██ ██   ██ ██   ██          ██ ██      ██   ██ ██  ██ ██ ██  ██ ██ ██      ██   ██ 
{Colors.RED}  ██   ██    ██       ██    ██   ██ ██   ██ ██   ██     ███████ ███████ ██   ██ ██   ████ ██   ████ ███████ ██   ██ 
{Colors.RESET}
{Colors.BOLD}{Colors.CYAN}╔═══════════════════════════════════════════════════════════════════════════════════════╗
{Colors.CYAN}║  {Colors.WHITE}ATTACK SURFACE SCANNER{Colors.RESET}                          {Colors.CYAN}║
{Colors.CYAN}║  {Colors.DIM}Subdomain Enumeration | Port Scanner | SSL Analyzer | Cloud Detection{Colors.RESET}  ║
{Colors.CYAN}╚═══════════════════════════════════════════════════════════════════════════════════════╝{Colors.RESET}
"""

# VPN Analyzer Banner
BANNER_VPN_ANALYZER = f"""
{Colors.MAGENTA}██╗   ██╗██████╗ ███╗   ██╗     █████╗ ███╗   ██╗ █████╗ ██╗  ██╗██╗   ██╗███████╗██████╗ 
{Colors.MAGENTA}██║   ██║██╔══██╗████╗  ██║    ██╔══██╗████╗  ██║██╔══██╗╚██╗██╔╝╚██╗ ██╔╝██╔════╝██╔══██╗
{Colors.MAGENTA}██║   ██║██████╔╝██╔██╗ ██║    ███████║██╔██╗ ██║███████║ ╚███╔╝  ╚████╔╝ █████╗  ██████╔╝
{Colors.MAGENTA}╚██╗ ██╔╝██╔═══╝ ██║╚██╗██║    ██╔══██║██║╚██╗██║██╔══██║ ██╔██╗   ╚██╔╝  ██╔══╝  ██╔══██╗
{Colors.MAGENTA} ╚████╔╝ ██║     ██║ ╚████║    ██║  ██║██║ ╚████║██║  ██║██╔╝ ██╗   ██║   ███████╗██║  ██║
{Colors.MAGENTA}  ╚═══╝  ╚═╝     ╚═╝  ╚═══╝    ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
{Colors.RESET}
{Colors.BOLD}{Colors.CYAN}╔═══════════════════════════════════════════════════════════════════════════════════════╗
{Colors.CYAN}║  {Colors.WHITE}VPN CRYPTO ANALYZER{Colors.RESET}                            {Colors.CYAN}║
{Colors.CYAN}║  {Colors.DIM}PCAP Parser | IKE Extraction | Crypto Strength | Traffic Classification{Colors.RESET}║
{Colors.CYAN}╚═══════════════════════════════════════════════════════════════════════════════════════╝{Colors.RESET}
"""

# Phishing Hunter Banner
BANNER_PHISHING_HUNTER = f"""
{Colors.YELLOW}██████╗ ██╗  ██╗██╗███████╗██╗  ██╗██╗███╗   ██╗ ██████╗     ██╗  ██╗██╗   ██╗███╗   ██╗████████╗███████╗██████╗ 
{Colors.YELLOW}██╔══██╗██║  ██║██║██╔════╝██║  ██║██║████╗  ██║██╔════╝     ██║  ██║██║   ██║████╗  ██║╚══██╔══╝██╔════╝██╔══██╗
{Colors.YELLOW}██████╔╝███████║██║███████╗███████║██║██╔██╗ ██║██║  ███╗    ███████║██║   ██║██╔██╗ ██║   ██║   █████╗  ██████╔╝
{Colors.YELLOW}██╔═══╝ ██╔══██║██║╚════██║██╔══██║██║██║╚██╗██║██║   ██║    ██╔══██║██║   ██║██║╚██╗██║   ██║   ██╔══╝  ██╔══██╗
{Colors.YELLOW}██║     ██║  ██║██║███████║██║  ██║██║██║ ╚████║╚██████╔╝    ██║  ██║╚██████╔╝██║ ╚████║   ██║   ███████╗██║  ██║
{Colors.YELLOW}╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
{Colors.RESET}
{Colors.BOLD}{Colors.CYAN}╔═══════════════════════════════════════════════════════════════════════════════════════╗
{Colors.CYAN}║  {Colors.WHITE}PHISHING HUNTER{Colors.RESET}                                 {Colors.CYAN}║
{Colors.CYAN}║  {Colors.DIM}Typosquatting Generator | WHOIS Intelligence | DNS Recon | ML Risk Prediction{Colors.RESET}║
{Colors.CYAN}╚═══════════════════════════════════════════════════════════════════════════════════════╝{Colors.RESET}
"""

# Threat Hunter 3000 Banner
BANNER_THREAT_HUNTER = f"""
{Colors.RED}████████╗██╗  ██╗██████╗ ███████╗ █████╗ ████████╗    ██╗  ██╗██╗   ██╗███╗   ██╗████████╗███████╗██████╗ 
{Colors.RED}╚══██╔══╝██║  ██║██╔══██╗██╔════╝██╔══██╗╚══██╔══╝    ██║  ██║██║   ██║████╗  ██║╚══██╔══╝██╔════╝██╔══██╗
{Colors.RED}   ██║   ███████║██████╔╝█████╗  ███████║   ██║       ███████║██║   ██║██╔██╗ ██║   ██║   █████╗  ██████╔╝
{Colors.RED}   ██║   ██╔══██║██╔══██╗██╔══╝  ██╔══██║   ██║       ██╔══██║██║   ██║██║╚██╗██║   ██║   ██╔══╝  ██╔══██╗
{Colors.RED}   ██║   ██║  ██║██║  ██║███████╗██║  ██║   ██║       ██║  ██║╚██████╔╝██║ ╚████║   ██║   ███████╗██║  ██║
{Colors.RED}   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝       ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
{Colors.RESET}
{Colors.BOLD}{Colors.CYAN}╔═══════════════════════════════════════════════════════════════════════════════════════╗
{Colors.CYAN}║  {Colors.WHITE}THREAT HUNTER 3000{Colors.RESET}                                {Colors.CYAN}║
{Colors.CYAN}║  {Colors.DIM}Real-time Sniffer | Active Scanner | Threat Intel | Firewall Generator | MITRE{Colors.RESET}║
{Colors.CYAN}╚═══════════════════════════════════════════════════════════════════════════════════════╝{Colors.RESET}
"""

# Malware Analyzer Banner
BANNER_MALWARE_ANALYZER = f"""
{Colors.GREEN}███╗   ███╗ █████╗ ██╗     ██╗    ██╗ █████╗ ██████╗ ███████╗     █████╗ ███╗   ██╗ █████╗ ██╗  ██╗██╗   ██╗███████╗██████╗ 
{Colors.GREEN}████╗ ████║██╔══██╗██║     ██║    ██║██╔══██╗██╔══██╗██╔════╝    ██╔══██╗████╗  ██║██╔══██╗╚██╗██╔╝╚██╗ ██╔╝██╔════╝██╔══██╗
{Colors.GREEN}██╔████╔██║███████║██║     ██║ █╗ ██║███████║██████╔╝█████╗      ███████║██╔██╗ ██║███████║ ╚███╔╝  ╚████╔╝ █████╗  ██████╔╝
{Colors.GREEN}██║╚██╔╝██║██╔══██║██║     ██║███╗██║██╔══██║██╔══██╗██╔══╝      ██╔══██║██║╚██╗██║██╔══██║ ██╔██╗   ╚██╔╝  ██╔══╝  ██╔══██╗
{Colors.GREEN}██║ ╚═╝ ██║██║  ██║███████╗╚███╔███╔╝██║  ██║██║  ██║███████╗    ██║  ██║██║ ╚████║██║  ██║██╔╝ ██╗   ██║   ███████╗██║  ██║
{Colors.GREEN}╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝ ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝    ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
{Colors.RESET}
{Colors.BOLD}{Colors.CYAN}╔═══════════════════════════════════════════════════════════════════════════════════════╗
{Colors.CYAN}║  {Colors.WHITE}MALWARE ANALYZER{Colors.RESET}                                  {Colors.CYAN}║
{Colors.CYAN}║  {Colors.DIM}Hash Analysis | YARA Engine | PE/ELF Analyzer | Behavioral Analysis{Colors.RESET}    ║
{Colors.CYAN}╚═══════════════════════════════════════════════════════════════════════════════════════╝{Colors.RESET}
"""

# Global KVCH Banner
KVCH_BANNER = f"""
{Colors.CYAN}██╗  ██╗██╗   ██╗ ██████╗██╗  ██╗    ███████╗██╗  ██╗████████╗███████╗██████╗ ███╗   ██╗ █████╗ ██╗     
{Colors.CYAN}██║ ██╔╝██║   ██║██╔════╝██║  ██║    ██╔════╝╚██╗██╔╝╚══██╔══╝██╔════╝██╔══██╗████╗  ██║██╔══██╗██║     
{Colors.CYAN}█████╔╝ ██║   ██║██║     ███████║    █████╗   ╚███╔╝    ██║   █████╗  ██████╔╝██╔██╗ ██║███████║██║     
{Colors.CYAN}██╔═██╗ ██║   ██║██║     ██╔══██║    ██╔══╝   ██╔██╗    ██║   ██╔══╝  ██╔══██╗██║╚██╗██║██╔══██║██║     
{Colors.CYAN}██║  ██╗╚██████╔╝╚██████╗██║  ██║    ███████╗██╔╝ ██╗   ██║   ███████╗██║  ██║██║ ╚████║██║  ██║███████╗
{Colors.CYAN}╚═╝  ╚═╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝    ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝
{Colors.RESET}
{Colors.BOLD}{Colors.YELLOW}              Knowledge - Vigilance - Control Hub{Colors.RESET}
{Colors.DIM}                     External Threat Defense System{Colors.RESET}
"""