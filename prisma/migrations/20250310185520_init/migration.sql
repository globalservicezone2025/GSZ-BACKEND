-- AlterTable
ALTER TABLE "_ModuleToRole" ADD CONSTRAINT "_ModuleToRole_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ModuleToRole_AB_unique";
