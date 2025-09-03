/*
  Warnings:

  - Added the required column `signature` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "signature" TEXT NOT NULL;
