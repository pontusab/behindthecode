import * as React from "react";
import { cn } from "#lib/utils";

export function Logo({
  className,
  label = "Behind The Code",
  logoUrl,
}: {
  className?: string;
  label?: string;
  logoUrl?: string | null;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 font-semibold", className)}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={label} className="h-7 w-auto" />
      ) : (
        <span className="grid size-7 place-items-center bg-foreground text-background">
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="currentColor"
            aria-hidden
          >
            <path d="M9.5 7.5v9l7-4.5-7-4.5Z" />
          </svg>
        </span>
      )}
      <span className="text-base tracking-tight">{label}</span>
    </span>
  );
}
