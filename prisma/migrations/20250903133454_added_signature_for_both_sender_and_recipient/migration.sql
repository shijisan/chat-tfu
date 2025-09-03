/*
  Warnings:

  - You are about to drop the column `signature` on the `Message` table. All the data in the column will be lost.
  - Added the required column `recipientSignature` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderSignature` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Message" DROP COLUMN "signature",
ADD COLUMN     "recipientSignature" TEXT NOT NULL,
ADD COLUMN     "senderSignature" TEXT NOT NULL;
