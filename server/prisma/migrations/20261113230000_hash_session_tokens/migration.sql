-- Drop expired sessions, they are useless and would only be migrated for nothing
DELETE FROM "Session" WHERE "expiresAt" < NOW();

-- AlterTable: store the SHA-256 hash of the session token instead of the raw token.
-- Existing tokens are hashed in place so signed-in users keep their session.
ALTER TABLE "Session" ADD COLUMN "tokenHash" CHAR(64);

UPDATE "Session" SET "tokenHash" = encode(sha256(convert_to("sessionId", 'UTF8')), 'hex');

ALTER TABLE "Session" ALTER COLUMN "tokenHash" SET NOT NULL;

-- DropIndex
DROP INDEX "Session_sessionId_key";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "sessionId";

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
