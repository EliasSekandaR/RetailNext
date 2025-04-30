import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export function OverviewChart() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/reports/sales"],
    staleTime: 60 * 1000, // 1 minute
  });

  if (isLoading) {
    return (
      <Card className="border-[hsl(240,3.7%,15.9%)]">
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Monthly revenue for the current year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-[hsl(240,3.7%,15.9%)]">
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Monthly revenue for the current year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center border border-dashed border-[hsl(240,3.7%,15.9%)] rounded-md relative overflow-hidden">
            <div className="absolute inset-0 grainy"></div>
            <div className="relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 text-[hsl(240,5%,64.9%)] mb-4 mx-auto opacity-50">
                <path d="M3 3v18h18"></path>
                <path d="m19 9-5 5-4-4-3 3"></path>
              </svg>
              <p className="text-center text-sm text-[hsl(240,5%,64.9%)]">
                {error ? "Failed to load sales data" : "No sales data available"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[hsl(240,3.7%,15.9%)]">
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>Monthly revenue for the current year</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,3.7%,15.9%)" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(240,5%,64.9%)"
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(240,5%,64.9%)"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(240,10%,8%)', 
                  border: '1px solid hsl(240,3.7%,15.9%)', 
                  borderRadius: '0.375rem' 
                }}
                itemStyle={{ color: 'hsl(0,0%,98%)' }}
                formatter={(value) => [`$${value}`, 'Amount']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="hsl(207,90%,54%)" 
                fill="hsl(207,90%,54%,0.2)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
