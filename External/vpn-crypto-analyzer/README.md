# VPN Crypto Analyzer KVCH Extension

The **VPN Crypto Analyzer** inspects VPN traffic (IKE/IPsec protocols, TLS tunnels, cipher algorithms) captured from your laptop or specified PCAP files to evaluate cryptographic security strength.

## Features
- **PCAP & Live Capture Parsing**: Uses `pyshark` and `tshark` adapters.
- **IKE Extraction**: Identifies ISAKMP/IKE Security Associations and Diffie-Hellman exchange parameters.
- **Crypto Strength Scoring**: Identifies weak ciphers (3DES, DES, RC4, MD5) and flags insecure DH groups.
- **Traffic Classification**: Categorizes VPN traffic types and calculates overall security scores.

## Usage
```bash
# Run on sample fixture or auto-detected network
python src/main.py

# Run on specific PCAP file
python src/main.py --pcap path/to/capture.pcap

# Run unit tests
pytest tests/
```
