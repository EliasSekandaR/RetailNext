import { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: "admin" | "manager" | "employee";
  password?: string;
}

// Define validation schema
const userFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2, "Full name is required"),
  role: z.enum(["admin", "manager", "employee"]),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // If password is provided, confirmPassword must match
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  isNew?: boolean;
}

export default function UserForm({ isNew = false }: UserFormProps) {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  // Setup form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      role: "employee",
      password: isNew ? "" : undefined,
      confirmPassword: isNew ? "" : undefined,
    },
  });

  // Fetch user if editing
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useQuery<User>({
    queryKey: [`/api/users/${id}`],
    enabled: !isNew && !!id,
  });

  // Update form when user data is loaded
  useEffect(() => {
    if (user && !isNew) {
      form.reset({
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      });
    }
  }, [user, form, isNew]);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      const response = await apiRequest("POST", "/api/users", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User created",
        description: "The user has been created successfully.",
      });
      navigate("/users");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create the user.",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      const response = await apiRequest("PUT", `/api/users/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${id}`] });
      toast({
        title: "User updated",
        description: "The user has been updated successfully.",
      });
      navigate("/users");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update the user.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UserFormValues) => {
    // Remove confirmPassword as it's not needed in the API call
    const { confirmPassword, ...submitData } = data;
    
    // Only include password if it's provided (for updates)
    if (!isNew && !submitData.password) {
      delete submitData.password;
    }
    
    if (isNew) {
      createUserMutation.mutate(submitData);
    } else {
      updateUserMutation.mutate(submitData);
    }
  };

  const isSubmitting = 
    createUserMutation.isPending || 
    updateUserMutation.isPending;

  // Non-admin users can't access this page (except for their own profile)
  if (currentUser?.role !== "admin" && (!id || currentUser?.id !== parseInt(id))) {
    navigate("/dashboard");
    return null;
  }
  
  // Display loading state
  if (!isNew && userLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/users")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-8 w-48" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Array(4)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Display error state
  if (!isNew && userError) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/users")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </div>

        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-zinc-500">Error loading user. Please try again.</p>
            <Button className="mt-4" onClick={() => navigate("/users")}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine if current user is editing their own profile
  const isSelfEdit = !isNew && currentUser?.id === parseInt(id || "0");

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/users")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isNew ? "Create New User" : `Edit User: ${user?.fullName}`}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} />
                      </FormControl>
                      <FormDescription>
                        Used for login. Cannot be changed later.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        disabled={!currentUser || currentUser.role !== "admin" || isSelfEdit}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="employee">Employee</SelectItem>
                        </SelectContent>
                      </Select>
                      {isSelfEdit && (
                        <FormDescription>
                          You cannot change your own role.
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isNew ? "Password" : "New Password (optional)"}</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      {!isNew && (
                        <FormDescription>
                          Leave blank to keep current password.
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isNew ? "Create User" : "Update User"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}