import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { BrandWordmark } from "@/components/home/landing";
import { authMethods } from "@/lib/auth-methods";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-center text-center">
        <BrandWordmark className="text-2xl" />
      </div>
      <AuthForm mode="login" methods={authMethods} />
    </div>
  );
}
