/*
  Warnings:

  - You are about to drop the column `key` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_key_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "key";
