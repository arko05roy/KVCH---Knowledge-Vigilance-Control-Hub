-- CreateEnum
CREATE TYPE "ZkJoinKind" AS ENUM ('verifier', 'company');

-- CreateEnum
CREATE TYPE "ZkJoinStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "ZkJoinRequest" (
    "id" TEXT NOT NULL,
    "kind" "ZkJoinKind" NOT NULL,
    "status" "ZkJoinStatus" NOT NULL DEFAULT 'pending',
    "walletAddress" TEXT,
    "companyCode" TEXT,
    "label" TEXT,
    "note" TEXT,
    "chainId" INTEGER,
    "councilSetId" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "ZkJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ZkJoinRequest_kind_status_idx" ON "ZkJoinRequest"("kind", "status");

-- CreateIndex
CREATE INDEX "ZkJoinRequest_walletAddress_idx" ON "ZkJoinRequest"("walletAddress");
