-- CreateEnum
CREATE TYPE "AssetCategory" AS ENUM ('currency', 'crypto', 'commodity', 'stock', 'index');

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "displaySymbol" TEXT NOT NULL,
    "category" "AssetCategory" NOT NULL,
    "isOtc" BOOLEAN NOT NULL DEFAULT false,
    "payoutPct" INTEGER NOT NULL DEFAULT 0,
    "signalTier" "SignalTier" NOT NULL DEFAULT 'otc',
    "provider" TEXT NOT NULL DEFAULT 'none',
    "providerSymbol" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assets_symbol_key" ON "assets"("symbol");

-- CreateIndex
CREATE INDEX "assets_category_isActive_idx" ON "assets"("category", "isActive");

-- CreateIndex
CREATE INDEX "assets_signalTier_isActive_idx" ON "assets"("signalTier", "isActive");
