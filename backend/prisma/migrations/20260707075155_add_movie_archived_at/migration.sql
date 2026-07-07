-- AlterTable
ALTER TABLE "movies" ADD COLUMN     "archived_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "movies_archived_at_idx" ON "movies"("archived_at");
