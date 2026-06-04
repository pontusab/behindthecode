import { ThemeProvider } from "@btc/ui";
import { Toaster } from "@btc/ui/components/toaster";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Hedvig_Letters_Serif } from "next/font/google";
import { DeployBanner } from "@/components/home/deploy-banner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const hedvigSerif = Hedvig_Letters_Serif({
  variable: "--font-hedvig-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Behind The Code",
    template: "%s · Behind The Code",
  },
  description: "A beautiful, single-publisher video platform.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${hedvigSerif.variable} antialiased`}
      >
        <ThemeProvider>
          <DeployBanner />
          {children}
          <Toaster />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
