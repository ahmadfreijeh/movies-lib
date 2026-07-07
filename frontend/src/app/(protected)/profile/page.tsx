"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { useUpdateProfile } from "@/hooks/mutations/useAuthMutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { getErrorMessage, getFieldErrors } from "@/lib/utils";

export default function ProfilePage() {
  const { profile } = useAuth();
  const [name, setName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const updateProfile = useUpdateProfile();

  useEffect(() => {
    if (profile) setName(profile.name);
  }, [profile]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    try {
      await updateProfile.mutateAsync({ name });
      toast.success("Profile updated");
    } catch (error) {
      setFieldErrors(getFieldErrors(error));
      toast.error(getErrorMessage(error, "Failed to update profile"));
    }
  };

  const isUnchanged = profile?.name === name;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <p className="mt-2 text-muted-foreground">
        Manage your account information.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={100}
              />
              <FieldError message={fieldErrors.name} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                value={profile?.email ?? ""}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Your email address cannot be changed.
              </p>
            </div>

            <div>
              <Button
                type="submit"
                disabled={updateProfile.isPending || !name || isUnchanged}
              >
                {updateProfile.isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
