#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { generateHostFingerprint, verifyFingerprint } from "./fingerprint/signer.js";
import { probeFiveLayers } from "./fingerprint/probe.js";
import {
  handleCreateExtension,
  handleValidateExtension,
  handlePackExtension,
  handleListExtensions,
} from "./tools/extension-tools.js";
import { handleGetSecurityReports } from "./tools/report-tools.js";
import { handleRunSandboxScan, handleExecuteSoar } from "./tools/scan-tools.js";

const server = new Server(
  {
    name: "kvch-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Register Available Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "kvch_fingerprint_probe",
        description:
          "Probes the host across 5 architectural layers (OS, Network, Transport, Presentation, Memory) and generates an attested cryptographic fingerprint prefix. All sensitive retrieval calls must be stamped with this fingerprint.",
        inputSchema: {
          type: "object",
          properties: {
            includeRawTelemetry: {
              type: "boolean",
              description: "Whether to return the full 5-layer telemetry payload alongside the signature",
              default: true,
            },
          },
        },
      },
      {
        name: "kvch_list_extensions",
        description:
          "Lists all standalone modular security scanning engines present in the External/ directory.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "kvch_create_extension",
        description:
          "Scaffolds a new standalone sandboxed security extension package with kvch.extension-package/v1 manifest.",
        inputSchema: {
          type: "object",
          required: ["id", "name", "description"],
          properties: {
            id: { type: "string", description: "Unique extension ID in kebab-case (e.g. dns-tunneler-hunter)" },
            name: { type: "string", description: "Human readable extension name" },
            description: { type: "string", description: "What detection capabilities the extension provides" },
            cronSchedule: { type: "string", description: "Cron expression (e.g. '*/5 * * * *')", default: "*/5 * * * *" },
            primaryLanguage: { type: "string", enum: ["python", "node", "bash"], default: "python" },
          },
        },
      },
      {
        name: "kvch_validate_extension",
        description:
          "Validates extension manifest schema, entrypoints, and isolation requirements without executing untrusted code.",
        inputSchema: {
          type: "object",
          required: ["extensionId"],
          properties: {
            extensionId: { type: "string", description: "ID of the extension to validate" },
          },
        },
      },
      {
        name: "kvch_pack_extension",
        description:
          "Packages an extension into a byte-deterministic .kvch.tgz tarball with normalized timestamps (1970-01-01) and canonical sorting.",
        inputSchema: {
          type: "object",
          required: ["extensionId"],
          properties: {
            extensionId: { type: "string", description: "ID of the extension to package" },
          },
        },
      },
      {
        name: "kvch_run_sandbox_scan",
        description:
          "Triggers a multi-vector attack simulation scan across the 10 core defense extensions in the Judge Execution Kernel sandbox.",
        inputSchema: {
          type: "object",
          properties: {
            durationMinutes: { type: "number", default: 120, description: "Simulation duration in minutes" },
          },
        },
      },
      {
        name: "kvch_get_security_reports",
        description:
          "Retrieves role-specific security intelligence reports (Senior Dev, Intern, HR, Management, or Master 10-Engine Report). STRICTLY gated by the host 5-layer fingerprint prefix.",
        inputSchema: {
          type: "object",
          properties: {
            role: {
              type: "string",
              enum: ["sr-dev", "intern", "hr", "management", "all"],
              default: "all",
              description: "Target organizational audience",
            },
            format: {
              type: "string",
              enum: ["markdown", "json"],
              default: "markdown",
            },
            fingerprintPrefix: {
              type: "string",
              description: "Optional attested fingerprint prefix to verify origin",
            },
          },
        },
      },
      {
        name: "kvch_execute_soar_containment",
        description:
          "Executes automated SOAR active response containment playbook (process termination, nftables IP block, LaunchAgent purge).",
        inputSchema: {
          type: "object",
          properties: {
            action: {
              type: "string",
              enum: ["kill_process", "quarantine_ip", "purge_persistence", "full_quarantine"],
              default: "full_quarantine",
            },
            pid: { type: "number", default: 14209 },
            ip: { type: "string", default: "185.220.101.5" },
          },
        },
      },
    ],
  };
});

