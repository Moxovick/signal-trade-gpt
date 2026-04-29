
-- CreateEnum
CREATE TYPE "POAccountStatus" AS ENUM ('pending', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "PostbackEvent" AS ENUM ('registration', 'email_confirm', 'ftd', 'redeposit', 'commission');

-- AlterTable
ALTER TABLE "deposits" ADD COLUMN     "isFirst" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "postbackId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "tier" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "po_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "poTraderId" TEXT NOT NULL,
    "status" "POAccountStatus" NOT NULL DEFAULT 'pending',
    "source" TEXT NOT NULL DEFAULT 'postback',
    "affiliateLevel" INTEGER NOT NULL DEFAULT 1,
    "registeredAt" TIMESTAMP(3),
    "emailConfirmedAt" TIMESTAMP(3),
    "ftdAt" TIMESTAMP(3),
    "ftdAmount" DECIMAL(65,30),
    "totalDeposit" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalRevShare" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lastPostbackAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "po_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postbacks" (
    "id" TEXT NOT NULL,
    "poAccountId" TEXT,
    "eventType" "PostbackEvent" NOT NULL,
    "rawPayload" JSONB NOT NULL,
    "clickId" TEXT,
    "poTraderId" TEXT,
    "amount" DECIMAL(65,30),
    "currency" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signature" TEXT,
    "dedupeKey" TEXT NOT NULL,

    CONSTRAINT "postbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bot_perks" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "minTier" INTEGER NOT NULL DEFAULT 1,
    "config" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bot_perks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "po_accounts_userId_key" ON "po_accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "po_accounts_poTraderId_key" ON "po_accounts"("poTraderId");

-- CreateIndex
CREATE INDEX "po_accounts_poTraderId_idx" ON "po_accounts"("poTraderId");

-- CreateIndex
CREATE INDEX "po_accounts_status_idx" ON "po_accounts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "postbacks_dedupeKey_key" ON "postbacks"("dedupeKey");

-- CreateIndex
CREATE INDEX "postbacks_poTraderId_idx" ON "postbacks"("poTraderId");

-- CreateIndex
CREATE INDEX "postbacks_receivedAt_idx" ON "postbacks"("receivedAt");

-- CreateIndex
CREATE INDEX "postbacks_eventType_idx" ON "postbacks"("eventType");

-- CreateIndex
CREATE UNIQUE INDEX "bot_perks_code_key" ON "bot_perks"("code");

-- CreateIndex
CREATE INDEX "bot_perks_minTier_isActive_idx" ON "bot_perks"("minTier", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "deposits_postbackId_key" ON "deposits"("postbackId");

-- CreateIndex
CREATE INDEX "users_tier_idx" ON "users"("tier");

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_postbackId_fkey" FOREIGN KEY ("postbackId") REFERENCES "postbacks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "po_accounts" ADD CONSTRAINT "po_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postbacks" ADD CONSTRAINT "postbacks_poAccountId_fkey" FOREIGN KEY ("poAccountId") REFERENCES "po_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

