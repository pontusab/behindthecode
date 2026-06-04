"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function ViewsChart({
  data,
}: {
  data: { date: string; views: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <defs>
          <pattern
            id="viewsRaster"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="8" height="8" fill="transparent" />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="8"
              stroke="var(--color-foreground)"
              strokeWidth="1"
              strokeOpacity="0.14"
            />
          </pattern>
        </defs>
        <CartesianGrid
          vertical={false}
          stroke="var(--color-border)"
          strokeDasharray="4 4"
        />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => d.slice(5)}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={48}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 0,
            fontSize: 12,
          }}
          labelStyle={{ color: "var(--color-foreground)" }}
        />
        <Area
          type="monotone"
          dataKey="views"
          stroke="var(--color-foreground)"
          strokeWidth={1.5}
          fill="url(#viewsRaster)"
          dot={false}
          activeDot={{
            r: 3,
            fill: "var(--color-foreground)",
            stroke: "var(--color-background)",
            strokeWidth: 2,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
