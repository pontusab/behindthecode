import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { authMethods } from "@/lib/auth-methods";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Join to like, comment, and follow along.
        </p>
      </div>
      <Suspense fallback={null}>
        <AuthForm mode="signup" methods={authMethods} />
      </Suspense>
    </div>
  );
}
