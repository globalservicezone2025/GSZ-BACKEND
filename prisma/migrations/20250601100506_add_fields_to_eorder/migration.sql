/*
  Warnings:

  - Added the required column `data` to the `EOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryCharge` to the `EOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vat` to the `EOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EOrder" ADD COLUMN     "data" BOOLEAN NOT NULL,
ADD COLUMN     "deliveryCharge" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "vat" DOUBLE PRECISION NOT NULL;
