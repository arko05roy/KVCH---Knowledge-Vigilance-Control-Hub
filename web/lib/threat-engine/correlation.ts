/**
 * Cross-Host & Lateral Movement Correlation Layer (Section 6)
 * Aggregates windowed metrics over 10m/24h across fleet endpoints.
 */

interface FleetEvent {
  timestamp: number;
  host_id: string;
  dst_ip: string;
  sha256: string;
  bytes_sent: number;
}

class CrossHostCorrelationEngine {
  private events: FleetEvent[] = [];

  public recordEvent(event: Omit<FleetEvent, "timestamp">) {
    this.events.push({
      ...event,
      timestamp: Date.now(),
    });
    // Prune events older than 24 hours
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    this.events = this.events.filter((e) => e.timestamp >= cutoff);
  }

  public queryCorrelation(dst_ip: string, sha256: string): {
    same_destination_host_count_10min: number;
    same_binary_hash_host_count_10min: number;
    cumulative_bytes_sent_24h: number;
    fleet_wide_first_seen: boolean;
  } {
    const now = Date.now();
    const tenMinAgo = now - 10 * 60 * 1000;

    const recentEvents = this.events.filter((e) => e.timestamp >= tenMinAgo);

    const dstHosts = new Set(recentEvents.filter((e) => e.dst_ip === dst_ip).map((e) => e.host_id));
    const hashHosts = new Set(recentEvents.filter((e) => e.sha256 === sha256).map((e) => e.host_id));

    const totalBytes24h = this.events
      .filter((e) => e.dst_ip === dst_ip)
      .reduce((acc, e) => acc + e.bytes_sent, 0);

    return {
      same_destination_host_count_10min: Math.max(1, dstHosts.size),
      same_binary_hash_host_count_10min: Math.max(1, hashHosts.size),
      cumulative_bytes_sent_24h: totalBytes24h,
      fleet_wide_first_seen: dstHosts.size <= 1 && totalBytes24h < 1000000,
    };
  }
}

export const fleetCorrelationEngine = new CrossHostCorrelationEngine();
