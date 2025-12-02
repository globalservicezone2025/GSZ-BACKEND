-- CreateTable
CREATE TABLE "EProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "size" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "eCategoryId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EProduct_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EProduct" ADD CONSTRAINT "EProduct_eCategoryId_fkey" FOREIGN KEY ("eCategoryId") REFERENCES "ECategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
