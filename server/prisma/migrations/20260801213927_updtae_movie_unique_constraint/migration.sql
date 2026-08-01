/*
  Warnings:

  - A unique constraint covering the columns `[externalId,ownerId]` on the table `Movie` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Movie_externalId_ownerId_key" ON "Movie"("externalId", "ownerId") WHERE ("externalId" IS NOT NULL);
