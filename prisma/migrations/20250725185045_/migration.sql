/*
  Warnings:

  - A unique constraint covering the columns `[collectionAlias]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "profiles" ADD COLUMN "collectionAlias" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "profiles_collectionAlias_key" ON "profiles"("collectionAlias");
