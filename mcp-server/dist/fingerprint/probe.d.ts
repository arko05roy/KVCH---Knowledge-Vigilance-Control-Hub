import type { FiveLayerTelemetry } from "./types.js";
/**
 * Probes the local host system across 5 architectural layers:
 * 1. OS / Host
 * 2. Network (IP / Interface)
 * 3. Transport (TCP / Sockets)
 * 4. Presentation (TLS / Crypto Curves)
 * 5. Memory (Physical RAM & Heap profile)
 */
export declare function probeFiveLayers(): FiveLayerTelemetry;
