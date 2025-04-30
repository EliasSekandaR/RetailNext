import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 border-r border-[hsl(240,3.7%,15.9%)] hidden md:block h-screen overflow-y-auto fixed">
      <div className="py-6 px-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <path d="m7.5 4.27 9 5.15"></path>
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
          <path d="m3.3 7 8.7 5 8.7-5"></path>
          <path d="M12 22V12"></path>
        </svg>
        <h1 className="text-lg font-bold">RetailPro</h1>
      </div>
      
      <nav className="mt-2 px-2">
        <div className="px-3 py-2 text-sm font-medium text-[hsl(240,5%,64.9%)]">Overview</div>
        <Link href="/">
          <a className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
            location === "/" 
              ? "bg-[hsl(240,3.7%,15.9%)] text-white" 
              : "text-[hsl(0,0%,98%)] hover:bg-[hsl(240,3.7%,15.9%)]"
          )}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <rect width="7" height="9" x="3" y="3" rx="1"></rect>
              <rect width="7" height="5" x="14" y="3" rx="1"></rect>
              <rect width="7" height="9" x="14" y="12" rx="1"></rect>
              <rect width="7" height="5" x="3" y="16" rx="1"></rect>
            </svg>
            Dashboard
          </a>
        </Link>
        
        <div className="mt-6 px-3 py-2 text-sm font-medium text-[hsl(240,5%,64.9%)]">Management</div>
        <Link href="/products">
          <a className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
            location === "/products" || location.startsWith("/products/") 
              ? "bg-[hsl(240,3.7%,15.9%)] text-white" 
              : "text-[hsl(0,0%,98%)] hover:bg-[hsl(240,3.7%,15.9%)]"
          )}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="m7.5 4.27 9 5.15"></path>
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
              <path d="m3.3 7 8.7 5 8.7-5"></path>
              <path d="M12 22V12"></path>
            </svg>
            Products
          </a>
        </Link>
        <Link href="/customers">
          <a className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
            location === "/customers" || location.startsWith("/customers/") 
              ? "bg-[hsl(240,3.7%,15.9%)] text-white" 
              : "text-[hsl(0,0%,98%)] hover:bg-[hsl(240,3.7%,15.9%)]"
          )}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Customers
          </a>
        </Link>
        <Link href="/orders">
          <a className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
            location === "/orders" || location.startsWith("/orders/") 
              ? "bg-[hsl(240,3.7%,15.9%)] text-white" 
              : "text-[hsl(0,0%,98%)] hover:bg-[hsl(240,3.7%,15.9%)]"
          )}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M9 11V6a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v5"></path>
              <path d="M9 11h6"></path>
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
            </svg>
            Orders
          </a>
        </Link>
        
        <div className="mt-6 px-3 py-2 text-sm font-medium text-[hsl(240,5%,64.9%)]">Reports</div>
        <Link href="/reports/sales">
          <a className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
            location === "/reports/sales"
              ? "bg-[hsl(240,3.7%,15.9%)] text-white" 
              : "text-[hsl(0,0%,98%)] hover:bg-[hsl(240,3.7%,15.9%)]"
          )}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
              <line x1="3" x2="21" y1="9" y2="9"></line>
              <line x1="9" x2="9" y1="21" y2="9"></line>
            </svg>
            Sales Report
          </a>
        </Link>
      </nav>
    </div>
  );
}
