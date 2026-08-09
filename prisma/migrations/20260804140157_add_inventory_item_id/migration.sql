-- AlterTable
ALTER TABLE "WaitlistSignup" ADD COLUMN "inventoryItemId" TEXT;

-- CreateIndex
CREATE INDEX "WaitlistSignup_inventoryItemId_idx" ON "WaitlistSignup"("inventoryItemId");
