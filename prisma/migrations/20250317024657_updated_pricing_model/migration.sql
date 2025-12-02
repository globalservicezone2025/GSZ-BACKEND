/*
  Warnings:

  - Added the required column `subSubCategoryId` to the `Pricing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pricing" ADD COLUMN     "subSubCategoryId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Pricing" ADD CONSTRAINT "Pricing_subSubCategoryId_fkey" FOREIGN KEY ("subSubCategoryId") REFERENCES "Subsubcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
