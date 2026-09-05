import "server-only";
import { CronExpressionParser } from "cron-parser";
import type { ArtifactState } from "@prisma/client";
import type { ExtensionManifest } from "@arko05roy/kvch-extension";

export interface DeploymentPersistence {
  getArtifactForDeployment(artifactId: string): Promise<{ id: string; state: ArtifactState; manifest: ExtensionManifest } | null>;
  createDeployment(input: { artifactId: string; schedule: string; nextRunAt: Date }): Promise<{ deployment: { id: string; schedule: string; nextRunAt: Date | null }; created: boolean }>;
}

export class DeploymentService {
  constructor(private readonly persistence: DeploymentPersistence) {}

  async create(artifactId: string, now = new Date()) {
    const artifact = await this.persistence.getArtifactForDeployment(artifactId);
    if (!artifact) throw new Error(`Artifact not found for deployment: ${artifactId}`);
    if (artifact.state !== "deployable") throw new Error("Only a deployable artifact can be deployed");
    const schedule = artifact.manifest.deployment.schedule;
    const nextRunAt = CronExpressionParser.parse(schedule, { currentDate: now }).next().toDate();
    return this.persistence.createDeployment({ artifactId: artifact.id, schedule, nextRunAt });
  }
}
