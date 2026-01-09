-- AlterTable
ALTER TABLE "projects" ADD COLUMN "databaseProvider" TEXT;
ALTER TABLE "projects" ADD COLUMN "databaseUrl" TEXT;
ALTER TABLE "projects" ADD COLUMN "dockerContainerId" TEXT;

-- CreateTable
CREATE TABLE "settings" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
