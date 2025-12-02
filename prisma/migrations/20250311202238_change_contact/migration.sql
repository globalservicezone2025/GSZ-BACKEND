/*
  Warnings:

  - You are about to drop the column `message` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `Contact` table. All the data in the column will be lost.
  - Added the required column `country` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hearFrom` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subServiceId` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "message",
DROP COLUMN "name",
DROP COLUMN "subject",
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "hearFrom" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "subServiceId" TEXT NOT NULL,
ADD COLUMN     "time" TIMESTAMP(3) NOT NULL;
