-- Backfill NULL updatedAt and set DEFAULT for new rows
-- Run after backing up your database.

BEGIN;

-- Backfill existing NULLs with createdAt or now()
UPDATE "Pet"
SET "updatedAt" = COALESCE("createdAt", now())
WHERE "updatedAt" IS NULL;

-- Set default for future inserts (Postgres)
ALTER TABLE "Pet"
ALTER COLUMN "updatedAt"
SET DEFAULT now();

COMMIT;
