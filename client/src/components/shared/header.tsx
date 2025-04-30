import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Bell, Settings, User, Search, Menu, PlusCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      setLocation('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="text-zinc-500 hover:text-zinc-600 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="ml-3 text-xl font-bold tracking-tight">RetailPro</h1>
        </div>
        
        <div className="md:flex-1 md:ml-4 relative max-w-md hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-400" />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-zinc-300 rounded-md leading-5 bg-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 text-sm" 
            placeholder="Search for products, customers, orders..."
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/orders/new">
            <Button className="hidden md:inline-flex" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-zinc-600 focus:outline-none">
            <Bell className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-zinc-600 focus:outline-none md:inline-flex hidden">
            <Settings className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-zinc-500 hover:text-zinc-600 focus:outline-none"
            title="Logout"
          >
            <LogOut className="h-6 w-6" />
          </Button>
          <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 md:hidden">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
