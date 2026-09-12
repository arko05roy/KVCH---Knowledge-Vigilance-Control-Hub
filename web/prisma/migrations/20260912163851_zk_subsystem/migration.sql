-- CreateEnum
CREATE TYPE "ZkJobStatus" AS ENUM ('queued', 'proving', 'verifying', 'attestating', 'publishing', 'submitted', 'anchored', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "ZkClaimStatus" AS ENUM ('pending', 'anchored', 'revoked', 'superseded', 'invalidated', 'expired');

-- CreateEnum
CREATE TYPE "ZkArtifactStatus" AS ENUM ('active', 'paused', 'deprecated', 'invalidated');

-- CreateEnum
CREATE TYPE "ZkDisputeStatus" AS ENUM ('open', 'resolved', 'appealed');

-- CreateEnum
CREATE TYPE "ZkChainStatus" AS ENUM ('pending', 'confirmed');

-- CreateTable
CREATE TABLE "ZkInputBundle" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "adapterKey" TEXT NOT NULL,
    "adapterVersion" TEXT NOT NULL,
    "envelopeDigest" TEXT NOT NULL,
    "envelopeRef" TEXT NOT NULL,
    "schemaVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ZkInputBundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZkEvidenceSnapshot" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "snapshotDigest" TEXT NOT NULL,
    "merkleRoot" TEXT NOT NULL,
    "leafCount" INTEGER NOT NULL,
    "selectionPolicyCode" INTEGER NOT NULL,
    "normalizationCode" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ZkEvidenceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZkCircuitVersion" (
    "id" TEXT NOT NULL,
    "circuitId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "artifactDigest" TEXT NOT NULL,
    "vkDigest" TEXT NOT NULL,
    "proofFlavor" TEXT NOT NULL,
    "status" "ZkArtifactStatus" NOT NULL DEFAULT 'active',
    "registeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ZkCircuitVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZkPolicyVersion" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "policyDigest" TEXT NOT NULL,
    "codebookDigest" TEXT NOT NULL,
    "sourceDigest" TEXT,
    "auditDigest" TEXT,
    "containerDigest" TEXT,
    "status" "ZkArtifactStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ZkPolicyVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZkProofJob" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "claimKind" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "status" "ZkJobStatus" NOT NULL DEFAULT 'queued',
    "inputBundleId" TEXT NOT NULL,
    "circuitVersionId" TEXT NOT NULL,
    "policyVersionId" TEXT NOT NULL,
    "expectedDigest" TEXT,
    "bundleDigest" TEXT,
    "errorCode" TEXT,
    "errorDetail" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "ZkProofJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZkProofBundle" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "bundleDigest" TEXT NOT NULL,
    "refDigest" TEXT NOT NULL,
    "body" JSONB NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ZkProofBundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZkVerifierAttestation" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "verifier" TEXT NOT NULL,
    "decision" INTEGER NOT NULL,
    "reasonCode" INTEGER NOT NULL,
    "nonce" TEXT NOT NULL,
    "issuedAt" BIGINT NOT NULL,
    "deadline" BIGINT NOT NULL,
    "signature" TEXT NOT NULL,
    "digest" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ZkVerifierAttestation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZkClaim" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "claimSeriesId" TEXT NOT NULL,
    "claimVersion" INTEGER NOT NULL,
    "issuerCompanyCode" BIGINT NOT NULL,
    "status" "ZkClaimStatus" NOT NULL DEFAULT 'pending',
    "chainStatus" "ZkChainStatus" NOT NULL DEFAULT 'pending',
    "bundleDigest" TEXT NOT NULL,
    "publicInputDigest" TEXT NOT NULL,
    "disclosureNullifier" TEXT NOT NULL,
    "councilSetId" BIGINT NOT NULL,
    "expiryEpoch" BIGINT NOT NULL,
    "txHash" TEXT,
    "blockNumber" BIGINT,
    "anchoredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZkClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZkEndorsement" (
    "id" TEXT NOT NULL,
    "endorsementId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "targetClaimId" TEXT NOT NULL,
    "endorserCompanyCode" BIGINT NOT NULL,
    "endorsementNullifier" TEXT NOT NULL,
    "matchBandCode" INTEGER NOT NULL,
    "bundleDigest" TEXT NOT NULL,
    "txHash" TEXT,
    "chainStatus" "ZkChainStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ZkEndorsement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZkDispute" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "status" "ZkDisputeStatus" NOT NULL DEFAULT 'open',
    "reasonCode" INTEGER NOT NULL,
    "evidenceDigest" TEXT NOT NULL,
    "resolutionDigest" TEXT,
    "resolutionCode" INTEGER,
    "appealRef" TEXT,
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZkDispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZkChainEvent" (
    "id" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "blockHash" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ZkChainEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZkIndexerCursor" (
    "id" TEXT NOT NULL DEFAULT 'celo',
    "chainId" INTEGER NOT NULL,
    "lastBlock" BIGINT NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZkIndexerCursor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ZkInputBundle_companyId_createdAt_idx" ON "ZkInputBundle"("companyId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ZkInputBundle_companyId_envelopeDigest_key" ON "ZkInputBundle"("companyId", "envelopeDigest");

-- CreateIndex
CREATE UNIQUE INDEX "ZkEvidenceSnapshot_companyId_snapshotDigest_key" ON "ZkEvidenceSnapshot"("companyId", "snapshotDigest");

-- CreateIndex
CREATE UNIQUE INDEX "ZkCircuitVersion_circuitId_key" ON "ZkCircuitVersion"("circuitId");

-- CreateIndex
CREATE INDEX "ZkCircuitVersion_status_idx" ON "ZkCircuitVersion"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ZkPolicyVersion_policyId_key" ON "ZkPolicyVersion"("policyId");

-- CreateIndex
CREATE UNIQUE INDEX "ZkProofJob_idempotencyKey_key" ON "ZkProofJob"("idempotencyKey");

-- CreateIndex
CREATE INDEX "ZkProofJob_companyId_status_createdAt_idx" ON "ZkProofJob"("companyId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ZkProofBundle_jobId_key" ON "ZkProofBundle"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "ZkProofBundle_bundleDigest_key" ON "ZkProofBundle"("bundleDigest");

-- CreateIndex
CREATE INDEX "ZkVerifierAttestation_claimId_idx" ON "ZkVerifierAttestation"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "ZkVerifierAttestation_jobId_verifier_key" ON "ZkVerifierAttestation"("jobId", "verifier");

-- CreateIndex
CREATE UNIQUE INDEX "ZkClaim_claimId_key" ON "ZkClaim"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "ZkClaim_jobId_key" ON "ZkClaim"("jobId");

-- CreateIndex
CREATE INDEX "ZkClaim_companyId_status_idx" ON "ZkClaim"("companyId", "status");

-- CreateIndex
CREATE INDEX "ZkClaim_status_idx" ON "ZkClaim"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ZkEndorsement_endorsementId_key" ON "ZkEndorsement"("endorsementId");

-- CreateIndex
CREATE UNIQUE INDEX "ZkEndorsement_jobId_key" ON "ZkEndorsement"("jobId");

-- CreateIndex
CREATE INDEX "ZkEndorsement_targetClaimId_idx" ON "ZkEndorsement"("targetClaimId");

-- CreateIndex
CREATE UNIQUE INDEX "ZkEndorsement_targetClaimId_endorserCompanyCode_key" ON "ZkEndorsement"("targetClaimId", "endorserCompanyCode");

-- CreateIndex
CREATE INDEX "ZkDispute_claimId_status_idx" ON "ZkDispute"("claimId", "status");

-- CreateIndex
CREATE INDEX "ZkChainEvent_chainId_blockNumber_idx" ON "ZkChainEvent"("chainId", "blockNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ZkChainEvent_chainId_txHash_logIndex_key" ON "ZkChainEvent"("chainId", "txHash", "logIndex");

-- AddForeignKey
ALTER TABLE "ZkProofJob" ADD CONSTRAINT "ZkProofJob_inputBundleId_fkey" FOREIGN KEY ("inputBundleId") REFERENCES "ZkInputBundle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZkProofJob" ADD CONSTRAINT "ZkProofJob_circuitVersionId_fkey" FOREIGN KEY ("circuitVersionId") REFERENCES "ZkCircuitVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZkProofJob" ADD CONSTRAINT "ZkProofJob_policyVersionId_fkey" FOREIGN KEY ("policyVersionId") REFERENCES "ZkPolicyVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZkProofBundle" ADD CONSTRAINT "ZkProofBundle_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ZkProofJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZkVerifierAttestation" ADD CONSTRAINT "ZkVerifierAttestation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ZkProofJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZkClaim" ADD CONSTRAINT "ZkClaim_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ZkProofJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZkEndorsement" ADD CONSTRAINT "ZkEndorsement_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ZkProofJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZkEndorsement" ADD CONSTRAINT "ZkEndorsement_targetClaimId_fkey" FOREIGN KEY ("targetClaimId") REFERENCES "ZkClaim"("claimId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZkDispute" ADD CONSTRAINT "ZkDispute_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "ZkClaim"("claimId") ON DELETE RESTRICT ON UPDATE CASCADE;
