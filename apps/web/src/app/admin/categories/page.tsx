import { categoryRepo } from "@btc/db";
import {
  CategoryManager,
  type CategoryRow,
} from "@/components/admin/category-manager";
import { requireAdmin } from "@/lib/session";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await categoryRepo.listCategories();
  const rows: CategoryRow[] = await Promise.all(
    categories.map(async (c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      count: await categoryRepo.countCategoryVideos(c.id),
    })),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Organize your videos into browsable sections.
        </p>
      </div>
      <CategoryManager categories={rows} />
    </div>
  );
}
