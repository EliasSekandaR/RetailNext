import { CustomerForm } from "@/components/customers/customer-form";

export default function CustomerCreatePage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create Customer</h1>
        <p className="text-muted-foreground">Add a new customer to your database</p>
      </div>

      <div className="rounded-lg border border-[hsl(240,3.7%,15.9%)] p-6">
        <CustomerForm />
      </div>
    </>
  );
}
