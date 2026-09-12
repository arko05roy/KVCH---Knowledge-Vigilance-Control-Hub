# Claude Desktop & Claude Code KVCH MCP Server Setup Guide

This guide explains how to connect **Claude Desktop** and **Claude Code** to the **KVCH MCP Server** with the 5-layer hardware & network attestation engine.

---

## 1. Connect to Claude Desktop

Open your Claude Desktop configuration file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

Add the `kvch` server under `mcpServers`:

```json
{
  "mcpServers": {
    "kvch": {
      "command": "node",
      "args": [
        "/Users/ayush/Desktop/KVCH---Knowledge-Vigilance-Control-Hub/mcp-server/dist/index.js"
      ],
      "env": {
        "KVCH_WORKSPACE": "/Users/ayush/Desktop/KVCH---Knowledge-Vigilance-Control-Hub",
        "KVCH_SECRET_KEY": "kvch-enterprise-kernel-attestation-secret-key-v1"
      }
    }
  }
}
```

*Restart Claude Desktop after saving the configuration file.*

---

## 2. Connect to Claude Code (CLI)

To register the KVCH MCP server directly in Claude Code:

```bash
claude mcp add kvch -- node /Users/ayush/Desktop/KVCH---Knowledge-Vigilance-Control-Hub/mcp-server/dist/index.js
```

Verify that the server is active:
```bash
claude mcp list
```

---

## 3. Available Tools in Claude

Once connected, Claude Desktop and Claude Code gain access to the following native tools:

| Tool Name | Description |
| :--- | :--- |
| **`kvch_fingerprint_probe`** | Probes the 5 layers (OS, Network, Transport, Presentation, Memory) and generates an attested HMAC signature. |
| **`kvch_list_extensions`** | Lists all 10 modular security engines installed in `External/`. |
| **`kvch_create_extension`** | Scaffolds a new extension with manifest schema `kvch.extension-package/v1`. |
| **`kvch_validate_extension`** | Validates schema, entrypoints, and permissions without executing code. |
| **`kvch_pack_extension`** | Packages an extension into a byte-deterministic `.kvch.tgz` tarball. |
| **`kvch_run_sandbox_scan`** | Dispatches a 120-minute sandbox attack simulation across all 10 engines. |
| **`kvch_get_security_reports`** | Retrieves `sr-dev`, `intern`, `hr`, `management`, or master reports. Enforces prefix check. |
| **`kvch_execute_soar_containment`** | Executes automated quarantine commands (`kill -9`, `nftables`, persistence purge). |

---

## 4. How the 5-Layer Fingerprint Works

On every request, the MCP server automatically measures:
1. **OS Layer**: Hardware UUID, platform, kernel release, CPU cores.
2. **Network Layer**: Active default interface, local IP, gateway, subnet mask.
3. **Transport Layer**: Active socket table hash (`netstat -an` listening ports).
4. **Presentation Layer**: OpenSSL/TLS version, crypto curve profiles, environment encoding.
5. **Memory Layer**: Total physical RAM, page size, memory layout signature.

The output token is stamped onto every request and response:
```text
[KVCH-FP:kvch-fp:v1:<timestamp>:<layers_hash>:<signature>]
```

Only requests stamped with a valid, attested fingerprint can query or retrieve findings, telemetry logs, or security reports from the KVCH Judge Execution Kernel.
