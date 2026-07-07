"use client";

import { FormEvent, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useCreateInvitation } from "@/hooks/mutations/useInvitationMutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";
import { Permission, PermissionAction, PermissionResource } from "@/lib/types";
import { getErrorMessage, getFieldErrors } from "@/lib/utils";

function getInviteLink(token: string): string {
  return `${window.location.origin}/login?token=${token}`;
}

const PERMISSION_RESOURCES: Exclude<PermissionResource, "ALL">[] = ["MOVIE", "MEDIA"];
const PERMISSION_ACTIONS: Exclude<PermissionAction, "ALL">[] = ["CREATE", "EDIT", "DELETE"];

function permissionKey(resource: PermissionResource, action: PermissionAction) {
  return `${resource}:${action}`;
}

export function InviteMemberDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const createInvitation = useCreateInvitation();

  const togglePermission = (resource: PermissionResource, action: PermissionAction) => {
    const key = permissionKey(resource, action);
    setPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const resetForm = () => {
    setEmail("");
    setPermissions(new Set());
    setInviteLink(null);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) resetForm();
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied to clipboard");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    const selectedPermissions: Permission[] = Array.from(permissions).map((key) => {
      const [resource, action] = key.split(":") as [PermissionResource, PermissionAction];
      return { resource, action };
    });
    try {
      const invitation = await createInvitation.mutateAsync({
        email,
        role: "ADMIN",
        permissions: selectedPermissions,
      });
      toast.success("Invitation sent");
      setInviteLink(getInviteLink(invitation.token));
    } catch (error) {
      setFieldErrors(getFieldErrors(error));
      toast.error(getErrorMessage(error, "Failed to send invitation"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Invite Member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
        </DialogHeader>
        {inviteLink ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Invitation sent. Share this link with {email} so they can join:
            </p>
            <div className="flex items-center gap-2">
              <Input readOnly value={inviteLink} onFocus={(e) => e.target.select()} />
              <Button type="button" size="icon" variant="outline" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FieldError message={fieldErrors.email} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Permissions</Label>
            <div className="flex flex-col gap-2 rounded-md border p-3">
              {PERMISSION_RESOURCES.map((resource) => (
                <div key={resource} className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium capitalize text-muted-foreground">
                    {resource.toLowerCase()}
                  </span>
                  <div className="flex flex-wrap gap-4">
                    {PERMISSION_ACTIONS.map((action) => {
                      const key = permissionKey(resource, action);
                      return (
                        <label
                          key={key}
                          htmlFor={key}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Checkbox
                            id={key}
                            checked={permissions.has(key)}
                            onCheckedChange={() => togglePermission(resource, action)}
                          />
                          <span className="capitalize">{action.toLowerCase()}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <FieldError message={fieldErrors.permissions} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createInvitation.isPending}>
              {createInvitation.isPending ? "Sending..." : "Send Invite"}
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
