CREATE TYPE "ArtifactState" AS ENUM ('uploaded', 'evaluating', 'deployable', 'evaluation_failed', 'runtime_unsupported');
CREATE TYPE "EvaluationStatus" AS ENUM ('queued', 'running', 'passed', 'failed');
CREATE TYPE "DeploymentStatus" AS ENUM ('active', 'paused', 'failed');
CREATE TYPE "RunStatus" AS ENUM ('queued', 'running', 'healthy', 'finding', 'failed');

CREATE TABLE "Extension" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "manifestId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Extension_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Extension_companyId_manifestId_key" ON "Extension"("companyId", "manifestId");
CREATE INDEX "Extension_companyId_createdAt_idx" ON "Extension"("companyId", "createdAt");

CREATE TABLE "Artifact" (
  "id" TEXT NOT NULL,
  "extensionId" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "sha256" TEXT NOT NULL,
  "storageKey" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "manifest" JSONB NOT NULL,
  "adapterKey" TEXT,
  "state" "ArtifactState" NOT NULL DEFAULT 'uploaded',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Artifact_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Artifact_companyId_sha256_key" ON "Artifact"("companyId", "sha256");
CREATE UNIQUE INDEX "Artifact_storageKey_key" ON "Artifact"("storageKey");
CREATE INDEX "Artifact_extensionId_createdAt_idx" ON "Artifact"("extensionId", "createdAt");

CREATE TABLE "Evaluation" (
  "id" TEXT NOT NULL,
  "artifactId" TEXT NOT NULL,
  "adapterKey" TEXT,
  "adapterVersion" TEXT,
  "status" "EvaluationStatus" NOT NULL DEFAULT 'queued',
  "startedAt" TIMESTAMP(3),
  "finishedAt" TIMESTAMP(3),
  "commandResults" JSONB,
  "stdout" TEXT,
  "stderr" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Evaluation_artifactId_createdAt_idx" ON "Evaluation"("artifactId", "createdAt");

CREATE TABLE "Deployment" (
  "id" TEXT NOT NULL,
  "artifactId" TEXT NOT NULL,
  "schedule" TEXT NOT NULL,
  "status" "DeploymentStatus" NOT NULL DEFAULT 'active',
  "nextRunAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Deployment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Deployment_artifactId_status_idx" ON "Deployment"("artifactId", "status");
CREATE INDEX "Deployment_status_nextRunAt_idx" ON "Deployment"("status", "nextRunAt");

CREATE TABLE "ScheduledExtensionRun" (
  "id" TEXT NOT NULL,
  "deploymentId" TEXT NOT NULL,
  "artifactId" TEXT NOT NULL,
  "dueAt" TIMESTAMP(3) NOT NULL,
  "startedAt" TIMESTAMP(3),
  "finishedAt" TIMESTAMP(3),
  "status" "RunStatus" NOT NULL DEFAULT 'queued',
  "exitCode" INTEGER,
  "commandResults" JSONB,
  "stdout" TEXT,
  "stderr" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ScheduledExtensionRun_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ScheduledExtensionRun_deploymentId_dueAt_key" ON "ScheduledExtensionRun"("deploymentId", "dueAt");
CREATE INDEX "ScheduledExtensionRun_artifactId_createdAt_idx" ON "ScheduledExtensionRun"("artifactId", "createdAt");

CREATE TABLE "Finding" (
  "id" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "artifactId" TEXT NOT NULL,
  "envelope" JSONB NOT NULL,
  "severity" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "observedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Finding_artifactId_observedAt_idx" ON "Finding"("artifactId", "observedAt");
CREATE INDEX "Finding_runId_idx" ON "Finding"("runId");

ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_extensionId_fkey" FOREIGN KEY ("extensionId") REFERENCES "Extension"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ScheduledExtensionRun" ADD CONSTRAINT "ScheduledExtensionRun_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ScheduledExtensionRun" ADD CONSTRAINT "ScheduledExtensionRun_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ScheduledExtensionRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
