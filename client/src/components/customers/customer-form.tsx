import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof formSchema>;

interface CustomerFormProps {
  initialData?: CustomerFormValues;
  isEditMode?: boolean;
  customerId?: number;
}

export function CustomerForm({ initialData, isEditMode = false, customerId }: CustomerFormProps) {
  const [, navigate] = useLocation();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const customerMutation = useMutation({
    mutationFn: async (data: CustomerFormValues) => {
      if (isEditMode && customerId) {
        return apiRequest('PUT', `/api/customers/${customerId}`, data);
      } else {
        return apiRequest('POST', '/api/customers', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: `Customer ${isEditMode ? "updated" : "created"} successfully`,
        description: `The customer has been ${isEditMode ? "updated" : "created"} successfully.`,
      });
      navigate("/customers");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${isEditMode ? "update" : "create"} customer`,
        variant: "destructive",
      });
    }
  });

  function onSubmit(values: CustomerFormValues) {
    customerMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Email address" {...field} />
              </FormControl>
              <FormDescription>
                This is the customer's primary contact email.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Full address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/customers")}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={customerMutation.isPending}
          >
            {customerMutation.isPending ? "Saving..." : isEditMode ? "Update Customer" : "Create Customer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
