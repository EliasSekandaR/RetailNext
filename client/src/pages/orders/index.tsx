import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  PlusCircle,
  Search,
  Eye,
  MoreVertical,
  Download,
  Package,
  Truck, 
  CheckCircle,
  XCircle
} from "lucide-react";
import { formatCurrency } from "@/components/ui/dashboard-card";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { generateInvoice } from "@/lib/invoiceGenerator";

interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  date: string;
  status: string;
  total: number;
  customer?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function OrdersPage() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { user } = useAuth();
  const { toast } = useToast();

  // Determine if user has permissions to manage orders
  const canManageOrders = user?.role === "admin" || user?.role === "manager";

  // Fetch orders
  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest("PATCH", `/api/orders/${id}`, { status });
    },
    onSuccess: () => {
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

  // Helper function to get the badge based on order status
  function getOrderStatusBadge(status: string) {
    switch (status.toLowerCase()) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>;
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{status}</Badge>;
      case "shipped":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{status}</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  }

  // Filter orders based on search query and status filter
  const filteredOrders = orders?.filter((order) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(query) ||
      (order.customer?.name || "").toLowerCase().includes(query) ||
      (order.customer?.email || "").toLowerCase().includes(query);

    const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Link href="/orders/new">
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b border-zinc-200">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-zinc-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search orders..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-36" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-zinc-500">
                    Error loading orders. Please try again.
                  </TableCell>
                </TableRow>
              ) : filteredOrders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-zinc-500">
                    No orders found. {searchQuery || statusFilter !== "all" ? "Try different filters." : ""}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customer?.name}</TableCell>
                    <TableCell>
                      {(() => {
                        try {
                          return format(new Date(order.date), "MMM d, yyyy");
                        } catch (error) {
                          return "Invalid date";
                        }
                      })()}
                    </TableCell>
                    <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-zinc-500 hover:text-zinc-900 h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Order
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async () => {
                              try {
                                // Fetch order details to get items
                                const response = await apiRequest("GET", `/api/orders/${order.id}`);
                                const orderDetails = await response.json();
                                
                                // Generate and download invoice
                                await generateInvoice(orderDetails);
                                
                                toast({
                                  title: "Invoice Generated",
                                  description: "Your invoice has been generated and downloaded."
                                });
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to generate invoice. Please try again.",
                                  variant: "destructive"
                                });
                              }
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Invoice
                          </DropdownMenuItem>
                          
                          {canManageOrders && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                              
                              {order.status !== "pending" && (
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(order.id, "pending")}
                                  disabled={updateOrderStatusMutation.isPending}
                                >
                                  <Badge className="mr-2">Pending</Badge>
                                  Mark as Pending
                                </DropdownMenuItem>
                              )}
                              
                              {order.status !== "processing" && (
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(order.id, "processing")}
                                  disabled={updateOrderStatusMutation.isPending}
                                >
                                  <Package className="h-4 w-4 mr-2 text-yellow-500" />
                                  Mark as Processing
                                </DropdownMenuItem>
                              )}
                              
                              {order.status !== "shipped" && (
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(order.id, "shipped")}
                                  disabled={updateOrderStatusMutation.isPending}
                                >
                                  <Truck className="h-4 w-4 mr-2 text-blue-500" />
                                  Mark as Shipped
                                </DropdownMenuItem>
                              )}
                              
                              {order.status !== "completed" && (
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(order.id, "completed")}
                                  disabled={updateOrderStatusMutation.isPending}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                  Mark as Completed
                                </DropdownMenuItem>
                              )}
                              
                              {order.status !== "cancelled" && (
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(order.id, "cancelled")}
                                  disabled={updateOrderStatusMutation.isPending}
                                >
                                  <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                  Mark as Cancelled
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}