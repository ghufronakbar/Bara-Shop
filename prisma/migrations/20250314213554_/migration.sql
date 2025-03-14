/*
  Warnings:

  - You are about to drop the column `customerId` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_customerId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerId" TEXT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "customerId";

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
