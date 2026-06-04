"use client";

import { Button } from "@btc/ui/components/button";
import { Input } from "@btc/ui/components/input";
import { Label } from "@btc/ui/components/label";
import { toast } from "@btc/ui/components/toaster";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import type { AuthMethods } from "@/lib/auth-methods";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Read the post-auth redirect target lazily from the URL at call time. Doing
 * this inside handlers (instead of `useSearchParams()` during render) keeps the
 * form fully server-rendered/static rather than hidden behind a Suspense
 * boundary until hydration.
 */
function getRedirectTo(): string {
  if (typeof window === "undefined") return "/";
  return new URLSearchParams(window.location.search).get("redirect") || "/";
}

export function AuthForm({
  mode,
  methods,
}: {
  mode: "login" | "signup";
  methods: AuthMethods;
}) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const isSignup = mode === "signup";

  async function onEmailPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading("email");
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw new Error(error.message);
        if (!data.session) {
          toast.success("Check your email to confirm your account");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw new Error(error.message);
      }
      router.push(getRedirectTo());
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  async function onSocial(provider: "google" | "twitter") {
    setLoading(provider);
    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(getRedirectTo())}`,
        },
      });
      if (error) throw new Error(error.message);
    } catch {
      toast.error("Could not start sign-in");
      setLoading(null);
    }
  }

  async function onMagicLink() {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    setLoading("magic");
    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(getRedirectTo())}`,
        },
      });
      if (error) throw new Error(error.message);
      toast.success("Check your email for a sign-in link");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send link");
    } finally {
      setLoading(null);
    }
  }

  const anySocial = methods.google || methods.x;
  const bothSocial = methods.google && methods.x;

  const inputClass =
    "bg-transparent dark:bg-transparent shadow-none [-webkit-autofill]:bg-transparent autofill:bg-transparent autofill:shadow-[inset_0_0_0_1000px_transparent]";

  return (
    <div className="space-y-5">
      {anySocial && (
        <div className={bothSocial ? "grid grid-cols-2 gap-3" : "grid gap-3"}>
          {methods.google && (
            <Button
              variant="outline"
              className="w-full"
              disabled={!!loading}
              onClick={() => onSocial("google")}
            >
              {loading === "google" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              {bothSocial ? "Google" : "Continue with Google"}
            </Button>
          )}
          {methods.x && (
            <Button
              variant="outline"
              className="w-full"
              disabled={!!loading}
              onClick={() => onSocial("twitter")}
            >
              {loading === "twitter" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <XIcon />
              )}
              {bothSocial ? "X" : "Continue with X"}
            </Button>
          )}
        </div>
      )}

      {anySocial && (
        <div className="flex items-center gap-3 text-xs text-btc-muted">
          <span className="h-px flex-1 bg-btc-border" />
          or
          <span className="h-px flex-1 bg-btc-border" />
        </div>
      )}

      <form onSubmit={onEmailPassword} className="space-y-3">
        {isSignup && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete={isSignup ? "new-password" : "current-password"}
          />
        </div>
        <Button
          type="submit"
          variant="gradient"
          className="w-full"
          disabled={!!loading}
        >
          {loading === "email" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          {isSignup ? "Create account" : "Sign in"}
        </Button>
      </form>

      {methods.magicLink && (
        <Button
          variant="ghost"
          className="w-full"
          disabled={!!loading}
          onClick={onMagicLink}
        >
          {loading === "magic" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Mail className="size-4" />
          )}
          Email me a magic link
        </Button>
      )}

      <p className="text-center text-sm text-muted-foreground">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-medium text-primary hover:underline"
        >
          {isSignup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}
