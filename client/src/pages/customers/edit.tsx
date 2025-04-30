import { CustomerForm } from "@/components/customers/customer-form";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerEditPage() {
  const { id } = useParams();
  const customerId = parseInt(id);

  const { data: customer, isLoading, error } = useQuery({
    queryKey: [`/api/customers/${customerId}`],
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
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
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

  if (error || !customer) {
    return (
      <div className="rounded-lg border border-[hsl(240,3.7%,15.9%)] p-8 text-center">
        <p className="text-lg text-red-500 mb-2">Failed to load customer</p>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : "Customer not found"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Edit Customer</h1>
        <p className="text-muted-foreground">Update customer information</p>
      </div>

      <div className="rounded-lg border border-[hsl(240,3.7%,15.9%)] p-6">
        <CustomerForm
          initialData={customer}
          isEditMode={true}
          customerId={customerId}
        />
      </div>
    </>
  );
}
