/*
  Warnings:

  - Added the required column `source` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('INTERNAL', 'EXTERNAL');

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "source" "SourceType" NOT NULL;
