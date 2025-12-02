-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "eCategoryId" TEXT;

-- CreateTable
CREATE TABLE "ECategory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "text" TEXT,
    "image" TEXT DEFAULT 'images/category/category.png',
    "slug" TEXT NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serial" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ECategory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ECategory" ADD CONSTRAINT "ECategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
