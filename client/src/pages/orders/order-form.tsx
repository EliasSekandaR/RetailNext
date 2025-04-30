import { useEffect, useState } from "react";
import { useParams, useLocation, useRoute } from "wouter";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Plus, X, Package2, ShoppingCart, ChevronDown } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/components/ui/dashboard-card";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

// Types
interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
}

interface OrderItem {
  id?: number;
  productId: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    name: string;
    sku: string;
  };
}

interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  date: string;
  status: string;
  total: number;
  notes: string;
  items?: OrderItem[];
  customer?: Customer;
}

// Define validation schema
const orderFormSchema = z.object({
  customerId: z.coerce.number().min(1, "Customer is required"),
  status: z.string().min(1, "Status is required"),
  notes: z.string().optional(),
});

const orderItemSchema = z.object({
  productId: z.coerce.number().min(1, "Product is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;
type OrderItemFormValues = z.infer<typeof orderItemSchema>;

interface OrderFormProps {
  isNew?: boolean;
  orderId?: number;
}

export default function OrderForm({ isNew = false, orderId }: OrderFormProps) {
  const { id } = useParams<{ id: string }>();
  const actualId = orderId || (id ? parseInt(id) : undefined);
  const [location, navigate] = useLocation();
  const [match, params] = useRoute("/orders/new");
  const { toast } = useToast();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [calculatedTotal, setCalculatedTotal] = useState(0);

  // Get the customerId from the URL query if provided
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const preselectedCustomerId = searchParams.get("customerId");

  // Setup main order form
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerId: preselectedCustomerId ? parseInt(preselectedCustomerId) : 0,
      status: isNew ? "pending" : "",
      notes: "",
    },
  });

  // Setup order item form
  const itemForm = useForm<OrderItemFormValues>({
    resolver: zodResolver(orderItemSchema),
    defaultValues: {
      productId: 0,
      quantity: 1,
    },
  });

  // Fetch order if editing
  const {
    data: order,
    isLoading: orderLoading,
    isError: orderError,
  } = useQuery<Order>({
    queryKey: [`/api/orders/${actualId}`],
    enabled: !isNew && !!actualId,
  });

  // Fetch customers for dropdown
  const { data: customers, isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Fetch products for dropdown
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Update form when order data is loaded
  useEffect(() => {
    if (order && !isNew) {
      form.reset({
        customerId: order.customerId,
        status: order.status,
        notes: order.notes || "",
      });

      if (order.items) {
        setOrderItems(order.items);
      }
    }
  }, [order, form, isNew]);

  // Calculate the total price whenever order items change
  useEffect(() => {
    const total = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setCalculatedTotal(total);
  }, [orderItems]);

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderFormValues) => {
      // First create the order
      const totalPrice = calculatedTotal;
      
      const orderPayload = {
        ...data,
        total: totalPrice,
        orderNumber: `ORD-${Math.floor(Math.random() * 10000) + 7000}`,
        // The date will be created on the server with defaults
      };
      
      const response = await apiRequest("POST", "/api/orders", orderPayload);
      const createdOrder = await response.json();
      
      // Then add each order item
      for (const item of orderItems) {
        await apiRequest("POST", "/api/order-items", {
          orderId: createdOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        });
      }
      
      return createdOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Order created",
        description: "The order has been created successfully.",
      });
      navigate("/orders");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create the order.",
        variant: "destructive",
      });
    },
  });

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async (data: OrderFormValues) => {
      const response = await apiRequest("PATCH", `/api/orders/${actualId}`, {
        status: data.status,
        notes: data.notes
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${actualId}`] });
      toast({
        title: "Order updated",
        description: "The order has been updated successfully.",
      });
      navigate("/orders");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update the order.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OrderFormValues) => {
    if (isNew) {
      if (orderItems.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one item to the order.",
          variant: "destructive",
        });
        return;
      }
      createOrderMutation.mutate(data);
    } else {
      updateOrderMutation.mutate(data);
    }
  };

  const handleAddItem = (data: OrderItemFormValues) => {
    const product = products?.find((p) => p.id === data.productId);
    
    if (!product) {
      toast({
        title: "Error",
        description: "Selected product not found.",
        variant: "destructive",
      });
      return;
    }

    if (product.stock < data.quantity) {
      toast({
        title: "Error",
        description: `Only ${product.stock} items available in stock.`,
        variant: "destructive",
      });
      return;
    }

    // Check if product already exists in order items
    const existingItemIndex = orderItems.findIndex(
      (item) => item.productId === data.productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      const updatedItems = [...orderItems];
      const totalQuantity = updatedItems[existingItemIndex].quantity + data.quantity;
      
      if (product.stock < totalQuantity) {
        toast({
          title: "Error",
          description: `Only ${product.stock} items available in stock.`,
          variant: "destructive",
        });
        return;
      }
      
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: totalQuantity,
      };
      setOrderItems(updatedItems);
    } else {
      // Add new item
      setOrderItems([
        ...orderItems,
        {
          productId: data.productId,
          quantity: data.quantity,
          price: product.price,
          product: {
            id: product.id,
            name: product.name,
            sku: product.sku,
          },
        },
      ]);
    }

    // Reset the form and hide the add item section
    itemForm.reset({
      productId: 0,
      quantity: 1,
    });
    setShowAddItem(false);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
  };

  const isSubmitting = 
    createOrderMutation.isPending || 
    updateOrderMutation.isPending;

  // Display loading state
  if (!isNew && orderLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/orders")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-8 w-48" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Array(3)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
              
            <Skeleton className="h-6 w-32 mt-6" />
            <div className="border rounded-md p-4">
              <div className="space-y-4">
                {Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <Skeleton className="h-5 w-40 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-5 w-20" />
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Display error state
  if (!isNew && orderError) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/orders")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>

        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-zinc-500">Error loading order. Please try again.</p>
            <Button className="mt-4" onClick={() => navigate("/orders")}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/orders")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isNew ? "Create New Order" : `Order ${order?.orderNumber}`}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select
                        disabled={!isNew || customersLoading}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value ? field.value.toString() : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers?.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {!isNew && order?.date && (
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 rounded-md">
                  <span className="text-sm text-zinc-500">Order Date</span>
                  <span className="text-sm font-medium">
                    {(() => {
                      try {
                        return format(new Date(order.date), "MMMM d, yyyy");
                      } catch (error) {
                        return "Invalid date";
                      }
                    })()}
                  </span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Order Items</h3>
                  {isNew && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddItem(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  )}
                </div>

                {showAddItem && isNew && (
                  <Card className="border border-dashed">
                    <CardContent className="pt-6">
                      <Form {...itemForm}>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={itemForm.control}
                              name="productId"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Product</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          disabled={productsLoading}
                                          className={cn(
                                            "justify-between",
                                            !field.value && "text-muted-foreground"
                                          )}
                                        >
                                          {field.value
                                            ? products?.find(
                                                (product) => product.id === field.value
                                              )?.name || "Select product"
                                            : "Select product"}
                                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0">
                                      <Command>
                                        <CommandInput placeholder="Search products..." />
                                        <CommandEmpty>No products found.</CommandEmpty>
                                        <CommandGroup>
                                          <CommandList>
                                            {products?.map((product) => (
                                              <CommandItem
                                                key={product.id}
                                                value={product.name}
                                                disabled={product.stock <= 0}
                                                onSelect={() => {
                                                  field.onChange(product.id);
                                                }}
                                                className={cn(
                                                  "flex items-center justify-between",
                                                  product.stock <= 0 && "opacity-50 cursor-not-allowed"
                                                )}
                                              >
                                                <div className="flex items-center">
                                                  <span className={cn(
                                                    product.id === field.value && "font-medium"
                                                  )}>
                                                    {product.name}
                                                  </span>
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                                                  {product.stock > 0 
                                                    ? `${product.stock} in stock` 
                                                    : "Out of stock"}
                                                </span>
                                              </CommandItem>
                                            ))}
                                          </CommandList>
                                        </CommandGroup>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={itemForm.control}
                              name="quantity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Quantity</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowAddItem(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                itemForm.handleSubmit(handleAddItem)();
                              }}
                            >
                              Add to Order
                            </Button>
                          </div>
                        </div>
                      </Form>
                    </CardContent>
                  </Card>
                )}

                {orderItems.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Total</TableHead>
                          {isNew && <TableHead></TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.product?.name}</p>
                                <p className="text-sm text-zinc-500">
                                  SKU: {item.product?.sku}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{formatCurrency(item.price)}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                            {isNew && (
                              <TableCell className="text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveItem(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="border rounded-md p-8 text-center">
                    <ShoppingCart className="h-12 w-12 mx-auto text-zinc-300" />
                    <p className="mt-2 text-zinc-500">
                      {isNew ? "No items in this order yet. Click 'Add Item' to add products." : "This order has no items."}
                    </p>
                  </div>
                )}

                <div className="flex justify-end mt-4">
                  <div className="text-right">
                    <p className="text-sm text-zinc-500">Order Total</p>
                    <p className="text-xl font-bold">{formatCurrency(calculatedTotal)}</p>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any notes or special instructions"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isNew ? "Create Order" : "Update Order"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
