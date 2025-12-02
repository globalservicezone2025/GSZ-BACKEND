/*
  Warnings:

  - You are about to drop the column `subcategoryId` on the `Subsubcategory` table. All the data in the column will be lost.
  - Added the required column `subCategoryId` to the `Subsubcategory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Subsubcategory" DROP CONSTRAINT "Subsubcategory_subcategoryId_fkey";

-- AlterTable
ALTER TABLE "Subsubcategory" DROP COLUMN "subcategoryId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "subCategoryId" TEXT NOT NULL,
ADD COLUMN     "text" TEXT;

-- AddForeignKey
ALTER TABLE "Subsubcategory" ADD CONSTRAINT "Subsubcategory_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "Subcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
