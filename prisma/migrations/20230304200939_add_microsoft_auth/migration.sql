/*
  Warnings:

  - You are about to drop the column `subscriberId` on the `Note` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `authorId` to the `Note` table without a default value. This is not possible if the table is not empty.
  - The required column `key` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_subscriberId_fkey";

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "subscriberId",
ADD COLUMN     "authorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "key" UUID NOT NULL,
ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_key_key" ON "User"("key");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
