-- Backfill nulls so existing rows satisfy the new NOT NULL constraints
UPDATE "movies" SET "description" = '' WHERE "description" IS NULL;
UPDATE "movies" SET "director" = '' WHERE "director" IS NULL;

-- AlterTable
ALTER TABLE "movies" ALTER COLUMN "description" SET NOT NULL;
ALTER TABLE "movies" ALTER COLUMN "director" SET NOT NULL;
