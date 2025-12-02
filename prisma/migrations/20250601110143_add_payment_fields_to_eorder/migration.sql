/*
  Warnings:

  - Added the required column `paymentDone` to the `EOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentType` to the `EOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EOrder" ADD COLUMN     "paymentDone" BOOLEAN NOT NULL,
ADD COLUMN     "paymentType" TEXT NOT NULL;
