/*
  Warnings:

  - You are about to drop the column `subServiceId` on the `Contact` table. All the data in the column will be lost.
  - Added the required column `subSubServiceId` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_subServiceId_fkey";

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "subServiceId",
ADD COLUMN     "subSubServiceId" TEXT NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_subSubServiceId_fkey" FOREIGN KEY ("subSubServiceId") REFERENCES "Subsubcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
