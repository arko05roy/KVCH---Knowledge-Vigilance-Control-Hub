"""WebSocket Client & Telemetry Reporter for KVCH EDR Agent.

Supports RFC 6455 WebSocket framing, automatic reconnect with exponential backoff,
heartbeat pings, and offline report backup.
"""

import os
import sys
import json
import time
import socket
import struct
import base64
import hashlib
import asyncio
import logging
import urllib.parse
from pathlib import Path
from typing import Dict, Any, List, Optional, Callable

logger = logging.getLogger("kvch.ws_client")


class WebSocketClient:
    """Lightweight, zero-dependency async WebSocket client for telemetry streaming."""

    def __init__(self, server_url: str = "ws://localhost:3000/api/ws", backup_dir: Optional[Path] = None):
        self.server_url = server_url
        self.backup_dir = backup_dir or (Path(__file__).resolve().parent.parent / "reports")
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        
        parsed = urllib.parse.urlparse(server_url)
        self.host = parsed.hostname or "localhost"
        self.port = parsed.port or (443 if parsed.scheme == "wss" else 3000)
        self.path = parsed.path or "/api/ws"
        self.is_ssl = (parsed.scheme == "wss")
        
        self.connected = False
        self._reader: Optional[asyncio.StreamReader] = None
        self._writer: Optional[asyncio.StreamWriter] = None
        self.queue: asyncio.Queue = asyncio.Queue()
        self._running = False
        self._reconnect_delay = 2.0

    async def connect(self) -> bool:
        """Establishes WebSocket connection and completes RFC 6455 handshake."""
        try:
            sec_key = base64.b64encode(os.urandom(16)).decode('utf-8')
            
            if self.is_ssl:
                import ssl
                ctx = ssl.create_default_context()
                self._reader, self._writer = await asyncio.open_connection(
                    self.host, self.port, ssl=ctx
                )
            else:
                self._reader, self._writer = await asyncio.open_connection(
                    self.host, self.port
                )

            headers = [
                f"GET {self.path} HTTP/1.1",
                f"Host: {self.host}:{self.port}",
                "Upgrade: websocket",
                "Connection: Upgrade",
                f"Sec-WebSocket-Key: {sec_key}",
                "Sec-WebSocket-Version: 13",
                "User-Agent: KVCH-EDR-Agent/1.0",
                "\r\n"
            ]

            self._writer.write("\r\n".join(headers).encode('utf-8'))
            await self._writer.drain()

            # Read response headers
            response = await asyncio.wait_for(self._reader.readuntil(b"\r\n\r\n"), timeout=5.0)
            res_str = response.decode('utf-8', errors='ignore')

            if "101 Switching Protocols" in res_str or "101" in res_str.split("\r\n")[0]:
                self.connected = True
                self._reconnect_delay = 2.0
                logger.info(f"Connected to KVCH WebSocket server at {self.server_url}")
                return True
            else:
                logger.warning(f"Handshake rejected by {self.server_url}: {res_str[:100]}")
                self._close_socket()
                return False

        except Exception as e:
            logger.warning(f"WebSocket connection attempt failed ({self.server_url}): {e}")
            self._close_socket()
            return False

    def _close_socket(self):
        self.connected = False
        if self._writer:
            try:
                self._writer.close()
            except Exception:
                pass
            self._writer = None
        self._reader = None

    def _encode_frame(self, opcode: int, data: bytes) -> bytes:
        """Encodes a WebSocket client frame (RFC 6455, masked)."""
        length = len(data)
        fin_opcode = 0x80 | (opcode & 0x0F)
        mask_key = os.urandom(4)
        
        frame = bytearray()
        frame.append(fin_opcode)
        
        if length <= 125:
            frame.append(0x80 | length)
        elif length <= 65535:
            frame.append(0x80 | 126)
            frame.extend(struct.pack("!H", length))
        else:
            frame.append(0x80 | 127)
            frame.extend(struct.pack("!Q", length))
            
        frame.extend(mask_key)
        
        masked_data = bytearray(length)
        for i in range(length):
            masked_data[i] = data[i] ^ mask_key[i % 4]
            
        frame.extend(masked_data)
        return bytes(frame)

    async def send_finding(self, envelope: Dict[str, Any]) -> bool:
        """Queues a kvch.finding/v1 envelope report to be sent over WebSocket."""
        # Always backup to local report directory first for persistence
        self._backup_locally(envelope)
        
        payload_bytes = json.dumps(envelope).encode('utf-8')
        if self.connected and self._writer:
            try:
                frame = self._encode_frame(0x1, payload_bytes) # 0x1 = text frame
                self._writer.write(frame)
                await self._writer.drain()
                logger.info(f"Pushed live finding '{envelope.get('title')}' via WebSocket")
                return True
            except Exception as e:
                logger.error(f"Failed to transmit frame over WebSocket: {e}")
                self.connected = False
                
        # Queue for retry when reconnected
        await self.queue.put(envelope)
        return False

    def _backup_locally(self, envelope: Dict[str, Any]):
        """Saves copy of report envelope to local reports folder."""
        try:
            scanner_name = envelope.get("details", {}).get("auditor_version") or envelope.get("category", "finding")
            scanner_name = str(scanner_name).replace(" ", "_").lower()
            timestamp = time.strftime("%Y%m%d_%H%M%S")
            filename = f"finding_{scanner_name}_{timestamp}.json"
            filepath = self.backup_dir / filename
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(envelope, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to backup finding report locally: {e}")

    async def run_loop(self):
        """Background loop managing connection maintenance, reconnects, and heartbeats."""
        self._running = True
        while self._running:
            if not self.connected:
                success = await self.connect()
                if not success:
                    await asyncio.sleep(self._reconnect_delay)
                    self._reconnect_delay = min(self._reconnect_delay * 1.5, 30.0)
                    continue
            
            # Connection is active: send any queued items
            while not self.queue.empty() and self.connected:
                item = await self.queue.get()
                await self.send_finding(item)
                
            # Send heartbeat ping every 20 seconds
            try:
                ping_frame = self._encode_frame(0x9, b"ping") # 0x9 = ping frame
                if self._writer:
                    self._writer.write(ping_frame)
                    await self._writer.drain()
            except Exception:
                self._close_socket()
                
            await asyncio.sleep(20.0)

    def stop(self):
        self._running = False
        self._close_socket()
