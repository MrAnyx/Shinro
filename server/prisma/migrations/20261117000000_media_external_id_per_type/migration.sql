-- DropIndex
DROP INDEX "Media_externalId_ownerId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Media_ownerId_type_externalId_key" ON "Media"("ownerId", "type", "externalId") WHERE ("externalId" IS NOT NULL);
