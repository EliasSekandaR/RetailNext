import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Home,
  Package2,
  Users,
  ShoppingBag,
  BarChart2,
  Settings,
  User,
  UserCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const isAdminOrManager = user && ['admin', 'manager'].includes(user.role);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Products", href: "/products", icon: Package2 },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Orders", href: "/orders", icon: ShoppingBag },
    { name: "Reports", href: "/reports", icon: BarChart2, show: isAdminOrManager },
    { name: "Users", href: "/users", icon: UserCircle, show: isAdminOrManager },
    { name: "Settings", href: "/settings", icon: Settings },
  ].filter(item => item.show !== false);

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight">RetailPro</h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
                  active
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                )}
                onClick={onClose}
              >
                <Icon className="h-5 w-5 mr-3 text-zinc-500" />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-zinc-200">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900">{user?.fullName || 'User'}</p>
            <p className="text-xs text-zinc-500">{user?.email || ''}</p>
            <p className="text-xs bg-zinc-100 text-zinc-600 rounded px-1.5 py-0.5 mt-1 inline-block capitalize">
              {user?.role || 'Employee'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
