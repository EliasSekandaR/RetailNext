import { ProductForm } from "@/components/products/product-form";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductEditPage() {
  const { id } = useParams();
  const productId = parseInt(id);

  const { data: product, isLoading, error } = useQuery({
    queryKey: [`/api/products/${productId}`],
  });

  if (isLoading) {
    return (
      <>
        <div className="mb-6">
          <Skeleton className="h-8 w-[200px] mb-2" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <div className="rounded-lg border border-[hsl(240,3.7%,15.9%)] p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-end gap-3">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-lg border border-[hsl(240,3.7%,15.9%)] p-8 text-center">
        <p className="text-lg text-red-500 mb-2">Failed to load product</p>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : "Product not found"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground">Update product information</p>
      </div>

      <div className="rounded-lg border border-[hsl(240,3.7%,15.9%)] p-6">
        <ProductForm
          initialData={product}
          isEditMode={true}
          productId={productId}
        />
      </div>
    </>
  );
}
