# Ayush
- **Cyber Risk Economics & Prompt Engine**: Built Groq LLM key pool (`groq/compound`) translating `kvch.finding/v1` telemetry into Expected Annual Loss (EAL), ROSI, and scenario analysis (No Action vs. Remediated).
- **Asset Criticality Scaling**: Modeled dynamic financial risk scaling realistically for local developer laptops (₹0–₹10k) vs. production infrastructure (₹10L+).
- **Regulatory Framework Mapping**: Integrated automated compliance controls mapping findings directly to ISO/IEC 27001, NIST CSF, CIS, RBI, and SEBI CSCRF.
- **Interactive 4-Role Dashboard Control Plane**: Created `AiReportDisplayCard` and live test triggers across `/sr-dev`, `/intern`, `/hr`, and `/management` portals.




# Arko
Implemented and integrated the KVCH external threat-detection system:
- Added local-laptop targeting for IP, hostname, interface, live traffic, and local files.
- Added one aggregate Finding Envelope report per extension while preserving the contract.
- Added portable YARA-X and ifaddr support, Nmap/TShark integration, and real packet metadata analysis.
- Added netstat -anv socket snapshots and TShark protocol statistics to reports.
- Added detailed risk, evidence, capability, count, and recommendation sections.
- Executed and reviewed the five extensions and maintained the web integration.




# Atul
Implemented and integrated the KVCH external threat-detection system:
- Added local-laptop targeting for IP, hostname, interface, live traffic, and local files.
- Added one aggregate Finding Envelope report per extension while preserving the contract.
- Added portable YARA-X and ifaddr support, Nmap/TShark integration, and real packet metadata analysis.
- Added netstat -anv socket snapshots and TShark protocol statistics to reports.
- Added detailed risk, evidence, capability, count, and recommendation sections.
- Executed and reviewed the five extensions and maintained the web integration.

# Rohit & Sahil
Implemented and integrated Extensions 6 & 7 for browser endpoint threat vigilance:
- **Digital Asset & Credential Exposure Auditor** (`credential-exposure-auditor`):
  - Added detection for BIP-39 mnemonic seed harvesting, EVM/BTC/SOL private key scraping, and input exfiltration.
  - Added clipboard tampering heuristics detecting unauthorized copy/paste address replacement (clipper activity).
  - Added Web3 provider injection checks (`window.ethereum`) and transaction interception auditing.
  - Added heuristic permission analysis identifying deceptive utility extensions (PDF/OCR tools) requesting high-risk permissions.
- **Extension Supply-Chain & Integrity Auditor** (`supply-chain-auditor`):
  - Added extension provenance and manifest tracking detecting unverified third-party `update_url` shifts.
  - Added dynamic remote code injection detection (`document.createElement('script')`, `importScripts()`, `eval()`).
  - Added mathematical Shannon entropy analysis detecting obfuscated/packed payloads in utility extensions.
  - Added C2 telemetry analysis flagging unpinned WebSocket connections and raw IP endpoints.
- Packaged both extensions to the KVCH Extension Bridge standard (`kvch.extension-package/v1`) with evaluation preflight checks and `kvch.finding/v1` standardized reports.
