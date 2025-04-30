import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

export function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return (
    <Card className="border-[hsl(240,3.7%,15.9%)]">
      <CardContent className="p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">{title}</h3>
          <Icon className="h-4 w-4 text-[hsl(240,5%,64.9%)]" />
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-[hsl(240,5%,64.9%)]">{description}</p>
      </CardContent>
    </Card>
  );
}
