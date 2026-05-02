import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Make BigInt JSON-serializable globally. Prisma returns telegramId & similar
// fields as BigInt, but `JSON.stringify` throws "Do not know how to serialize a
// BigInt" — coerce to string everywhere.
declare global {
  interface BigInt {
    toJSON(): string;
  }
}
if (typeof (BigInt.prototype as unknown as { toJSON?: () => string }).toJSON !== "function") {
  (BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
    return this.toString();
  };
}

function createPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: ReturnType<typeof createPrisma> };

export const prisma = globalForPrisma.prisma || createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
