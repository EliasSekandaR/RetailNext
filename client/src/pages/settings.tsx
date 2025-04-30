import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { 
  Store, 
  Users, 
  CreditCard, 
  Bell, 
  Shield, 
  Database,
  Mail,
  Smartphone,
  Truck,
  Percent,
  Save
} from "lucide-react";

// Define validation schema for general settings
const generalSettingsSchema = z.object({
  storeName: z.string().min(2, "Store name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
  logoUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  currency: z.string().min(1, "Currency is required"),
  taxRate: z.coerce.number().min(0, "Tax rate cannot be negative").max(100, "Tax rate cannot exceed 100%"),
});

// Define validation schema for notification settings
const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  lowStockAlerts: z.boolean(),
  orderUpdates: z.boolean(),
  marketingEmails: z.boolean(),
});

type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;
type NotificationSettingsFormValues = z.infer<typeof notificationSettingsSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  // Setup general settings form
  const generalForm = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      storeName: "RetailPro",
      email: "admin@retailpro.com",
      phone: "555-123-4567",
      address: "123 Main Street",
      city: "Anytown",
      state: "CA",
      zipCode: "12345",
      logoUrl: "",
      currency: "USD",
      taxRate: 8.5,
    },
  });

  // Setup notification settings form
  const notificationForm = useForm<NotificationSettingsFormValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: false,
      lowStockAlerts: true,
      orderUpdates: true,
      marketingEmails: false,
    },
  });

  const onGeneralSettingsSubmit = (data: GeneralSettingsFormValues) => {
    console.log("General settings submitted:", data);
    toast({
      title: "Settings saved",
      description: "Your general settings have been updated successfully.",
    });
  };

  const onNotificationSettingsSubmit = (data: NotificationSettingsFormValues) => {
    console.log("Notification settings submitted:", data);
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated successfully.",
    });
  };

  // Helper toggle component for notification settings
  const ToggleItem = ({ 
    label, 
    description, 
    field,
    onChange
  }: { 
    label: string; 
    description: string; 
    field: any;
    onChange?: (checked: boolean) => void;
  }) => (
    <div className="flex items-center justify-between space-y-0 py-4">
      <div className="space-y-0.5">
        <Label className="text-base">{label}</Label>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      <Switch
        checked={field.value}
        onCheckedChange={(checked) => {
          field.onChange(checked);
          if (onChange) onChange(checked);
        }}
      />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 md:w-auto">
          <TabsTrigger value="general" className="flex items-center">
            <Store className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center">
            <Database className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Integrations</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage your store information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form onSubmit={generalForm.handleSubmit(onGeneralSettingsSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Store Information</h3>
                    
                    <FormField
                      control={generalForm.control}
                      name="storeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={generalForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={generalForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={generalForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={generalForm.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://example.com/logo.png" />
                          </FormControl>
                          <FormDescription>
                            Enter the URL of your store logo (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Currency and Tax Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={generalForm.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="USD">US Dollar (USD)</SelectItem>
                                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                                <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                                <SelectItem value="AUD">Australian Dollar (AUD)</SelectItem>
                                <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="taxRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Tax Rate (%)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="0.1" min="0" max="100" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-zinc-50 p-8 text-center rounded-lg">
                <Users className="h-12 w-12 mx-auto text-zinc-300" />
                <h3 className="mt-4 text-lg font-medium">User Management</h3>
                <p className="mt-2 text-zinc-500">
                  This feature is coming soon. You'll be able to add, remove, and manage user accounts and permissions.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing and Subscription</CardTitle>
              <CardDescription>
                Manage your billing information and subscription details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-zinc-50 p-8 text-center rounded-lg">
                <CreditCard className="h-12 w-12 mx-auto text-zinc-300" />
                <h3 className="mt-4 text-lg font-medium">Billing Information</h3>
                <p className="mt-2 text-zinc-500">
                  This feature is coming soon. You'll be able to manage your payment methods and subscription details.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSettingsSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Channels</h3>
                    
                    <div className="border rounded-md p-4 space-y-2">
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <ToggleItem
                            label="Email Notifications"
                            description="Receive notifications via email"
                            field={field}
                          />
                        )}
                      />

                      <Separator />

                      <FormField
                        control={notificationForm.control}
                        name="smsNotifications"
                        render={({ field }) => (
                          <ToggleItem
                            label="SMS Notifications"
                            description="Receive notifications via text message"
                            field={field}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Types</h3>
                    
                    <div className="border rounded-md p-4 space-y-2">
                      <FormField
                        control={notificationForm.control}
                        name="lowStockAlerts"
                        render={({ field }) => (
                          <ToggleItem
                            label="Low Stock Alerts"
                            description="Get notified when products are running low on stock"
                            field={field}
                          />
                        )}
                      />

                      <Separator />

                      <FormField
                        control={notificationForm.control}
                        name="orderUpdates"
                        render={({ field }) => (
                          <ToggleItem
                            label="Order Updates"
                            description="Get notified about new orders and status changes"
                            field={field}
                          />
                        )}
                      />

                      <Separator />

                      <FormField
                        control={notificationForm.control}
                        name="marketingEmails"
                        render={({ field }) => (
                          <ToggleItem
                            label="Marketing Emails"
                            description="Receive promotional and marketing emails"
                            field={field}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-zinc-50 p-8 text-center rounded-lg">
                <Shield className="h-12 w-12 mx-auto text-zinc-300" />
                <h3 className="mt-4 text-lg font-medium">Security Features</h3>
                <p className="mt-2 text-zinc-500">
                  This feature is coming soon. You'll be able to change your password, set up two-factor authentication, and view security logs.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect your store with third-party services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-md bg-zinc-100 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-zinc-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Email Marketing</h3>
                      <p className="text-sm text-zinc-500">Integrate with email marketing services</p>
                    </div>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-md bg-zinc-100 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-zinc-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Payment Processors</h3>
                      <p className="text-sm text-zinc-500">Connect with payment providers</p>
                    </div>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-md bg-zinc-100 flex items-center justify-center">
                      <Truck className="h-6 w-6 text-zinc-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Shipping Services</h3>
                      <p className="text-sm text-zinc-500">Integrate with shipping providers</p>
                    </div>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-md bg-zinc-100 flex items-center justify-center">
                      <Percent className="h-6 w-6 text-zinc-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Discount Apps</h3>
                      <p className="text-sm text-zinc-500">Add discount and promotion apps</p>
                    </div>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
