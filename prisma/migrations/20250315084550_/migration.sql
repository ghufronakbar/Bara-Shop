/*
  Warnings:

  - Added the required column `amount` to the `ProductDefect` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductDefect" ADD COLUMN     "amount" INTEGER NOT NULL;
