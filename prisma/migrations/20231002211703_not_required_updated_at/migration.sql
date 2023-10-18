-- AlterTable
ALTER TABLE "answers" ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "comments" ALTER COLUMN "updatedAt" DROP NOT NULL;
