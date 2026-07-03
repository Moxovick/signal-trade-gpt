-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('new', 'processed', 'cancelled');

-- AlterEnum
ALTER TYPE "PostbackEvent" ADD VALUE 'withdrawal';

-- AlterTable
ALTER TABLE "postbacks" ADD COLUMN     "browser" TEXT,
ADD COLUMN     "campaignId" TEXT,
ADD COLUMN     "campaignName" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "deviceType" TEXT,
ADD COLUMN     "eventDate" TEXT,
ADD COLUMN     "linkType" TEXT,
ADD COLUMN     "osVersion" TEXT,
ADD COLUMN     "promo" TEXT,
ADD COLUMN     "siteId" TEXT,
ADD COLUMN     "subId1" TEXT,
ADD COLUMN     "subId2" TEXT,
ADD COLUMN     "subId3" TEXT,
ADD COLUMN     "subId4" TEXT,
ADD COLUMN     "subId5" TEXT,
ADD COLUMN     "withdrawalStatus" "WithdrawalStatus";

-- CreateIndex
CREATE INDEX "postbacks_clickId_idx" ON "postbacks"("clickId");

-- CreateIndex
CREATE INDEX "postbacks_campaignId_idx" ON "postbacks"("campaignId");

-- CreateIndex
CREATE INDEX "postbacks_siteId_idx" ON "postbacks"("siteId");
