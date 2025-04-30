import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

// Define validation schema
const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  stock: z.coerce.number().int().min(0, "Stock must be a non-negative integer"),
  category: z.string().optional(),
  imageUrl: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  isNew?: boolean;
  isEditMode?: boolean;
  productId?: number;
}

export default function ProductForm({ isNew = false }: ProductFormProps) {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Setup form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      price: 0,
      stock: 0,
      category: "",
      imageUrl: "",
    },
  });

  // Fetch product if editing
  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [`/api/products/${id}`],
    enabled: !isNew && !!id,
  });

  // Update form when product data is loaded
  useEffect(() => {
    if (product && !isNew) {
      form.reset({
        name: product.name,
        description: product.description || "",
        sku: product.sku,
        price: product.price / 100, // Convert from cents to dollars for display
        stock: product.stock,
        category: product.category || "",
        imageUrl: product.imageUrl || "",
      });
    }
  }, [product, form, isNew]);

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      // Convert price to cents for storage
      const dataWithCents = {
        ...data,
        price: Math.round(data.price * 100),
      };
      return await apiRequest("POST", "/api/products", dataWithCents);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product created",
        description: "The product has been created successfully.",
      });
      navigate("/products");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create the product.",
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      // Convert price to cents for storage
      const dataWithCents = {
        ...data,
        price: Math.round(data.price * 100),
      };
      return await apiRequest("PUT", `/api/products/${id}`, dataWithCents);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${id}`] });
      toast({
        title: "Product updated",
        description: "The product has been updated successfully.",
      });
      navigate("/products");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update the product.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    if (isNew) {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (!isNew && isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/products")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-8 w-48" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            <div className="pt-4">
              <Skeleton className="h-10 w-20 ml-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isNew && isError) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/products")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>

        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-zinc-500">Error loading product. Please try again.</p>
            <Button className="mt-4" onClick={() => navigate("/products")}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/products")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isNew ? "Add New Product" : "Edit Product"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Product description" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="SKU-1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="Electronics" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the price in dollars (e.g., 99.99)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isNew ? "Create Product" : "Update Product"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
