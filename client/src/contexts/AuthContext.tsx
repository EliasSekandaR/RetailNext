import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: "admin" | "manager" | "employee";
  darkMode: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (roles: string[]) => boolean;
  toggleDarkMode: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Fetch session status
  const { data, isError } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (data && typeof data === 'object') {
      setUser(data as User);
      // Set dark mode from user preferences
      if ((data as User).darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else if (isError) {
      setUser(null);
    }
    setIsLoading(false);
  }, [data, isError]);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiRequest("POST", "/api/login", { 
        username, 
        password 
      });
      
      const userData = await response.json();
      setUser(userData as User);
      
      // Apply dark mode
      if (userData.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      
      // Refresh auth state
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      setUser(null);
      // Clear queries
      queryClient.clear();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const hasPermission = (roles: string[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const toggleDarkMode = async () => {
    if (!user) return;
    
    try {
      const newDarkMode = !user.darkMode;
      const response = await apiRequest(
        "PATCH", 
        `/api/users/${user.id}/preferences/dark-mode`, 
        { darkMode: newDarkMode }
      );
      
      // Update user state
      setUser({ ...user, darkMode: newDarkMode });
      
      // Apply dark mode
      if (newDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      
      // Refresh auth state
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    } catch (error) {
      console.error("Failed to toggle dark mode:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
        toggleDarkMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}