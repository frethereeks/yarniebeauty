import { notFound } from "next/navigation";
import { getAdminProductById, getAdminCategories } from "@/actions";
import { ProductForm } from "@/components/admin/product-form";
import { ProductImageManager } from "@/components/admin/product-image-manager";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getAdminProductById(id), getAdminCategories()]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-display-lg mb-2">Edit product</h1>
      <p className="text-text-on-cream-muted mb-8">{product.name}</p>

      <div className="mb-10">
        <h2 className="text-eyebrow text-text-on-cream-muted mb-4">Images</h2>
        <ProductImageManager productId={product.id} images={product.images} />
      </div>

      <ProductForm
        categories={categories}
        productId={product.id}
        existingImages={product.images}
        initial={{
          name: product.name,
          categoryId: product.categoryId,
          price: Number(product.price),
          qtyAvailable: product.qtyAvailable,
          popular: product.popular,
          description: product.description ?? "",
        }}
      />
    </div>
  );
}
