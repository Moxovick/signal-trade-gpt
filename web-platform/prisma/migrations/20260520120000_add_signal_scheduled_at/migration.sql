-- AlterTable: add scheduledAt to signals
ALTER TABLE "signals" ADD COLUMN "scheduledAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "signals_scheduledAt_idx" ON "signals"("scheduledAt");
