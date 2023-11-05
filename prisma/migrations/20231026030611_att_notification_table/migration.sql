/*
  Warnings:

  - You are about to drop the column `url` on the `notifications` table. All the data in the column will be lost.
  - Added the required column `content` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "url",
ADD COLUMN     "content" TEXT NOT NULL;
