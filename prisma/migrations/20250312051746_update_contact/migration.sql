-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_subServiceId_fkey" FOREIGN KEY ("subServiceId") REFERENCES "Subcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
