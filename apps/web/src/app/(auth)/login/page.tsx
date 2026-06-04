import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { authMethods } from "@/lib/auth-methods";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to like, comment, and more.
        </p>
      </div>
      <Suspense fallback={null}>
        <AuthForm mode="login" methods={authMethods} />
      </Suspense>
    </div>
  );
}
