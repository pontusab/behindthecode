import { mdxComponents, Prose } from "@btc/ui/components/mdx";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { loadDoc } from "@/lib/content";

export async function DocPage({ slug }: { slug: string }) {
  const source = await loadDoc(slug);
  if (!source) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Prose className="text-base">
        <MDXRemote source={source} components={mdxComponents} />
      </Prose>
    </article>
  );
}
