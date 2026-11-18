-- Remove season/episode media rows (cascades to Season, Episode, and CollectionMedia)
DELETE FROM "Media" WHERE "type" IN ('SEASON', 'EPISODE');

-- DropForeignKey
ALTER TABLE "Season" DROP CONSTRAINT "Season_id_fkey";

-- DropForeignKey
ALTER TABLE "Season" DROP CONSTRAINT "Season_serieId_fkey";

-- DropForeignKey
ALTER TABLE "Episode" DROP CONSTRAINT "Episode_id_fkey";

-- DropForeignKey
ALTER TABLE "Episode" DROP CONSTRAINT "Episode_seasonId_fkey";

-- DropTable
DROP TABLE "Episode";

-- DropTable
DROP TABLE "Season";

-- AlterEnum
BEGIN;
CREATE TYPE "MediaType_new" AS ENUM ('MOVIE', 'SERIE', 'BOOK', 'MUSIC', 'GAME');
ALTER TABLE "Media" ALTER COLUMN "type" TYPE "MediaType_new" USING ("type"::text::"MediaType_new");
ALTER TYPE "MediaType" RENAME TO "MediaType_old";
ALTER TYPE "MediaType_new" RENAME TO "MediaType";
DROP TYPE "MediaType_old";
COMMIT;
