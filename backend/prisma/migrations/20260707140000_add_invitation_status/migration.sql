-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- AlterTable
ALTER TABLE "invitations" ADD COLUMN "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING';

-- Backfill existing rows from their derived state
UPDATE "invitations" SET "status" = 'REVOKED' WHERE "revoked_at" IS NOT NULL;
UPDATE "invitations" SET "status" = 'ACCEPTED' WHERE "accepted_at" IS NOT NULL AND "revoked_at" IS NULL;
UPDATE "invitations" SET "status" = 'EXPIRED' WHERE "accepted_at" IS NULL AND "revoked_at" IS NULL AND "expires_at" < now();
