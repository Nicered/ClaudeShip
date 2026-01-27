-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "appType" TEXT NOT NULL DEFAULT 'FULLSTACK_WEB',
    "projectType" TEXT NOT NULL,
    "frontendFramework" TEXT NOT NULL DEFAULT 'REACT_VITE',
    "backendFramework" TEXT NOT NULL DEFAULT 'EXPRESS',
    "techStackConfig" TEXT DEFAULT '{}',
    "path" TEXT NOT NULL,
    "description" TEXT,
    "claudeSessionId" TEXT,
    "databaseProvider" TEXT,
    "databaseUrl" TEXT,
    "dockerContainerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_projects" ("backendFramework", "claudeSessionId", "createdAt", "databaseProvider", "databaseUrl", "description", "dockerContainerId", "frontendFramework", "id", "name", "path", "projectType", "techStackConfig", "updatedAt") SELECT "backendFramework", "claudeSessionId", "createdAt", "databaseProvider", "databaseUrl", "description", "dockerContainerId", "frontendFramework", "id", "name", "path", "projectType", "techStackConfig", "updatedAt" FROM "projects";
DROP TABLE "projects";
ALTER TABLE "new_projects" RENAME TO "projects";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
