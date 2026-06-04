import * as React from "react";
import { Card, CardContent } from "#components/card";
import { cn } from "#lib/utils";

export function StatCard({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <Card className={cn("glass overflow-hidden shadow-none", className)}>
      <CardContent className="space-y-1 p-5">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="font-serif text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
