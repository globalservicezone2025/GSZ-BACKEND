/*
  Warnings:

  - Added the required column `name` to the `EReview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EReview" ADD COLUMN     "name" TEXT NOT NULL;
