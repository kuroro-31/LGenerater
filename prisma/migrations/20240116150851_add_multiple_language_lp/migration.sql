/*
  Warnings:

  - You are about to drop the column `html` on the `Website` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('DEVELOPER', 'OPERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('JP', 'EN', 'TW', 'CN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'OPERATOR';

-- AlterTable
ALTER TABLE "Website" DROP COLUMN "html",
ADD COLUMN     "isTemplate" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "LocalizedHtml" (
    "id" SERIAL NOT NULL,
    "language" "Language" NOT NULL,
    "content" TEXT NOT NULL,
    "websiteId" INTEGER NOT NULL,

    CONSTRAINT "LocalizedHtml_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LocalizedHtml" ADD CONSTRAINT "LocalizedHtml_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
