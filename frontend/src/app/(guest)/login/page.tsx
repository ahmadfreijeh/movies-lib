"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  useAcceptInvitation,
  useLogin,
} from "@/hooks/mutations/useAuthMutations";
import { useInvitationPreview } from "@/hooks/queries/useAuthQueries";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { getErrorMessage, getFieldErrors } from "@/lib/utils";

function AcceptInvitationForm({ token }: { token: string }) {
  const router = useRouter();
  const { data: invitation, isLoading, isError } = useInvitationPreview(token);
  const acceptInvitation = useAcceptInvitation(token);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    try {
      await acceptInvitation.mutateAsync({ name, password });
      router.push("/movies");
    } catch (error) {
      setFieldErrors(getFieldErrors(error));
      toast.error(getErrorMessage(error, "Failed to accept invitation"));
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Checking invitation...</p>;
  }

  if (isError || !invitation) {
    return (
      <p className="text-destructive">
        This invitation link is invalid or has expired.
      </p>
    );
  }

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">Accept Invitation</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={invitation.email}
            readOnly
            disabled
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <FieldError message={fieldErrors.name} />
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
        <Button type="submit" disabled={acceptInvitation.isPending}>
          {acceptInvitation.isPending ? "Joining..." : "Join Team"}
        </Button>
      </form>
    </>
  );
}

function LoginForm() {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    try {
      await login.mutateAsync({ email, password });
      router.push("/movies");
    } catch (error) {
      setFieldErrors(getFieldErrors(error));
      toast.error(getErrorMessage(error, "Failed to log in"));
    }
  };

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">Log In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
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
        <Button type="submit" disabled={login.isPending}>
          {login.isPending ? "Logging in..." : "Log In"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </p>
    </>
  );
}

function LoginPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <AuthShell>
      {token ? <AcceptInvitationForm token={token} /> : <LoginForm />}
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
