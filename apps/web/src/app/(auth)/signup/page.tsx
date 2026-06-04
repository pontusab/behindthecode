import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { authMethods } from "@/lib/auth-methods";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-btc-text">
          Create your account
        </h1>
        <p className="text-sm text-btc-muted">
          Join to like, comment, and follow along.
        </p>
      </div>
      <AuthForm mode="signup" methods={authMethods} />
    </div>
  );
}
