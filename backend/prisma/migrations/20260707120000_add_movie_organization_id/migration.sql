-- AlterTable
ALTER TABLE "movies" ADD COLUMN "organization_id" TEXT;

-- Backfill existing movies into a default organization so the column can be
-- made required. This matches the seed script's "Test Organization" id.
INSERT INTO "organizations" ("id", "name", "created_at", "updated_at")
VALUES ('00000000-0000-0000-0000-000000000000', 'Test Organization', now(), now())
ON CONFLICT ("id") DO NOTHING;

UPDATE "movies"
SET "organization_id" = '00000000-0000-0000-0000-000000000000'
WHERE "organization_id" IS NULL;

-- AlterTable
ALTER TABLE "movies" ALTER COLUMN "organization_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "movies_organization_id_idx" ON "movies"("organization_id");

-- AddForeignKey
ALTER TABLE "movies" ADD CONSTRAINT "movies_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
