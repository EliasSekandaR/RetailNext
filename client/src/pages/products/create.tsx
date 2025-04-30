import { ProductForm } from "@/components/products/product-form";

export default function ProductCreatePage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create Product</h1>
        <p className="text-muted-foreground">Add a new product to your inventory</p>
      </div>

      <div className="rounded-lg border border-[hsl(240,3.7%,15.9%)] p-6">
        <ProductForm />
      </div>
    </>
  );
}
