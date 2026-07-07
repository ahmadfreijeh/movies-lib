-- CreateTable
CREATE TABLE "invitation_permissions" (
    "id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "resource" "PermissionResource" NOT NULL,
    "action" "PermissionAction" NOT NULL,

    CONSTRAINT "invitation_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitation_permissions_invitation_id_resource_action_key" ON "invitation_permissions"("invitation_id", "resource", "action");

-- AddForeignKey
ALTER TABLE "invitation_permissions" ADD CONSTRAINT "invitation_permissions_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
