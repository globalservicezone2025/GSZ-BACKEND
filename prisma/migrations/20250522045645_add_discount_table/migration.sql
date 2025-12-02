/*
  Warnings:

  - You are about to drop the column `quantity` on the `EProduct` table. All the data in the column will be lost.
  - The `color` column on the `EProduct` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `size` column on the `EProduct` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "EProduct" DROP COLUMN "quantity",
DROP COLUMN "color",
ADD COLUMN     "color" TEXT[],
DROP COLUMN "size",
ADD COLUMN     "size" TEXT[];

-- CreateTable
CREATE TABLE "EProductStock" (
    "id" TEXT NOT NULL,
    "eProductId" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EProductStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discount" (
    "id" TEXT NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "categories" TEXT[],
    "products" TEXT[],
    "discountPercent" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EProductStock" ADD CONSTRAINT "EProductStock_eProductId_fkey" FOREIGN KEY ("eProductId") REFERENCES "EProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
