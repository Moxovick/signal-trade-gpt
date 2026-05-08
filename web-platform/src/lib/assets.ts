/**
 * Asset whitelist helpers — read/write the `assets` table.
 *
 * All admin and signal-publisher logic should go through this module.
 */
import { prisma } from "@/lib/prisma";
import { SEED_ASSETS } from "@/lib/asset-seed";
import type { AssetModel as Asset } from "@/generated/prisma/models/Asset";
import type { AssetCategory, SignalTier } from "@/generated/prisma/enums";

export type { Asset, AssetCategory, SignalTier };

/**
 * Idempotent seed. Inserts any asset that doesn't yet exist by `symbol`,
 * never updates existing rows (admin edits are sacred).
 */
export async function seedAssetsIfMissing(): Promise<{ inserted: number }> {
  const existing = await prisma.asset.findMany({ select: { symbol: true } });
  const have = new Set(existing.map((a) => a.symbol));
  let inserted = 0;
  let pos = 0;
  for (const a of SEED_ASSETS) {
    pos++;
    if (have.has(a.symbol)) continue;
    await prisma.asset.create({
      data: {
        symbol: a.symbol,
        displaySymbol: a.displaySymbol,
        category: a.category,
        isOtc: a.isOtc,
        payoutPct: a.payoutPct,
        signalTier: a.signalTier,
        provider: a.provider,
        providerSymbol: a.providerSymbol ?? null,
        position: pos,
        isActive: true,
      },
    });
    inserted++;
  }
  return { inserted };
}

/** All active assets, sorted by position. */
export async function listActiveAssets(): Promise<Asset[]> {
  return prisma.asset.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { position: "asc" }, { symbol: "asc" }],
  });
}

/** All assets (active + inactive) for admin UI. */
export async function listAllAssets(): Promise<Asset[]> {
  return prisma.asset.findMany({
    orderBy: [{ category: "asc" }, { position: "asc" }, { symbol: "asc" }],
  });
}

export async function findAssetBySymbol(symbol: string): Promise<Asset | null> {
  return prisma.asset.findUnique({ where: { symbol } });
}
