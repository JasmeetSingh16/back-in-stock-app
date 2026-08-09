-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpires" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitlistSignup" (
    "id" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "inventoryItemId" TEXT,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifiedAt" TIMESTAMP(3),

    CONSTRAINT "WaitlistSignup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WaitlistSignup_shopDomain_productId_idx" ON "WaitlistSignup"("shopDomain", "productId");

-- CreateIndex
CREATE INDEX "WaitlistSignup_inventoryItemId_idx" ON "WaitlistSignup"("inventoryItemId");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistSignup_shopDomain_productId_email_key" ON "WaitlistSignup"("shopDomain", "productId", "email");
