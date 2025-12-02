-- CreateTable
CREATE TABLE "EReview" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "productId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EReview_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EReview" ADD CONSTRAINT "EReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "EProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
