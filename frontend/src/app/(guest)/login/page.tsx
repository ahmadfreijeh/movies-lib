"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLogin } from "@/hooks/mutations/useAuthMutations";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { getErrorMessage, getFieldErrors } from "@/lib/utils";

export default function LoginPage() {
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
    <AuthShell>
      <h1 className="mb-6 text-3xl font-bold">Log In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <FieldError message={fieldErrors.email} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
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
    </AuthShell>
  );
}
