/*
  Warnings:

  - Added the required column `sharedContactKey` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sharedUserKey` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encryptedKey` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "sharedContactKey" TEXT NOT NULL,
ADD COLUMN     "sharedUserKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "encryptedKey" TEXT NOT NULL;
