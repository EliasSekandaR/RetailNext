import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change: {
    value: number;
    label: string;
    positive?: boolean;
  };
}

export function formatCurrency(amount: number): string {
  // Convert from cents to dollars
  const dollars = amount / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(dollars);
}

export function DashboardCard({ title, value, icon: Icon, change }: DashboardCardProps) {
  const isPositive = change.positive !== undefined ? change.positive : change.value >= 0;
  const absChangeValue = Math.abs(change.value);
  
  return (
    <div className="bg-white shadow rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-normal text-zinc-500">{title}</h3>
          <span className="text-2xl font-bold leading-none text-zinc-900">{value}</span>
          <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'} mt-2`}>
            {isPositive ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            )}
            <span className="ml-1">{typeof absChangeValue === 'number' && !isNaN(absChangeValue) ? 
              `${absChangeValue}${absChangeValue % 1 === 0 ? '' : '%'} ${change.label}` : 
              change.label}</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
          <Icon className="h-6 w-6 text-zinc-500" />
        </div>
      </div>
    </div>
  );
}
