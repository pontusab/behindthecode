/** Placeholder slug when no DB data exists at build time (Cache Components validation). */
export const BUILD_VALIDATION_SLUG = "__build_validation__";

export function isBuildValidationSlug(slug: string): boolean {
  return slug === BUILD_VALIDATION_SLUG;
}

/** Cache Components requires at least one static param for build-time validation. */
export function withBuildValidationSlug(slugs: string[]): { slug: string }[] {
  return slugs.length > 0
    ? slugs.map((slug) => ({ slug }))
    : [{ slug: BUILD_VALIDATION_SLUG }];
}
