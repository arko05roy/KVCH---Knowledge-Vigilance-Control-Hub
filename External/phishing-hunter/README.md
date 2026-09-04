# Phishing Hunter KVCH Extension

The **Phishing Hunter** extension protects hostnames and brand assets by dynamically generating typosquatting permutations, performing DNS reconnaissance, inspecting WHOIS domain age, and predicting phishing risk scores.

## Features
- **Auto-Detection**: Dynamically resolves laptop hostname via `socket.gethostname()`.
- **Typosquatting Generator**: Generates character swapping, omission, addition, and homoglyph domain variants.
- **DNS Reconnaissance**: Resolves IPv4 A records and NS records for suspicious domain variants.
- **WHOIS & Risk Engine**: Evaluates domain age and registrar patterns to output risk predictions.

## Usage
```bash
# Run targeting auto-detected hostname
python src/main.py

# Specify explicit domain
python src/main.py --domain example.com

# Run unit tests
pytest tests/
```
