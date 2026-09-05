import "server-only";
import { CronExpressionParser } from "cron-parser";
import type { DeploymentStatus } from "@prisma/client";

export interface DeploymentControlPersistence {
  setDeploymentStatus(input: { artifactId: string; deploymentId: string; status: DeploymentStatus; nextRunAt: Date | null }): Promise<{ id: string; status: DeploymentStatus; nextRunAt: Date | null } | null>;
}

export class DeploymentControlService {
  constructor(private readonly persistence: DeploymentControlPersistence) {}
  pause(artifactId: string, deploymentId: string) { return this.persistence.setDeploymentStatus({ artifactId, deploymentId, status: "paused", nextRunAt: null }); }
  resume(artifactId: string, deploymentId: string, schedule: string, now = new Date()) {
    const nextRunAt = CronExpressionParser.parse(schedule, { currentDate: now }).next().toDate();
    return this.persistence.setDeploymentStatus({ artifactId, deploymentId, status: "active", nextRunAt });
  }
}
