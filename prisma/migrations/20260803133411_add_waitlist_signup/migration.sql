-- CreateTable
CREATE TABLE "WaitlistSignup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopDomain" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifiedAt" DATETIME
);

-- CreateIndex
CREATE INDEX "WaitlistSignup_shopDomain_productId_idx" ON "WaitlistSignup"("shopDomain", "productId");
