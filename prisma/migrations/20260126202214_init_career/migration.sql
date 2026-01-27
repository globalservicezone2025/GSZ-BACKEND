/*
  Warnings:

  - The primary key for the `_ModuleToRole` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_ModuleToRole` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_ModuleToRole" DROP CONSTRAINT "_ModuleToRole_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_ModuleToRole_AB_unique" ON "_ModuleToRole"("A", "B");
