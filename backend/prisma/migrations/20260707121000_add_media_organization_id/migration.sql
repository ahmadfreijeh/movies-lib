-- AlterTable
ALTER TABLE "media" ADD COLUMN "organization_id" TEXT;

-- Backfill from the related movie's organization where possible; fall back
-- to the default seed organization for unattached media.
INSERT INTO "organizations" ("id", "name", "created_at", "updated_at")
VALUES ('00000000-0000-0000-0000-000000000000', 'Test Organization', now(), now())
ON CONFLICT ("id") DO NOTHING;

UPDATE "media"
SET "organization_id" = "movies"."organization_id"
FROM "movies"
WHERE "media"."movie_id" = "movies"."id"
  AND "media"."organization_id" IS NULL;

UPDATE "media"
SET "organization_id" = '00000000-0000-0000-0000-000000000000'
WHERE "organization_id" IS NULL;

-- AlterTable
ALTER TABLE "media" ALTER COLUMN "organization_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "media_organization_id_idx" ON "media"("organization_id");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
