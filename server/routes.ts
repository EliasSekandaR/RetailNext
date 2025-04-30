import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertProductSchema, 
  insertCustomerSchema, 
  insertOrderSchema, 
  insertOrderItemSchema,
  insertUserSchema,
  User
} from "@shared/schema";

// Declare session extension for Express
declare module 'express-session' {
  interface SessionData {
    user?: User;
    userId?: number;
    isAuthenticated?: boolean;
  }
}

// Role-based authentication middleware
const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.isAuthenticated || !req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Role-specific middleware
const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.user || !roles.includes(req.session.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes - all routes prefixed with /api
  
  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
  });
  
  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });
  
  app.get("/api/products/low-stock", async (req, res) => {
    try {
      const threshold = parseInt(req.query.threshold as string) || 5;
      const products = await storage.getLowStockProducts(threshold);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch low stock products" });
    }
  });
  
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });
  
  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      
      // Check if SKU already exists
      const existingProduct = await storage.getProductBySku(productData.sku);
      if (existingProduct) {
        return res.status(400).json({ error: "SKU already exists" });
      }
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  });
  
  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      
      // Check if product exists
      const existingProduct = await storage.getProduct(id);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      // Check if SKU is being changed and if it already exists
      if (productData.sku && productData.sku !== existingProduct.sku) {
        const productWithSku = await storage.getProductBySku(productData.sku);
        if (productWithSku) {
          return res.status(400).json({ error: "SKU already exists" });
        }
      }
      
      const updatedProduct = await storage.updateProduct(id, productData);
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update product" });
    }
  });
  
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if product exists
      const existingProduct = await storage.getProduct(id);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      await storage.deleteProduct(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });
  
  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });
  
  app.get("/api/customers/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const customers = await storage.getRecentCustomers(limit);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent customers" });
    }
  });
  
  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });
  
  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      
      // Check if email already exists
      const existingCustomer = await storage.getCustomerByEmail(customerData.email);
      if (existingCustomer) {
        return res.status(400).json({ error: "Email already exists" });
      }
      
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create customer" });
    }
  });
  
  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customerData = insertCustomerSchema.partial().parse(req.body);
      
      // Check if customer exists
      const existingCustomer = await storage.getCustomer(id);
      if (!existingCustomer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      // Check if email is being changed and if it already exists
      if (customerData.email && customerData.email !== existingCustomer.email) {
        const customerWithEmail = await storage.getCustomerByEmail(customerData.email);
        if (customerWithEmail) {
          return res.status(400).json({ error: "Email already exists" });
        }
      }
      
      const updatedCustomer = await storage.updateCustomer(id, customerData);
      res.json(updatedCustomer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update customer" });
    }
  });
  
  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if customer exists
      const existingCustomer = await storage.getCustomer(id);
      if (!existingCustomer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      await storage.deleteCustomer(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete customer" });
    }
  });
  
  // Order routes
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      
      // Enhance orders with customer data
      const enhancedOrders = await Promise.all(
        orders.map(async (order) => {
          const customer = await storage.getCustomer(order.customerId);
          return {
            ...order,
            customer: customer ? { id: customer.id, name: customer.name, email: customer.email } : null,
          };
        })
      );
      
      res.json(enhancedOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });
  
  app.get("/api/orders/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const orders = await storage.getRecentOrders(limit);
      
      // Enhance orders with customer data
      const enhancedOrders = await Promise.all(
        orders.map(async (order) => {
          const customer = await storage.getCustomer(order.customerId);
          return {
            ...order,
            customer: customer ? { id: customer.id, name: customer.name, email: customer.email } : null,
          };
        })
      );
      
      res.json(enhancedOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent orders" });
    }
  });
  
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Get order items
      const items = await storage.getOrderItems(order.id);
      
      // Get customer
      const customer = await storage.getCustomer(order.customerId);
      
      // Get product details for each item
      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product: product ? {
              id: product.id,
              name: product.name,
              sku: product.sku,
            } : null,
          };
        })
      );
      
      res.json({
        ...order,
        items: itemsWithProducts,
        customer: customer ? {
          id: customer.id,
          name: customer.name,
          email: customer.email,
        } : null,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });
  
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      
      // Check if customer exists
      const customer = await storage.getCustomer(orderData.customerId);
      if (!customer) {
        return res.status(400).json({ error: "Customer not found" });
      }
      
      // Create order
      const order = await storage.createOrder(orderData);
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });
  
  app.post("/api/orders/:id/items", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const itemData = insertOrderItemSchema.parse({
        ...req.body,
        orderId,
      });
      
      // Check if order exists
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Check if product exists
      const product = await storage.getProduct(itemData.productId);
      if (!product) {
        return res.status(400).json({ error: "Product not found" });
      }
      
      // Add order item
      const orderItem = await storage.addOrderItem(itemData);
      
      // Update product stock
      await storage.updateProduct(product.id, {
        stock: Math.max(0, product.stock - itemData.quantity),
      });
      
      res.status(201).json(orderItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to add order item" });
    }
  });
  
  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, notes } = req.body;
      
      // Check if order exists
      const existingOrder = await storage.getOrder(id);
      if (!existingOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // If updating status, validate it
      if (status) {
        const validStatuses = ["pending", "processing", "shipped", "completed", "cancelled"];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(", ")}` });
        }
        
        const updatedOrder = await storage.updateOrderStatus(id, status);
        res.json(updatedOrder);
      } else if (notes !== undefined) {
        // TODO: Implement notes update if needed
        res.json(existingOrder);
      } else {
        res.json(existingOrder);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update order" });
    }
  });
  
  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || typeof status !== "string") {
        return res.status(400).json({ error: "Status is required" });
      }
      
      // Check if status is valid
      const validStatuses = ["pending", "processing", "shipped", "completed", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(", ")}` });
      }
      
      // Check if order exists
      const existingOrder = await storage.getOrder(id);
      if (!existingOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(id, status);
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Authentication routes
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) { // In a real app, use proper password hashing
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      // Update last login time
      const now = new Date();
      await storage.updateUser(user.id, { 
        lastLogin: now 
      });
      
      // Set user in session
      req.session.user = user;
      req.session.userId = user.id;
      req.session.isAuthenticated = true;
      
      // Make sure we set the content type to application/json
      res.setHeader('Content-Type', 'application/json');
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        darkMode: user.darkMode
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });
  
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      // Make sure we set the content type to application/json
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/user", (req, res) => {
    if (req.session.isAuthenticated && req.session.user) {
      const user = req.session.user;
      // Make sure we set the content type to application/json
      res.setHeader('Content-Type', 'application/json');
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        darkMode: user.darkMode
      });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });
  
  // User routes
  app.get("/api/users", authenticateUser, requireRole(["admin"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Don't return password in the response
      const sanitizedUsers = users.map(({ password, ...user }) => user);
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  
  app.get("/api/users/:id", authenticateUser, requireRole(["admin", "manager"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Don't return password in the response
      const { password, ...sanitizedUser } = user;
      res.json(sanitizedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  
  app.post("/api/users", authenticateUser, requireRole(["admin"]), async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Add created by information from current user
      const createdUser = await storage.createUser({
        ...userData,
        createdBy: req.session.userId || null
      });
      
      // Don't return password in the response
      const { password, ...sanitizedUser } = createdUser;
      res.status(201).json(sanitizedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });
  
  app.put("/api/users/:id", authenticateUser, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Only admins can update other users, users can update their own profile
      if (req.session.user?.role !== "admin" && req.session.userId !== id) {
        return res.status(403).json({ error: "Access denied. You can only update your own profile." });
      }
      
      const userData = insertUserSchema.partial().parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Don't allow role change unless admin
      if (userData.role && req.session.user?.role !== "admin") {
        delete userData.role;
      }
      
      // Check if username is being changed and if it already exists
      if (userData.username && userData.username !== existingUser.username) {
        const userWithUsername = await storage.getUserByUsername(userData.username);
        if (userWithUsername) {
          return res.status(400).json({ error: "Username already exists" });
        }
      }
      
      const updatedUser = await storage.updateUser(id, userData);
      
      // Update session if user is updating their own profile
      if (req.session.userId === id && updatedUser) {
        req.session.user = updatedUser;
      }
      
      // Don't return password in the response
      const { password, ...sanitizedUser } = updatedUser || {};
      res.json(sanitizedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update user" });
    }
  });
  
  app.delete("/api/users/:id", authenticateUser, requireRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if user exists
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Don't allow deletion of own account
      if (req.session.userId === id) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }
      
      await storage.deleteUser(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });
  
  // Dark mode preference update
  app.patch("/api/users/:id/preferences/dark-mode", authenticateUser, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Users can only update their own preferences
      if (req.session.userId !== id) {
        return res.status(403).json({ error: "Access denied. You can only update your own preferences." });
      }
      
      const { darkMode } = req.body;
      
      if (typeof darkMode !== "boolean") {
        return res.status(400).json({ error: "darkMode must be a boolean" });
      }
      
      const updatedUser = await storage.updateUserDarkMode(id, darkMode);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Update session
      if (req.session.user) {
        req.session.user.darkMode = darkMode;
      }
      
      res.json({ darkMode });
    } catch (error) {
      res.status(500).json({ error: "Failed to update dark mode preference" });
    }
  });
  
  // Customer transaction/balance routes
  app.post("/api/customers/:id/transactions", authenticateUser, requireRole(["admin", "manager"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { date, amount, description, type } = req.body;
      
      if (!date || !amount || !description || !type) {
        return res.status(400).json({ error: "All fields (date, amount, description, type) are required" });
      }
      
      // Validate type
      if (!['order', 'payment', 'loan', 'other'].includes(type)) {
        return res.status(400).json({ error: "Type must be one of: order, payment, loan, other" });
      }
      
      // Check if customer exists
      const existingCustomer = await storage.getCustomer(id);
      if (!existingCustomer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      const transaction = { date, amount, description, type };
      const updatedCustomer = await storage.addCustomerTransaction(id, transaction);
      
      // Update balance
      await storage.updateCustomerBalance(id, amount);
      
      res.json(updatedCustomer);
    } catch (error) {
      res.status(500).json({ error: "Failed to add transaction" });
    }
  });
  
  app.post("/api/customers/:id/loans", authenticateUser, requireRole(["admin", "manager"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { date, amount, dueDate, status, description } = req.body;
      
      if (!date || !amount || !dueDate || !status || !description) {
        return res.status(400).json({ error: "All fields are required" });
      }
      
      // Validate status
      if (!['pending', 'paid', 'overdue'].includes(status)) {
        return res.status(400).json({ error: "Status must be one of: pending, paid, overdue" });
      }
      
      // Check if customer exists
      const existingCustomer = await storage.getCustomer(id);
      if (!existingCustomer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      const loan = { date, amount, dueDate, status, description };
      const updatedCustomer = await storage.addCustomerLoan(id, loan);
      
      // Add a transaction record for the loan
      await storage.addCustomerTransaction(id, {
        date,
        amount,
        description: `Loan: ${description}`,
        type: 'loan'
      });
      
      // Update balance
      await storage.updateCustomerBalance(id, amount);
      
      res.json(updatedCustomer);
    } catch (error) {
      res.status(500).json({ error: "Failed to add loan" });
    }
  });
  
  // Setup a base health-check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
