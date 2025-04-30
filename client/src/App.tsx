import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layouts/app-layout";
import Dashboard from "@/pages/dashboard";
import ProductsPage from "@/pages/products";
import ProductForm from "@/pages/products/product-form";
import CustomersPage from "@/pages/customers";
import CustomerForm from "@/pages/customers/customer-form";
import OrdersPage from "@/pages/orders";
import OrderForm from "@/pages/orders/order-form";
import ReportsPage from "@/pages/reports";
import SettingsPage from "@/pages/settings";
import UsersPage from "@/pages/users";
import NewUserPage from "@/pages/users/new";
import EditUserPage from "@/pages/users/[id]";
import LoginPage from "@/pages/login";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function DashboardRouter() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/dashboard" component={() => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )} />
        <Route path="/products" component={() => (
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        )} />
        <Route path="/products/new" component={() => (
          <ProtectedRoute roles={["admin", "manager"]}>
            <ProductForm isNew={true} />
          </ProtectedRoute>
        )} />
        <Route path="/products/:id/edit">
          {(params) => (
            <ProtectedRoute roles={["admin", "manager"]}>
              <ProductForm isEditMode={true} productId={Number(params.id)} />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/customers" component={() => (
          <ProtectedRoute>
            <CustomersPage />
          </ProtectedRoute>
        )} />
        <Route path="/customers/new" component={() => (
          <ProtectedRoute roles={["admin", "manager"]}>
            <CustomerForm isNew={true} />
          </ProtectedRoute>
        )} />
        <Route path="/customers/:id/edit">
          {(params) => (
            <ProtectedRoute roles={["admin", "manager"]}>
              <CustomerForm isEditMode={true} customerId={Number(params.id)} />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/orders" component={() => (
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        )} />
        <Route path="/orders/new" component={() => (
          <ProtectedRoute>
            <OrderForm isNew={true} />
          </ProtectedRoute>
        )} />
        <Route path="/orders/:id">
          {(params) => (
            <ProtectedRoute>
              <OrderForm orderId={Number(params.id)} />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/reports" component={() => (
          <ProtectedRoute roles={["admin", "manager"]}>
            <ReportsPage />
          </ProtectedRoute>
        )} />
        <Route path="/settings" component={() => (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        )} />
        <Route path="/users" component={() => (
          <ProtectedRoute roles={["admin", "manager"]}>
            <UsersPage />
          </ProtectedRoute>
        )} />
        <Route path="/users/new" component={() => (
          <ProtectedRoute roles={["admin"]}>
            <NewUserPage />
          </ProtectedRoute>
        )} />
        <Route path="/users/:id">
          {(params) => (
            <ProtectedRoute roles={["admin", "manager"]}>
              <EditUserPage />
            </ProtectedRoute>
          )}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <LoginPage />}
      </Route>
      <Route path="/">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
      </Route>
      <Route path="/*">
        {!isAuthenticated ? <Redirect to="/login" /> : <DashboardRouter />}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
