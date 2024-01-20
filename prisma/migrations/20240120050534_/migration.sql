/*
  Warnings:

  - A unique constraint covering the columns `[websiteId,language]` on the table `LocalizedHtml` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LocalizedHtml_websiteId_language_key" ON "LocalizedHtml"("websiteId", "language");
