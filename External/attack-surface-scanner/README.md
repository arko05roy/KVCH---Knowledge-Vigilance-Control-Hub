# Attack Surface Scanner KVCH Extension

The **Attack Surface Scanner** is a KVCH threat extension that analyzes your local laptop (or specified target IP) to identify open network ports, SSL/TLS certificate configurations, subdomain footprints, and potential public cloud storage bucket exposure.

## Features
- **Auto-Detection**: Dynamically resolves local laptop IPv4 address via `ifconfig` / `route`.
- **Subdomain Enumeration**: Brute-forces common subdomains or checks local target identity.
- **Port Scanner**: Multi-threaded TCP port scanner across standard management and service ports.
- **SSL/TLS Analyzer**: Inspects SSL certificate expiration, SANs, and protocol strength.
- **Cloud Storage Detector**: Verifies exposure of S3/GCP/Azure buckets linked to the target.
- **KVCH Envelope Output**: Outputs standardized JSON Finding Envelopes for KVCH integration.

## Extension Manifest
- **Schema Version**: `kvch.extension-package/v1`
- **ID**: `attack-surface-scanner`
- **Entrypoint**: `src/main.py`

## Usage
```bash
# Run with auto-detected laptop IP
python src/main.py

# Specify explicit IP or hostname
python src/main.py --target 192.168.31.204

# Run unit tests
pytest tests/
```
