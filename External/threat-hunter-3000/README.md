# Threat Hunter 3000 KVCH Extension

The **Threat Hunter 3000** is a multi-engine live network packet sniffing, active port scanning, threat intelligence querying, and MITRE ATT&CK mapping extension for KVCH.

## Features
- **Auto-Detection**: Resolves active laptop network interface (`en0` via default route) and IPv4 address.
- **Packet Capture Engine**: Captures TCP, UDP, ICMP packets and detects port scan bursts or connection spikes.
- **Threat Intel Lookup**: Checks suspicious IP reputation against threat intel feeds.
- **MITRE ATT&CK Mapping**: Maps detected network events to ATT&CK tactics & techniques (T1046, T1110, T1498, etc.).
- **Firewall Rule Generator**: Outputs advisory iptables/pf firewall rules.

## Usage
```bash
# Run real-time sniffer (requires sudo for raw packet sniffing)
python src/main.py --duration 10

# Specify network interface
python src/main.py --interface en0 --duration 5

# Run unit tests
pytest tests/
```
