"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUsers } from "@/hooks/queries/useUserQueries";
import { useInvitations } from "@/hooks/queries/useInvitationQueries";
import { useRevokeInvitation } from "@/hooks/mutations/useInvitationMutations";
import { InviteMemberDialog } from "@/components/widgets/InviteMemberDialog";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, getErrorMessage } from "@/lib/utils";
import { InvitationStatus } from "@/lib/types";

const STATUS_STYLES: Record<InvitationStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-green-100 text-green-800",
  EXPIRED: "bg-muted text-muted-foreground",
  REVOKED: "bg-destructive/10 text-destructive",
};

function StatusBadge({ status }: { status: InvitationStatus }) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-xs font-medium capitalize",
        STATUS_STYLES[status],
      )}
    >
      {status.toLowerCase()}
    </span>
  );
}

export default function TeamsPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const { data: usersData, isLoading: isLoadingUsers } = useUsers();
  const { data: invitations, isLoading: isLoadingInvitations } =
    useInvitations();
  const revokeInvitation = useRevokeInvitation();

  useEffect(() => {
    if (profile && profile.role !== "SUPER_ADMIN") {
      router.replace("/movies");
    }
  }, [profile, router]);

  if (!profile || profile.role !== "SUPER_ADMIN") {
    return null;
  }

  const handleRevoke = async (id: string) => {
    try {
      await revokeInvitation.mutateAsync(id);
      toast.success("Invitation revoked");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to revoke invitation"));
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Teams</h1>
        <InviteMemberDialog />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Members</h2>
        {isLoadingUsers ? (
          <p className="text-muted-foreground">Loading members...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData?.items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">
                    {user.role.toLowerCase().replace("_", " ")}
                  </TableCell>
                </TableRow>
              ))}
              {usersData?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    No members yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Invitations</h2>
        {isLoadingInvitations ? (
          <p className="text-muted-foreground">Loading invitations...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations?.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>{invitation.email}</TableCell>
                  <TableCell className="capitalize">
                    {invitation.role.toLowerCase().replace("_", " ")}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={invitation.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {invitation.status === "PENDING" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled={revokeInvitation.isPending}
                        onClick={() => handleRevoke(invitation.id)}
                      >
                        Revoke
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {invitations?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No invitations sent yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
