"use client";

import { cn } from "@btc/ui";
import { Input } from "@btc/ui/components/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = React.useState(params.get("q") ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = q.trim();
        if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      }}
      className={cn("relative w-full max-w-md", className)}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search videos…"
        className="rounded-full pl-9"
        aria-label="Search"
      />
    </form>
  );
}
