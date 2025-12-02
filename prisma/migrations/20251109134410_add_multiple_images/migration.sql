/*
  Warnings:

  - You are about to drop the column `image` on the `EProduct` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EProduct" DROP COLUMN "image",
ADD COLUMN     "images" TEXT[];