// Tool Call Execution Handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const currentFp = generateHostFingerprint();

  try {
    switch (name) {
      case "kvch_fingerprint_probe": {
        const includeRaw = args?.includeRawTelemetry ?? true;
        const telemetry = includeRaw ? probeFiveLayers() : undefined;
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  status: "ATTESTED",
                  fingerprintPrefix: currentFp.prefix,
                  fingerprint: currentFp.fingerprint,
                  timestamp: currentFp.timestamp,
                  layersHash: currentFp.layersHash,
                  telemetrySummary: {
                    os: `${currentFp.telemetry.layer1_os.platform} (${currentFp.telemetry.layer1_os.arch}) - Hardware UUID: ${currentFp.telemetry.layer1_os.hardwareUuid.slice(0, 8)}...`,
                    network: `Interface ${currentFp.telemetry.layer2_network.primaryInterface} (${currentFp.telemetry.layer2_network.localIp})`,
                    transport: `${currentFp.telemetry.layer3_transport.socketCount} listening ports`,
                    presentation: `OpenSSL ${currentFp.telemetry.layer4_presentation.sslVersion}`,
                    memory: `${Math.round(currentFp.telemetry.layer5_memory.totalMemoryBytes / 1024 / 1024 / 1024)}GB Total RAM`,
                  },
                  telemetry,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "kvch_list_extensions": {
        const res = handleListExtensions();
        return {
          content: [{ type: "text", text: JSON.stringify(res, null, 2) }],
        };
      }

      case "kvch_create_extension": {
        const res = handleCreateExtension(args as any);
        return {
          content: [{ type: "text", text: JSON.stringify(res, null, 2) }],
        };
      }

      case "kvch_validate_extension": {
        const res = handleValidateExtension(String(args?.extensionId || ""));
        return {
          content: [{ type: "text", text: JSON.stringify(res, null, 2) }],
        };
      }

      case "kvch_pack_extension": {
        const res = handlePackExtension(String(args?.extensionId || ""));
        return {
          content: [{ type: "text", text: JSON.stringify(res, null, 2) }],
        };
      }

      case "kvch_run_sandbox_scan": {
        const res = handleRunSandboxScan(args as any);
        return {
          content: [{ type: "text", text: JSON.stringify(res, null, 2) }],
        };
      }

      case "kvch_get_security_reports": {
        const res = handleGetSecurityReports(args as any);
        return {
          content: [{ type: "text", text: typeof res.content === "string" ? res.content : JSON.stringify(res, null, 2) }],
        };
      }

      case "kvch_execute_soar_containment": {
        const res = handleExecuteSoar(args as any);
        return {
          content: [{ type: "text", text: JSON.stringify(res, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `[ERROR ${currentFp.prefix}] Tool execution failed: ${error.message || String(error)}`,
        },
      ],
    };
  }
});

// Resource handlers for direct documentation / manifest reads
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "kvch://reports/master",
        name: "120-Minute Sandbox Master Attack Simulation Report",
        mimeType: "text/markdown",
      },
      {
        uri: "kvch://telemetry/fingerprint",
        name: "Current Host 5-Layer Attestation Fingerprint",
        mimeType: "application/json",
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  const currentFp = generateHostFingerprint();

  if (uri === "kvch://telemetry/fingerprint") {
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(currentFp, null, 2),
        },
      ],
    };
  }

  if (uri === "kvch://reports/master") {
    const res = handleGetSecurityReports({ role: "all", format: "markdown", fingerprintPrefix: currentFp.prefix });
    return {
      contents: [
        {
          uri,
          mimeType: "text/markdown",
          text: String(res.content || "Report unavailable"),
        },
      ],
    };
  }

  throw new Error(`Resource not found: ${uri}`);
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[KVCH MCP Server] Running on stdio with 5-Layer Fingerprint Attestation`);
}

run().catch((error) => {
  console.error("[KVCH MCP Server] Fatal startup error:", error);
  process.exit(1);
});
