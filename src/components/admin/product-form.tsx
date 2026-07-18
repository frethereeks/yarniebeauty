"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input, InputNumber, Select, Switch, App } from "antd";
import { createProduct, updateProduct } from "@/actions";
import { ImageUploadPicker } from "@/components/admin/image-upload-picker";

type Category = { id: string; name: string };
type ExistingImage = { id: string; secureUrl: string };

type ProductFormValues = {
  name: string;
  categoryId: string;
  price: number;
  qtyAvailable: number;
  popular: boolean;
  description: string;
};

export function ProductForm({
  categories,
  initial,
  productId,
  existingImages,
}: {
  categories: Category[];
  initial?: ProductFormValues;
  productId?: string;
  existingImages?: ExistingImage[];
}) {
  const [values, setValues] = useState<ProductFormValues>(
    initial ?? { name: "", categoryId: "", price: 0, qtyAvailable: 0, popular: false, description: "" }
  );
  const [pendingImages, setPendingImages] = useState<{ id: string; dataUrl: string }[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { message } = App.useApp();
  const router = useRouter();

  const isEdit = !!productId;

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError(null);

    if (!values.name.trim() || !values.categoryId || values.price <= 0) {
      setError("Please fill in the product name, category, and a price greater than 0.");
      return;
    }

    startTransition(async () => {
      const imageDataUrls = pendingImages.map((p) => p.dataUrl);
      const result = isEdit
        ? await updateProduct(productId!, values, imageDataUrls)
        : await createProduct(values, imageDataUrls);

      if (result.ok) {
        message.success(isEdit ? "Product updated" : "Product created");
        router.push("/admin/products");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div>
        <label className="block text-eyebrow text-text-on-cream-muted mb-2">Product name</label>
        <Input
          size="large"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-eyebrow text-text-on-cream-muted mb-2">Category</label>
          <Select
            size="large"
            className="w-full"
            value={values.categoryId || undefined}
            placeholder="Select category"
            onChange={(val) => setValues((v) => ({ ...v, categoryId: val }))}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
        </div>
        <div>
          <label className="block text-eyebrow text-text-on-cream-muted mb-2">Price (NGN)</label>
          <InputNumber
            size="large"
            className="w-full"
            min={0}
            value={values.price}
            onChange={(val) => setValues((v) => ({ ...v, price: val ?? 0 }))}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 items-end">
        <div>
          <label className="block text-eyebrow text-text-on-cream-muted mb-2">Quantity available</label>
          <InputNumber
            size="large"
            className="w-full"
            min={0}
            value={values.qtyAvailable}
            onChange={(val) => setValues((v) => ({ ...v, qtyAvailable: val ?? 0 }))}
          />
        </div>
        <div className="flex items-center gap-3 pb-2">
          <Switch
            checked={values.popular}
            onChange={(checked) => setValues((v) => ({ ...v, popular: checked }))}
          />
          <span className="text-sm">Mark as popular</span>
        </div>
      </div>

      <div>
        <label className="block text-eyebrow text-text-on-cream-muted mb-2">Description</label>
        <Input.TextArea
          rows={5}
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
        />
      </div>

      {existingImages && existingImages.length > 0 && (
        <div>
          <label className="block text-eyebrow text-text-on-cream-muted mb-3">Current images</label>
          <p className="text-xs text-text-on-cream-muted mb-3">
            Manage existing images from the product detail page after saving.
          </p>
          <div className="grid grid-cols-4 gap-3">
            {existingImages.map((img) => (
              <div key={img.id} className="relative aspect-square bg-cream-soft overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.secureUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-eyebrow text-text-on-cream-muted mb-3">
          {isEdit ? "Add more images" : "Product images"}
        </label>
        <ImageUploadPicker
          pending={pendingImages}
          onAdd={(dataUrl) => setPendingImages((p) => [...p, { id: crypto.randomUUID(), dataUrl }])}
          onRemove={(id) => setPendingImages((p) => p.filter((img) => img.id !== id))}
        />
      </div>

      {error && <p className="text-error text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="bg-ink text-cream text-eyebrow font-semibold px-7 py-3.5 hover:bg-charcoal transition-colors disabled:opacity-60"
      >
        {isPending ? "Saving…" : isEdit ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}
