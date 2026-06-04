import type { Metadata } from "next";
import { DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function Privacy() {
  return <DocPage slug="privacy" />;
}
