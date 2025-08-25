/*
  Warnings:

  - You are about to drop the column `content` on the `Message` table. All the data in the column will be lost.
  - Added the required column `recipientCipherText` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderCipherText` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Message" DROP COLUMN "content",
ADD COLUMN     "recipientCipherText" TEXT NOT NULL,
ADD COLUMN     "senderCipherText" TEXT NOT NULL;
