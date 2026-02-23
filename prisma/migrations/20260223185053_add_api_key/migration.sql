-- AlterTable
ALTER TABLE "members" ADD COLUMN "apiKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "members_apiKey_key" ON "members"("apiKey");
