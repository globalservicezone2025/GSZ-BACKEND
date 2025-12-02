-- AlterTable
ALTER TABLE "Faq" ADD COLUMN     "subSubCategoryId" TEXT;

-- AddForeignKey
ALTER TABLE "Faq" ADD CONSTRAINT "Faq_subSubCategoryId_fkey" FOREIGN KEY ("subSubCategoryId") REFERENCES "Subsubcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
