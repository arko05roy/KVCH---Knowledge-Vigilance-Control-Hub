export interface WebSocketEvent {
  type: "kvch.finding.created" | "kvch.analysis.completed" | "kvch.dashboard.refresh";
  timestamp: string;
  payload: Record<string, any>;
}

type EventListener = (event: WebSocketEvent) => void;

class WebSocketBroadcastGateway {
  private listeners: Set<EventListener> = new Set();

  public subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public broadcast(type: WebSocketEvent["type"], payload: Record<string, any> = {}): void {
    const event: WebSocketEvent = {
      type,
      timestamp: new Date().toISOString(),
      payload
    };

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("[WebSocket Gateway] Broadcast listener error:", err);
      }
    }
  }
}

export const wsGateway = new WebSocketBroadcastGateway();

export function broadcastFindingCreated(findingPayload: Record<string, any>): void {
  wsGateway.broadcast("kvch.finding.created", findingPayload);
}

export function broadcastAnalysisCompleted(analysisPayload: Record<string, any>): void {
  wsGateway.broadcast("kvch.analysis.completed", analysisPayload);
}

export function broadcastDashboardRefresh(): void {
  wsGateway.broadcast("kvch.dashboard.refresh", { triggeredAt: new Date().toISOString() });
}
