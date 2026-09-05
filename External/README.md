# KVCH External Threat Extensions

## 🛡️ MASSIVE Security Extensions

### 1. Attack Surface Scanner (4 Tools in 1)
- Subdomain Enumeration
- Port Scanning  
- SSL/TLS Analysis
- Cloud Storage Detection

### 2. VPN Crypto Analyzer (3 Tools in 1)
- PCAP Parsing
- IKE Extraction
- Crypto Strength Analysis
- Packet-Metadata Traffic Classification

### 3. Phishing Hunter (3 Tools in 1)
- Typosquatting Generation
- WHOIS Intelligence
- DNS Recon & ML Risk

### 4. Threat Hunter 3000 (4 Tools in 1)
- Real-time Packet Sniffer
- Active Vulnerability Scanner
- Threat Intelligence
- Auto-Firewall & MITRE Mapper

### 5. Malware Analyzer (4 Tools in 1)
- Hash Analysis
- YARA Engine
- PE/ELF Header Analysis
- Behavioral Analysis

### 6. Digital Asset & Credential Exposure Auditor (4 Tools in 1)
- Seed Phrase & Private Credential Scraping Scanner
- Clipboard Address Tampering & Clipper Heuristic Detector
- Web3 Provider & Wallet Interface Hooking Auditor
- Deceptive Utility Permission Analyzer (e.g. PDF/OCR tools)

### 7. Extension Supply-Chain & Integrity Auditor (4 Tools in 1)
- Update URL & Extension Manifest Provenance Auditor
- Remote Code Execution & Dynamic Script Injection Scanner
- Mathematical Shannon Entropy & Obfuscated Payload Detector
- C2 WebSocket & Telemetry Endpoint Beacon Analyzer

## 🚀 Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run an extension
python extensions/1_attack_surface_scanner.py example.com
python extensions/4_threat_hunter_3000.py -t example.com -d 60
python extensions/5_malware_analyzer.py suspicious_file.exe
python extensions/6_credential_exposure_auditor.py
python extensions/7_supply_chain_auditor.py
```

## Local Laptop Mode

Run the extensions without positional arguments to analyze the current laptop:

```bash
python extensions/1_attack_surface_scanner.py
python extensions/2_vpn_crypto_analyzer.py
python extensions/3_phishing_hunter.py
sudo python extensions/4_threat_hunter_3000.py -d 10
python extensions/5_malware_analyzer.py
python extensions/6_credential_exposure_auditor.py
python extensions/7_supply_chain_auditor.py
```

The extensions detect the local IP, hostname, default interface, and installed
browser profiles. The VPN extension captures live packets with `tcpdump`; the
malware and auditor extensions analyze local files, manifests, and scripts to
write aggregate Finding Envelope reports adhering to `kvch.finding/v1`. Network
capture requires administrator permission. Firewall output is advisory and is
never applied automatically.