import Link from "next/link";
import { getAdminProducts } from "@/actions";
import { ProductsTable } from "@/components/admin/products-table";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();
  const productsData = products.map(el => ({...el, price: +(el.price)}))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-display-lg">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-gold text-ink text-eyebrow font-semibold px-5 py-2.5 hover:bg-gold-bright transition-colors"
        >
          + New product
        </Link>
      </div>

      <div className="bg-white border border-line overflow-x-scroll md:overflow-clip">
        <ProductsTable products={productsData} />
      </div>
    </div>
  );
}
