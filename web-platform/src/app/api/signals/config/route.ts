import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SignalConfig = {
  analysisDelayMin?: number;
  analysisDelayMax?: number;
};

export async function GET() {
  const row = await prisma.siteSettings.findUnique({
    where: { key: "on_demand_signal_config" },
  });

  const config = (row?.value as SignalConfig | null) ?? {};

  return NextResponse.json({
    analysisDelayMin: config.analysisDelayMin ?? 5,
    analysisDelayMax: config.analysisDelayMax ?? 12,
  });
}
