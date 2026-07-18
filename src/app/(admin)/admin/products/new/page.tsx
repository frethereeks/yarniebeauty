import { getAdminCategories } from "@/actions";
import { ProductForm } from "@/components/admin/product-form";
import { QuickAddCategory } from "@/components/admin/quick-add-category";

export default async function NewProductPage() {
  const categories = await getAdminCategories();

  return (
    <div>
      <h1 className="text-display-lg mb-2">New product</h1>
      <p className="text-text-on-cream-muted mb-8">
        New products are saved as unavailable until you publish them.
      </p>

      {categories.length === 0 && (
        <div className="border border-line border-dashed p-5 mb-8 text-sm">
          <p className="text-text-on-cream-muted mb-2">No categories yet — create one to get started.</p>
          <QuickAddCategory />
        </div>
      )}

      <ProductForm categories={categories} />

      {categories.length > 0 && (
        <div className="mt-6">
          <QuickAddCategory />
        </div>
      )}
    </div>
  );
}
