"""KVCH 24/7 Agentic Endpoint Detection and Response (EDR) Daemon Agent.

Main process orchestrating continuous background monitoring across all 7 extension engines
and streaming live kvch.finding/v1 envelopes over WebSocket.
"""

import os
import sys
import time
import json
import signal
import asyncio
import logging
from pathlib import Path
from typing import Dict, Any, List

# Ensure parent path resolution
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from edr_daemon.ws_client import WebSocketClient
from edr_daemon.event_monitors import (
    FileSystemWatcher,
    ProcessAndSocketMonitor,
    NetworkSurfaceScanner,
    run_extension_async
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [KVCH-EDR] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("kvch.agent")


class KVCHAgent:
    """Always-on EDR agent managing background monitoring and WebSocket telemetry streaming."""

    def __init__(self, server_url: str = "ws://localhost:3000/api/ws"):
        self.server_url = server_url
        self.ws_client = WebSocketClient(server_url=server_url)
        self.fs_watcher = FileSystemWatcher(callback=self.handle_finding, poll_interval=3.0)
        self.proc_monitor = ProcessAndSocketMonitor(callback=self.handle_finding, poll_interval=10.0)
        self.net_scanner = NetworkSurfaceScanner(callback=self.handle_finding, poll_interval=60.0)
        self._running = False

    async def handle_finding(self, envelope: Dict[str, Any]):
        """Callback invoked whenever a security finding is detected by any monitor."""
        title = envelope.get("title", "Security Anomaly Detected")
        severity = envelope.get("severity", "MEDIUM")
        logger.info(f"⚡ [ALERT:{severity}] {title}")
        
        # Stream over WebSocket to KVCH Control Hub dashboard
        await self.ws_client.send_finding(envelope)

    async def run_initial_baseline_scan(self):
        """Runs baseline audit across all 8 extensions upon daemon startup."""
        logger.info("Executing initial baseline EDR scan across all 8 extension engines...")
        for ext_num in range(1, 9):
            try:
                logger.info(f"Running baseline extension {ext_num}/8...")
                env = await run_extension_async(ext_num)
                if env:
                    await self.handle_finding(env)
            except Exception as e:
                logger.error(f"Error during baseline scan of extension {ext_num}: {e}")

    async def periodic_refresh_loop(self, interval: float = 15.0):
        """Periodically re-evaluates all 8 extensions every 15 seconds, updating the 8 canonical JSON files."""
        logger.info(f"Periodic extension refresher active (updating 8 report files every {interval}s)")
        while self._running:
            await asyncio.sleep(interval)
            for ext_num in range(1, 9):
                try:
                    env = await run_extension_async(ext_num)
                    if env:
                        await self.handle_finding(env)
                except Exception as e:
                    logger.error(f"Error during periodic refresh of extension {ext_num}: {e}")

    async def start(self):
        """Starts the EDR agent daemon loops."""
        self._running = True
        logger.info("==========================================================")
        logger.info("    KVCH 24/7 AGENTIC EDR DAEMON INITIALIZING              ")
        logger.info("==========================================================")
        logger.info(f"WebSocket Telemetry Target: {self.server_url}")

        # Start WebSocket client loop
        ws_task = asyncio.create_task(self.ws_client.run_loop())

        # Execute initial baseline scan
        await self.run_initial_baseline_scan()

        # Launch continuous monitors concurrently
        tasks = [
            ws_task,
            asyncio.create_task(self.fs_watcher.start()),
            asyncio.create_task(self.proc_monitor.start()),
            asyncio.create_task(self.net_scanner.start()),
            asyncio.create_task(self.periodic_refresh_loop(15.0)),
        ]

        logger.info("KVCH 24/7 EDR Agent is active and monitoring in background.")

        try:
            await asyncio.gather(*tasks)
        except asyncio.CancelledError:
            logger.info("EDR Agent shutdown requested.")
        finally:
            self.stop()

    def stop(self):
        self._running = False
        self.fs_watcher.stop()
        self.proc_monitor.stop()
        self.net_scanner.stop()
        self.ws_client.stop()
        logger.info("KVCH EDR Agent daemon stopped cleanly.")


def main():
    server_url = os.environ.get("KVCH_WS_URL", "ws://localhost:3000/api/ws")
    agent = KVCHAgent(server_url=server_url)

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    def handle_signal():
        logger.info("Signal received. Stopping KVCH EDR Agent...")
        agent.stop()
        for task in asyncio.all_tasks(loop):
            task.cancel()

    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, handle_signal)
        except NotImplementedError:
            pass

    try:
        loop.run_until_complete(agent.start())
    except (KeyboardInterrupt, SystemExit, asyncio.CancelledError):
        pass
    finally:
        loop.close()


if __name__ == "__main__":
    main()
