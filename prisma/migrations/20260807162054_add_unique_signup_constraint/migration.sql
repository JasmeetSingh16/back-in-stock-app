/*
  Warnings:

  - A unique constraint covering the columns `[shopDomain,productId,email]` on the table `WaitlistSignup` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WaitlistSignup_shopDomain_productId_email_key" ON "WaitlistSignup"("shopDomain", "productId", "email");
