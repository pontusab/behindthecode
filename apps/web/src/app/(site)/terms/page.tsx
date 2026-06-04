import type { Metadata } from "next";
import { DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Terms of Service" };

export default function Terms() {
  return <DocPage slug="terms" />;
}
