import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Plus, Search, Trash, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: "admin" | "manager" | "employee";
  lastLogin?: string;
}

export default function UsersPage() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { user: currentUser } = useAuth();
  
  // Fetch users
  const {
    data: users,
    isLoading,
    isError,
  } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Filter users based on search query
  const filteredUsers = users?.filter((user) => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.fullName.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  // Function to render role badge with appropriate color
  function getRoleBadge(role: string) {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Admin</Badge>;
      case "manager":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Manager</Badge>;
      case "employee":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Employee</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Users</CardTitle>
          <Skeleton className="h-10 w-32" />
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-red-500">Failed to load users. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        {currentUser?.role === "admin" && (
          <Button onClick={() => navigate("/users/new")}>
            <UserPlus className="mr-2 h-4 w-4" />
            New User
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <CardTitle>Users</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
              <Input
                type="search"
                placeholder="Search users..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers && filteredUsers.length > 0 ? (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.fullName}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/users/${user.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          {currentUser?.role === "admin" && currentUser.id !== user.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/users/${user.id}/delete`)}
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-zinc-500">
                {searchQuery
                  ? "No users matching your search criteria."
                  : "No users found. Click 'New User' to create one."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}