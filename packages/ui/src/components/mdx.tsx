import Link from "next/link";
import * as React from "react";
import { parseTimestampHref, SeekButton } from "#components/seek-button";
import { cn } from "#lib/utils";

function Anchor({ href = "", children, ...props }: React.ComponentProps<"a">) {
  const seconds = parseTimestampHref(href);
  if (seconds != null) {
    return (
      <SeekButton
        seconds={seconds}
        label={typeof children === "string" ? children : undefined}
      />
    );
  }
  const external = /^https?:\/\//.test(href);
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="text-primary underline underline-offset-4 hover:text-primary/80"
        {...props}
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className="text-primary underline underline-offset-4 hover:text-primary/80"
    >
      {children}
    </Link>
  );
}

export function Callout({
  children,
  variant = "info",
}: {
  children: React.ReactNode;
  variant?: "info" | "warning" | "success";
}) {
  const styles = {
    info: "border-accent/40 bg-accent/10",
    warning: "border-warning/40 bg-warning/10",
    success: "border-success/40 bg-success/10",
  }[variant];
  return (
    <div className={cn("my-4 rounded-xl border px-4 py-3 text-sm", styles)}>
      {children}
    </div>
  );
}

/** Component map for next-mdx-remote. */
export const mdxComponents = {
  a: Anchor,
  Callout,
  SeekButton,
  h1: (p: React.ComponentProps<"h1">) => (
    <h1 className="mt-8 mb-3 text-3xl font-bold tracking-tight" {...p} />
  ),
  h2: (p: React.ComponentProps<"h2">) => (
    <h2 className="mt-7 mb-3 text-2xl font-semibold tracking-tight" {...p} />
  ),
  h3: (p: React.ComponentProps<"h3">) => (
    <h3 className="mt-6 mb-2 text-xl font-semibold" {...p} />
  ),
  p: (p: React.ComponentProps<"p">) => (
    <p className="my-3 leading-7 text-foreground/90" {...p} />
  ),
  ul: (p: React.ComponentProps<"ul">) => (
    <ul className="my-3 ml-5 list-disc space-y-1.5" {...p} />
  ),
  ol: (p: React.ComponentProps<"ol">) => (
    <ol className="my-3 ml-5 list-decimal space-y-1.5" {...p} />
  ),
  li: (p: React.ComponentProps<"li">) => <li className="leading-7" {...p} />,
  blockquote: (p: React.ComponentProps<"blockquote">) => (
    <blockquote
      className="my-4 border-l-2 border-primary/60 pl-4 text-muted-foreground italic"
      {...p}
    />
  ),
  code: (p: React.ComponentProps<"code">) => (
    <code
      className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]"
      {...p}
    />
  ),
  pre: (p: React.ComponentProps<"pre">) => (
    <pre
      className="my-4 overflow-x-auto rounded-xl border border-glass-border bg-muted/60 p-4 text-sm"
      {...p}
    />
  ),
  hr: () => <hr className="my-6 border-border" />,
  img: (p: React.ComponentProps<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="my-4 rounded-xl border border-glass-border"
      alt={p.alt ?? ""}
      {...p}
    />
  ),
};

export function Prose({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-none text-[0.95rem]", className)}>{children}</div>
  );
}
