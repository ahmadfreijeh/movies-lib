-- AlterTable
ALTER TABLE "movies" ADD COLUMN "slug" TEXT;

-- AlterTable
ALTER TABLE "genres" ADD COLUMN "slug" TEXT;

-- Backfill slugs from existing title/name, appending a short id suffix to
-- guarantee uniqueness for any rows that would otherwise collide.
UPDATE "movies"
SET "slug" = lower(regexp_replace(regexp_replace(trim(title), '[^a-zA-Z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g')) || '-' || substr(id, 1, 8);

UPDATE "genres"
SET "slug" = lower(regexp_replace(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g')) || '-' || substr(id, 1, 8);

-- AlterTable
ALTER TABLE "movies" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "genres" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "movies_slug_key" ON "movies"("slug");
CREATE UNIQUE INDEX "genres_slug_key" ON "genres"("slug");
