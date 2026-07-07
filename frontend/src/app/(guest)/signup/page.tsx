"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSignup } from "@/hooks/mutations/useAuthMutations";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { getErrorMessage, getFieldErrors } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();
  const signup = useSignup();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    try {
      await signup.mutateAsync({ name, email, password, organizationName });
      router.push("/movies");
    } catch (error) {
      setFieldErrors(getFieldErrors(error));
      toast.error(getErrorMessage(error, "Failed to sign up"));
    }
  };

  return (
    <AuthShell>
      <h1 className="mb-6 text-3xl font-bold">Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          <FieldError message={fieldErrors.name} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="organizationName">Organization Name</Label>
          <Input
            id="organizationName"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
          />
          <FieldError message={fieldErrors.organizationName} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <FieldError message={fieldErrors.email} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FieldError message={fieldErrors.password} />
        </div>
        <Button type="submit" disabled={signup.isPending}>
          {signup.isPending ? "Creating account..." : "Sign Up"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
