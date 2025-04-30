import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, LineChart, BarChart3, PieChart } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsThePieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/components/ui/dashboard-card";

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

interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  date: string;
  status: string;
  total: number;
}

interface SalesData {
  name: string;
  value: number;
}

// Sample data for charts as the API doesn't provide aggregated data
const salesByMonth = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 2000 },
  { name: "Apr", sales: 2780 },
  { name: "May", sales: 1890 },
  { name: "Jun", sales: 2390 },
  { name: "Jul", sales: 3490 },
  { name: "Aug", sales: 2478 },
  { name: "Sep", sales: 2980 },
  { name: "Oct", sales: 3480 },
  { name: "Nov", sales: 4000 },
  { name: "Dec", sales: 5000 },
];

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

export default function ReportsPage() {
  const [timeframe, setTimeframe] = useState("year");
  const [activeTab, setActiveTab] = useState("sales");

  // Fetch products
  const {
    data: products,
    isLoading: productsLoading,
  } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Fetch customers
  const {
    data: customers,
    isLoading: customersLoading,
  } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Fetch orders
  const {
    data: orders,
    isLoading: ordersLoading,
  } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Process data for category breakdown chart
  const getCategoryData = () => {
    if (!products) return [];
    
    const categoryCount: Record<string, number> = {};
    products.forEach(product => {
      const category = product.category || 'Uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    return Object.entries(categoryCount).map(([name, value]) => ({ name, value }));
  };

  // Process data for stock levels chart
  const getStockData = () => {
    if (!products) return [];
    
    const stockRanges = [
      { name: 'Out of Stock', value: 0 },
      { name: '1-5 Items', value: 0 },
      { name: '6-20 Items', value: 0 },
      { name: '21-50 Items', value: 0 },
      { name: '50+ Items', value: 0 },
    ];
    
    products.forEach(product => {
      if (product.stock === 0) {
        stockRanges[0].value++;
      } else if (product.stock <= 5) {
        stockRanges[1].value++;
      } else if (product.stock <= 20) {
        stockRanges[2].value++;
      } else if (product.stock <= 50) {
        stockRanges[3].value++;
      } else {
        stockRanges[4].value++;
      }
    });
    
    return stockRanges;
  };

  // Process data for order status breakdown chart
  const getOrderStatusData = () => {
    if (!orders) return [];
    
    const statusCount: Record<string, number> = {};
    orders.forEach(order => {
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;
    });
    
    return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
  };

  // Helper to format currency in tooltip
  const formatTooltipCurrency = (value: number) => {
    return formatCurrency(value * 100); // Multiply by 100 to convert to cents for consistency
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 md:grid-cols-5 md:w-auto">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        {/* Sales Report Tab */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Sales Over Time</CardTitle>
                <CardDescription>Monthly sales performance</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {ordersLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={salesByMonth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#0088FE" 
                        fillOpacity={1} 
                        fill="url(#colorSales)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
                <CardDescription>Sales distribution across product categories</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {productsLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsThePieChart>
                      <Pie
                        data={getCategoryData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getCategoryData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value} />
                      <Legend />
                    </RechartsThePieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Products with highest revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={products?.slice(0, 5).map(p => ({ name: p.name, revenue: p.price / 100 }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={formatTooltipCurrency} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Report Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Categories</CardTitle>
                <CardDescription>Products distribution by category</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {productsLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsThePieChart>
                      <Pie
                        data={getCategoryData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getCategoryData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value} />
                      <Legend />
                    </RechartsThePieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Pricing</CardTitle>
                <CardDescription>Distribution of products by price range</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {productsLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { range: '$0-$50', count: products?.filter(p => p.price <= 5000).length || 0 },
                        { range: '$50-$100', count: products?.filter(p => p.price > 5000 && p.price <= 10000).length || 0 },
                        { range: '$100-$200', count: products?.filter(p => p.price > 10000 && p.price <= 20000).length || 0 },
                        { range: '$200-$500', count: products?.filter(p => p.price > 20000 && p.price <= 50000).length || 0 },
                        { range: '$500+', count: products?.filter(p => p.price > 50000).length || 0 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Products" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Levels</CardTitle>
              <CardDescription>Stock distribution across all products</CardDescription>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={getStockData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Products" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Report Tab */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>New customers over time</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {customersLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart
                      data={salesByMonth.map((month, index) => ({
                        name: month.name,
                        customers: Math.floor(Math.random() * 10) + 1, // Mock data
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="customers"
                        name="New Customers"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Spending</CardTitle>
                <CardDescription>Distribution of customer spending</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {customersLoading || ordersLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { range: '$0-$100', count: 12 },
                        { range: '$100-$500', count: 18 },
                        { range: '$500-$1000', count: 8 },
                        { range: '$1000-$5000', count: 5 },
                        { range: '$5000+', count: 2 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Customers" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Repeat Customers</CardTitle>
              <CardDescription>Repeat purchase rate over time</CardDescription>
            </CardHeader>
            <CardContent>
              {customersLoading || ordersLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={salesByMonth.map((month) => ({
                      name: month.name,
                      newCustomers: Math.floor(Math.random() * 10) + 1,
                      returningCustomers: Math.floor(Math.random() * 15) + 5,
                    }))}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorReturning" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="newCustomers"
                      name="New Customers"
                      stroke="#8884d8"
                      fillOpacity={1}
                      fill="url(#colorNew)"
                    />
                    <Area
                      type="monotone"
                      dataKey="returningCustomers"
                      name="Returning Customers"
                      stroke="#82ca9d"
                      fillOpacity={1}
                      fill="url(#colorReturning)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Report Tab */}
        <TabsContent value="orders" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
                <CardDescription>Distribution of orders by status</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {ordersLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsThePieChart>
                      <Pie
                        data={getOrderStatusData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getOrderStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value} />
                      <Legend />
                    </RechartsThePieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Orders Over Time</CardTitle>
                <CardDescription>Number of orders by month</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {ordersLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart
                      data={salesByMonth.map((month) => ({
                        name: month.name,
                        orders: Math.floor(sales => sales / 50),
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        name="Orders"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Average Order Value</CardTitle>
              <CardDescription>Average order value over time</CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={salesByMonth.map((month) => ({
                      name: month.name,
                      average: (month.sales / (Math.floor(Math.random() * 10) + 15)).toFixed(2),
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend />
                    <Bar dataKey="average" name="Average Order Value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Report Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Stock Levels</CardTitle>
                <CardDescription>Distribution of products by stock level</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {productsLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsThePieChart>
                      <Pie
                        data={getStockData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getStockData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value} />
                      <Legend />
                    </RechartsThePieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Low Stock Items</CardTitle>
                <CardDescription>Products with critical stock levels</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {productsLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px] overflow-auto">
                    <table className="min-w-full divide-y divide-zinc-200">
                      <thead className="bg-zinc-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                            SKU
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                            Stock
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-zinc-200">
                        {products?.filter(p => p.stock <= 5)
                          .map(product => (
                            <tr key={product.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                                {product.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                                {product.sku}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  product.stock === 0
                                    ? "bg-red-100 text-red-800"
                                    : product.stock <= 3
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}>
                                  {product.stock} left
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Value</CardTitle>
              <CardDescription>Total value of inventory by category</CardDescription>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={(() => {
                      const categories: Record<string, number> = {};
                      products?.forEach(product => {
                        const category = product.category || 'Uncategorized';
                        categories[category] = (categories[category] || 0) + (product.price * product.stock);
                      });
                      return Object.entries(categories).map(([name, value]) => ({
                        name,
                        value: value / 100, // Convert from cents to dollars
                      }));
                    })()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={formatTooltipCurrency} />
                    <Legend />
                    <Bar dataKey="value" name="Inventory Value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
