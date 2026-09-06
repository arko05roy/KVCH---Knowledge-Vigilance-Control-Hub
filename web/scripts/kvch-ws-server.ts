import http from "node:http";
import crypto from "node:crypto";
import { parseFindingsJsonl } from "../lib/judge/findings";

const PORT = parseInt(process.env.KVCH_WS_PORT || "3000", 10);
const WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

interface ClientSocket {
  socket: import("node:net").Socket;
  isAgent: boolean;
}

const clients = new Set<ClientSocket>();

function buildHandshakeResponse(secKey: string): string {
  const acceptKey = crypto.createHash("sha1").update(secKey + WS_GUID).digest("base64");
  return [
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${acceptKey}`,
    "\r\n"
  ].join("\r\n");
}

function decodeWsFrame(buffer: Buffer): { opcode: number; payload: Buffer } | null {
  if (buffer.length < 2) return null;
  const firstByte = buffer[0];
  const secondByte = buffer[1];
  
  const opcode = firstByte & 0x0f;
  const isMasked = (secondByte & 0x80) !== 0;
  let payloadLen = secondByte & 0x7f;
  let offset = 2;

  if (payloadLen === 126) {
    if (buffer.length < 4) return null;
    payloadLen = buffer.readUInt16BE(2);
    offset = 4;
  } else if (payloadLen === 127) {
    if (buffer.length < 10) return null;
    payloadLen = Number(buffer.readBigUInt64BE(2));
    offset = 10;
  }

  let maskKey: Buffer | null = null;
  if (isMasked) {
    if (buffer.length < offset + 4) return null;
    maskKey = buffer.subarray(offset, offset + 4);
    offset += 4;
  }

  if (buffer.length < offset + payloadLen) return null;

  const rawPayload = buffer.subarray(offset, offset + payloadLen);
  if (isMasked && maskKey) {
    const unmasked = Buffer.alloc(payloadLen);
    for (let i = 0; i < payloadLen; i++) {
      unmasked[i] = rawPayload[i] ^ maskKey[i % 4];
    }
    return { opcode, payload: unmasked };
  }

  return { opcode, payload: rawPayload };
}

function encodeWsFrame(data: string, opcode = 0x1): Buffer {
  const payload = Buffer.from(data, "utf-8");
  const length = payload.length;

  let header: Buffer;
  if (length <= 125) {
    header = Buffer.alloc(2);
    header[0] = 0x80 | opcode;
    header[1] = length;
  } else if (length <= 65535) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(length), 2);
  }

  return Buffer.concat([header, payload]);
}

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "healthy", activeClients: clients.size }));
    return;
  }
  res.writeHead(404);
  res.end();
});

server.on("upgrade", (req, socket, head) => {
  const secKey = req.headers["sec-websocket-key"];
  if (!secKey) {
    socket.destroy();
    return;
  }

  socket.write(buildHandshakeResponse(secKey));
  const client: ClientSocket = { socket, isAgent: req.headers["user-agent"]?.includes("KVCH") ?? false };
  clients.add(client);

  console.info(`[KVCH WS] Client connected (Agent: ${client.isAgent}) from ${socket.remoteAddress}`);

  socket.on("data", (chunk) => {
    const frame = decodeWsFrame(chunk);
    if (!frame) return;

    if (frame.opcode === 0x8) {
      // Close frame
      clients.delete(client);
      socket.end();
      return;
    }

    if (frame.opcode === 0x9) {
      // Ping frame -> send Pong
      socket.write(encodeWsFrame("pong", 0xa));
      return;
    }

    if (frame.opcode === 0x1) {
      // Text frame
      const text = frame.payload.toString("utf-8");
      try {
        const findings = parseFindingsJsonl(text);
        for (const finding of findings) {
          console.info(`⚡ [KVCH WS REALTIME FINDING] [${finding.severity}] ${finding.title}`);
          // Broadcast finding to all connected dashboard UI clients
          const broadcastFrame = encodeWsFrame(JSON.stringify(finding));
          for (const c of clients) {
            if (!c.isAgent) {
              c.socket.write(broadcastFrame);
            }
          }
        }
      } catch (err) {
        console.warn(`[KVCH WS] Received non-envelope or unparseable data: ${err instanceof Error ? err.message : err}`);
      }
    }
  });

  socket.on("close", () => {
    clients.delete(client);
    console.info(`[KVCH WS] Client disconnected.`);
  });

  socket.on("error", (err) => {
    clients.delete(client);
    console.error(`[KVCH WS] Socket error: ${err.message}`);
  });
});

server.listen(PORT, () => {
  console.info(`==========================================================`);
  console.info(`    KVCH CONTROL HUB WEBSOCKET SERVER ACTIVE ON PORT ${PORT} `);
  console.info(`==========================================================`);
});
