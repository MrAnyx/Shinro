DROP INDEX "Media_externalId_ownerId_key";

CREATE UNIQUE INDEX "Media_externalId_ownerId_type_key"
ON "Media"("externalId", "ownerId", "type") WHERE ("externalId" IS NOT NULL);
