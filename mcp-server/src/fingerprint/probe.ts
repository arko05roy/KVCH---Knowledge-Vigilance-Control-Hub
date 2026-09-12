import os from "node:os";
import { execSync } from "node:child_process";
import crypto from "node:crypto";
import type {
  FiveLayerTelemetry,
  OsLayerTelemetry,
  NetworkLayerTelemetry,
  TransportLayerTelemetry,
  PresentationLayerTelemetry,
  MemoryLayerTelemetry,
} from "./types.js";

/**
 * Probes the local host system across 5 architectural layers:
 * 1. OS / Host
 * 2. Network (IP / Interface)
 * 3. Transport (TCP / Sockets)
 * 4. Presentation (TLS / Crypto Curves)
 * 5. Memory (Physical RAM & Heap profile)
 */
export function probeFiveLayers(): FiveLayerTelemetry {
  const probedAt = new Date().toISOString();

  // Layer 1: OS / Host
  const layer1_os = probeOsLayer();

  // Layer 2: Network
  const layer2_network = probeNetworkLayer();

  // Layer 3: Transport
  const layer3_transport = probeTransportLayer();

  // Layer 4: Presentation
  const layer4_presentation = probePresentationLayer();

  // Layer 5: Memory
  const layer5_memory = probeMemoryLayer();

  return {
    layer1_os,
    layer2_network,
    layer3_transport,
    layer4_presentation,
    layer5_memory,
    probedAt,
  };
}

function probeOsLayer(): OsLayerTelemetry {
  let hardwareUuid = "00000000-0000-0000-0000-000000000000";
  const platform = os.platform();

  try {
    if (platform === "darwin") {
      const output = execSync("ioreg -rd1 -c IOPlatformExpertDevice", {
        encoding: "utf-8",
        timeout: 1000,
        stdio: ["ignore", "pipe", "ignore"],
      });
      const match = output.match(/"IOPlatformUUID"\s*=\s*"([^"]+)"/);
      if (match && match[1]) {
        hardwareUuid = match[1].trim();
      }
    } else if (platform === "linux") {
      const output = execSync("cat /etc/machine-id 2>/dev/null || cat /var/lib/dbus/machine-id 2>/dev/null", {
        encoding: "utf-8",
        timeout: 1000,
        stdio: ["ignore", "pipe", "ignore"],
      });
      if (output.trim()) {
        hardwareUuid = output.trim();
      }
    }
  } catch {
    // Fallback deterministic pseudo-UUID from hostname and cpu model
    hardwareUuid = crypto
      .createHash("sha256")
      .update(os.hostname() + os.arch() + os.cpus()[0]?.model)
      .digest("hex")
      .slice(0, 36);
  }

  const cpus = os.cpus();
  return {
    platform,
    release: os.release(),
    arch: os.arch(),
    hostname: os.hostname(),
    bootTime: Math.floor(Date.now() / 1000) - Math.floor(os.uptime()),
    hardwareUuid,
    cpuModel: cpus[0]?.model || "unknown",
    cpuCores: cpus.length,
  };
}

function probeNetworkLayer(): NetworkLayerTelemetry {
  const interfaces = os.networkInterfaces();
  let primaryName = "lo0";
  let primaryIp = "127.0.0.1";
  let primaryMac = "00:00:00:00:00:00";
  let subnetMask = "255.0.0.0";
  let isInternal = true;

  // Find non-internal IPv4 interface
  for (const [name, netList] of Object.entries(interfaces)) {
    if (!netList) continue;
    for (const net of netList) {
      if (net.family === "IPv4" && !net.internal) {
        primaryName = name;
        primaryIp = net.address;
        primaryMac = net.mac;
        subnetMask = net.netmask;
        isInternal = false;
        break;
      }
    }
    if (!isInternal) break;
  }

  const macHash = crypto.createHash("sha256").update(primaryMac).digest("hex").slice(0, 16);

  return {
    primaryInterface: primaryName,
    localIp: primaryIp,
    macHash,
    subnetMask,
    isInternal,
  };
}

function probeTransportLayer(): TransportLayerTelemetry {
  const listeningPorts: number[] = [];
  let socketSignatureRaw = "";

  try {
    const isDarwin = os.platform() === "darwin";
    const cmd = isDarwin
      ? "netstat -an -p tcp | grep LISTEN"
      : "ss -tlpn 2>/dev/null || netstat -tlpn 2>/dev/null";

    const output = execSync(cmd, {
      encoding: "utf-8",
      timeout: 1000,
      stdio: ["ignore", "pipe", "ignore"],
    });

    socketSignatureRaw = output.trim();
    // Parse common listening ports
    const portMatches = output.match(/\.([0-9]{2,5})\s/g) || output.match(/:([0-9]{2,5})\s/g) || [];
    for (const m of portMatches) {
      const port = parseInt(m.replace(/[^0-9]/g, ""), 10);
      if (!isNaN(port) && !listeningPorts.includes(port)) {
        listeningPorts.push(port);
      }
    }
    listeningPorts.sort((a, b) => a - b);
  } catch {
    socketSignatureRaw = "socket-probe-fallback-local";
  }

  const activeSocketsHash = crypto
    .createHash("sha256")
    .update(socketSignatureRaw || "no-sockets")
    .digest("hex")
    .slice(0, 24);

  return {
    activeSocketsHash,
    listeningPorts: listeningPorts.slice(0, 20),
    socketCount: listeningPorts.length,
  };
}

function probePresentationLayer(): PresentationLayerTelemetry {
  const curves = crypto.getCurves();
  const curvesHash = crypto
    .createHash("sha256")
    .update(curves.sort().join(","))
    .digest("hex")
    .slice(0, 16);

  const envLang = process.env.LANG || process.env.LC_ALL || "en_US.UTF-8";

  return {
    sslVersion: process.versions.openssl || "3.0.0",
    cryptoCurvesHash: curvesHash,
    environmentLang: envLang,
    nodeVersion: process.version,
  };
}

function probeMemoryLayer(): MemoryLayerTelemetry {
  const totalMem = os.totalmem();
  const heap = process.memoryUsage();
  
  // Deterministic memory signature from total RAM bucket and Node heap structure
  const memorySignature = crypto
    .createHash("sha256")
    .update(`${totalMem}:${Math.round(heap.heapTotal / 1024 / 1024)}MB`)
    .digest("hex")
    .slice(0, 16);

  return {
    totalMemoryBytes: totalMem,
    pageSize: 4096, // Standard OS page size in bytes
    heapTotalBytes: heap.heapTotal,
    memorySignature,
  };
}
