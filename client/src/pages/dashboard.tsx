import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package2, 
  Eye, 
  ArrowUpRight, 
  PlusCircle, 
  Download,
} from "lucide-react";
import { DashboardCard, formatCurrency } from "@/components/ui/dashboard-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Types
interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  newCustomers: number;
  lowStockItems: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  lowStockChange: number;
}

interface Customer {
  id: number;
  name: string;
  email: string;
}

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

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

// Helper function to get the badge variant based on order status
function getOrderStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>;
    case 'processing':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{status}</Badge>;
    case 'shipped':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{status}</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{status}</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

function getStockBadge(stock: number) {
  if (stock <= 3) {
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{stock} left</Badge>;
  }
  if (stock <= 8) {
    return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{stock} left</Badge>;
  }
  return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{stock} left</Badge>;
}

export default function Dashboard() {
  // Fetch dashboard statistics
  const { 
    data: stats, 
    isLoading: statsLoading 
  } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });
  
  // Fetch recent orders
  const { 
    data: recentOrders, 
    isLoading: ordersLoading 
  } = useQuery<Order[]>({
    queryKey: ['/api/orders/recent'],
  });
  
  // Fetch low stock products
  const { 
    data: lowStockProducts, 
    isLoading: productsLoading 
  } = useQuery<Product[]>({
    queryKey: ['/api/products/low-stock'],
  });
  
  // Fetch recent customers
  const { 
    data: recentCustomers, 
    isLoading: customersLoading 
  } = useQuery<Customer[]>({
    queryKey: ['/api/customers/recent'],
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <div className="hidden md:flex">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-36" />
            </Card>
          ))
        ) : (
          <>
            <DashboardCard
              title="Total Revenue"
              value={formatCurrency(stats?.totalRevenue || 0)}
              icon={DollarSign}
              change={{
                value: stats?.revenueChange || 0,
                label: "vs last month",
                positive: true
              }}
            />
            <DashboardCard
              title="Total Orders"
              value={stats?.totalOrders || 0}
              icon={ShoppingBag}
              change={{
                value: stats?.ordersChange || 0,
                label: "vs last month",
                positive: true
              }}
            />
            <DashboardCard
              title="New Customers"
              value={stats?.newCustomers || 0}
              icon={Users}
              change={{
                value: stats?.customersChange || 0,
                label: "vs last month",
                positive: true
              }}
            />
            <DashboardCard
              title="Low Stock Items"
              value={stats?.lowStockItems || 0}
              icon={Package2}
              change={{
                value: stats?.lowStockChange || 0,
                label: "more than last month",
                positive: false
              }}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="px-6 py-4 border-b border-zinc-200 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium text-zinc-900">Recent Orders</CardTitle>
              <Link href="/orders">
                <Button variant="link" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
                  View all
                </Button>
              </Link>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200">
                <thead className="bg-zinc-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Order</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Customer</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Total</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-zinc-200">
                  {ordersLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-16" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-16" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Skeleton className="h-4 w-6 ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    recentOrders?.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                          {order.orderNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                          {order.customer?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                          {format(new Date(order.date), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getOrderStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/orders/${order.id}`}>
                            <Button variant="ghost" size="icon" className="text-zinc-600 hover:text-zinc-900">
                              <Eye className="h-5 w-5" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
              <div className="flex items-center justify-between">
                <div className="hidden sm:block">
                  <p>Showing {recentOrders?.length || 0} of {stats?.totalOrders || 0} orders</p>
                </div>
                <div className="flex justify-center sm:justify-end">
                  <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button variant="outline" size="icon" className="rounded-l-md">
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </Button>
                    <Button variant="outline" className="bg-zinc-100 text-zinc-900" size="icon">1</Button>
                    <Button variant="outline" size="icon">2</Button>
                    <Button variant="outline" size="icon" className="hidden md:inline-flex">3</Button>
                    <Button variant="outline" size="icon">...</Button>
                    <Button variant="outline" size="icon" className="hidden md:inline-flex">24</Button>
                    <Button variant="outline" size="icon" className="rounded-r-md">
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div>
          {/* Stock Alerts */}
          <Card>
            <CardHeader className="px-6 py-4 border-b border-zinc-200 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium text-zinc-900">Stock Alerts</CardTitle>
              <Link href="/products">
                <Button variant="link" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
                  View all
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {productsLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-14" />
                  </div>
                ))
              ) : (
                lowStockProducts?.map((product) => (
                  <div key={product.id} className="flex items-center space-x-4">
                    <div className="h-12 w-12 flex-shrink-0 bg-zinc-100 rounded-md flex items-center justify-center">
                      <Package2 className="h-6 w-6 text-zinc-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">{product.name}</p>
                      <p className="text-sm text-zinc-500">SKU: {product.sku}</p>
                    </div>
                    <div>
                      {getStockBadge(product.stock)}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
            <div className="border-t border-zinc-200 px-6 py-4">
              <Link href="/products">
                <Button variant="outline" className="w-full">
                  <Package2 className="h-5 w-5 mr-2 text-zinc-500" />
                  Restock Products
                </Button>
              </Link>
            </div>
          </Card>

          {/* Recent Customers */}
          <Card className="mt-6">
            <CardHeader className="px-6 py-4 border-b border-zinc-200 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium text-zinc-900">Recent Customers</CardTitle>
              <Link href="/customers">
                <Button variant="link" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
                  View all
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {customersLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="h-4 w-10" />
                  </div>
                ))
              ) : (
                recentCustomers?.map((customer) => (
                  <div key={customer.id} className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-300 flex-shrink-0 flex items-center justify-center">
                      <span className="text-sm font-medium text-zinc-600">
                        {customer.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">{customer.name}</p>
                      <p className="text-sm text-zinc-500">{customer.email}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
