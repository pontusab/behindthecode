import type { Metadata } from "next";
import { DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return <DocPage slug="about" />;
}
