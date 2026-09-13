export interface InternEscalation {
  id: string;
  internName: string;
  internId: string;
  role: string;
  avatarUrl?: string;
  team: string;
  riskScore: number;
  status: "ACTIVE_VIOLATION" | "WARNING" | "CLEAN";
  flaggedViolation: string;
  evidenceCode: string;
  flaggedExtension: string;
  escalatedAction?: "FIRE_REVIEW" | "MANDATORY_TRAINING" | "DISMISSED" | null;
  escalationStatus: "PENDING_HR_REVIEW" | "TRAINING_ENROLLED" | "OFFBOARDED" | "DISMISSED" | "UNESCALATED";
  escalatedAt?: string;
  escalatedBy?: string;
  notes?: string;
}

// In-memory persistent store shared across API routes in dev
export const INITIAL_INTERNS: InternEscalation[] = [
  {
    id: "INT-881",
    internName: "Alex Rivera",
    internId: "INT-2026-0881",
    role: "Junior Security & Web Intern",
    team: "Edge Infrastructure",
    riskScore: 88,
    status: "ACTIVE_VIOLATION",
    flaggedViolation: "Committed raw AWS Access Key & unencrypted WireGuard private key to feature/auth-bypass without GPG commit signature.",
    evidenceCode: "export AWS_SECRET_ACCESS_KEY='wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' \n# WireGuard PrivateKey = aX9+... (leaked in git history)",
    flaggedExtension: "credential-exposure-auditor & edgeguard-sentinel",
    escalatedAction: null,
    escalationStatus: "UNESCALATED",
  },
  {
    id: "INT-882",
    internName: "Maya Chen",
    internId: "INT-2026-0882",
    role: "Frontend Engineering Intern",
    team: "Web Client UI",
    riskScore: 36,
    status: "WARNING",
    flaggedViolation: "Attempted to mount unverified third-party npm package 'turbo-eval-helpers' with known critical CVE-2026-881.",
    evidenceCode: "npm i --save-dev turbo-eval-helpers@0.1.4 # Flagged by supply-chain-auditor",
    flaggedExtension: "supply-chain-auditor",
    escalatedAction: null,
    escalationStatus: "UNESCALATED",
  },
  {
    id: "INT-883",
    internName: "Samir Patel",
    internId: "INT-2026-0883",
    role: "Backend Platform Intern",
    team: "API Kernel",
    riskScore: 6,
    status: "CLEAN",
    flaggedViolation: "No policy violations. All pull requests passed deterministic sandboxed build checks.",
    evidenceCode: "# All unit tests passing: 42/42. Signed GPG: 0x9B8A7C6E",
    flaggedExtension: "clean-baseline",
    escalatedAction: null,
    escalationStatus: "UNESCALATED",
  },
];

class EscalationStore {
  private interns: InternEscalation[] = [...INITIAL_INTERNS];

  public getAll(): InternEscalation[] {
    return this.interns;
  }

  public getEscalated(): InternEscalation[] {
    return this.interns.filter((i) => i.escalationStatus !== "UNESCALATED");
  }

  public escalate(id: string, action: "FIRE_REVIEW" | "MANDATORY_TRAINING", notes?: string): InternEscalation | null {
    const idx = this.interns.findIndex((i) => i.id === id);
    if (idx === -1) return null;

    this.interns[idx] = {
      ...this.interns[idx],
      escalatedAction: action,
      escalationStatus: "PENDING_HR_REVIEW",
      escalatedAt: new Date().toISOString(),
      escalatedBy: "Rohit Debnath (Senior Lead Engineer)",
      notes: notes || (action === "FIRE_REVIEW" ? "Severe IP security exfiltration risk flagged for immediate termination" : "Enrolled in 14-day mandatory compliance remediation"),
    };

    return this.interns[idx];
  }

  public resolveByHr(id: string, resolution: "TRAINING_ENROLLED" | "OFFBOARDED" | "DISMISSED"): InternEscalation | null {
    const idx = this.interns.findIndex((i) => i.id === id);
    if (idx === -1) return null;

    this.interns[idx] = {
      ...this.interns[idx],
      escalationStatus: resolution,
    };

    return this.interns[idx];
  }

  public reset(): void {
    this.interns = [...INITIAL_INTERNS];
  }
}

// Global singleton for Next.js hot-reload persistence
const globalForEscalations = globalThis as unknown as {
  escalationStoreInstance?: EscalationStore;
};

export const escalationStore = globalForEscalations.escalationStoreInstance || new EscalationStore();
if (process.env.NODE_ENV !== "production") {
  globalForEscalations.escalationStoreInstance = escalationStore;
}
