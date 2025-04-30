import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { format } from "date-fns";
import { ArrowLeft, Download, CheckCircle, Package, Truck, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { generateInvoice } from "@/lib/invoiceGenerator";

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Helper function to get status badge
const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
    case "processing":
      return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
    case "shipped":
      return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>;
    case "cancelled":
      return <Badge className="bg-red-100 text-red-800">{status}</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "processing":
      return <Package className="h-5 w-5 text-yellow-500" />;
    case "shipped":
      return <Truck className="h-5 w-5 text-blue-500" />;
    case "cancelled":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return null;
  }
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Determine if user has permissions to manage orders
  const canManageOrders = user?.role === "admin" || user?.role === "manager";

  // Fetch order details
  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!orderId,
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest("PATCH", `/api/orders/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Status updated",
        description: "The order status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update the order status.",
        variant: "destructive",
      });
    },
  });

  // Handler for updating order status
  const handleUpdateStatus = (id: number, status: string) => {
    updateOrderStatusMutation.mutate({ id, status });
  };

  // Display loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/orders")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>

        <Card>
          <CardHeader className="space-y-4 pb-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-16 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
            
            <div>
              <Skeleton className="h-4 w-32 mb-3" />
              <Skeleton className="h-24 w-full" />
            </div>
            
            <div>
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Display error state
  if (isError || !order) {
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
            <p className="text-zinc-500">
              {error instanceof Error ? error.message : "Error loading order. Please try again."}
            </p>
            <Button className="mt-4" onClick={() => navigate("/orders")}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate order total
  const orderTotal = order.items
    ? order.items.reduce((total, item) => total + item.price * item.quantity, 0)
    : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/orders")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold mb-1">Order {order.orderNumber}</CardTitle>
              <CardDescription>
                Placed on{" "}
                {(() => {
                  try {
                    return format(new Date(order.date), "MMMM d, yyyy");
                  } catch (error) {
                    return "Invalid date";
                  }
                })()}
              </CardDescription>
            </div>
            <div className="flex items-center">
              {getStatusIcon(order.status)}
              <span className="ml-2">{getStatusBadge(order.status)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-500">Customer Information</h3>
              <div className="bg-zinc-50 p-4 rounded-md">
                <p className="font-medium">{order.customer?.name}</p>
                <p className="text-zinc-500 text-sm">{order.customer?.email}</p>
                {order.customer?.phone && (
                  <p className="text-zinc-500 text-sm">{order.customer?.phone}</p>
                )}
                {order.customer?.address && (
                  <p className="text-zinc-500 text-sm mt-2">{order.customer?.address}</p>
                )}
                {order.customer?.city && (
                  <p className="text-zinc-500 text-sm">
                    {order.customer?.city}
                    {order.customer?.state && `, ${order.customer?.state}`}
                    {order.customer?.zipCode && ` ${order.customer?.zipCode}`}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-500">Order Summary</h3>
              <div className="bg-zinc-50 p-4 rounded-md">
                <div className="flex justify-between mb-1">
                  <span className="text-zinc-500 text-sm">Subtotal</span>
                  <span>{formatCurrency(orderTotal)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-zinc-500 text-sm">Tax</span>
                  <span>{formatCurrency(orderTotal * 0.07)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(orderTotal * 1.07)}</span>
                </div>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-500">Order Notes</h3>
              <div className="bg-zinc-50 p-4 rounded-md">
                <p className="text-sm">{order.notes}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Order Items</h3>
            {order.items && order.items.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-zinc-500 text-center py-4 bg-zinc-50 rounded-md">
                No items found for this order.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button 
            variant="outline" 
            className="space-x-2"
            onClick={() => {
              try {
                generateInvoice(order);
                toast({
                  title: "Invoice Generated",
                  description: "Your invoice has been generated and downloaded.",
                });
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to generate invoice. Please try again.",
                  variant: "destructive",
                });
              }
            }}
          >
            <Download className="h-4 w-4" />
            <span>Download Invoice</span>
          </Button>

          {canManageOrders && (
            <div className="flex space-x-2">
              {order.status !== "processing" && (
                <Button
                  variant="outline"
                  className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                  onClick={() => handleUpdateStatus(order.id, "processing")}
                  disabled={updateOrderStatusMutation.isPending}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Mark Processing
                </Button>
              )}
              {order.status !== "shipped" && (
                <Button
                  variant="outline"
                  className="border-blue-500 text-blue-700 hover:bg-blue-50"
                  onClick={() => handleUpdateStatus(order.id, "shipped")}
                  disabled={updateOrderStatusMutation.isPending}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Mark Shipped
                </Button>
              )}
              {order.status !== "completed" && (
                <Button
                  variant="outline"
                  className="border-green-500 text-green-700 hover:bg-green-50"
                  onClick={() => handleUpdateStatus(order.id, "completed")}
                  disabled={updateOrderStatusMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Completed
                </Button>
              )}
              {order.status !== "cancelled" && (
                <Button
                  variant="outline"
                  className="border-red-500 text-red-700 hover:bg-red-50"
                  onClick={() => handleUpdateStatus(order.id, "cancelled")}
                  disabled={updateOrderStatusMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Mark Cancelled
                </Button>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}