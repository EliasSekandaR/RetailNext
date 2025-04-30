import { 
  customers, 
  products, 
  orders, 
  orderItems, 
  users,
  type Customer,
  type InsertCustomer,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type User,
  type InsertUser
} from "@shared/schema";
import { format } from "date-fns";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  updateUserDarkMode(id: number, darkMode: boolean): Promise<User | undefined>;
  
  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getLowStockProducts(threshold: number): Promise<Product[]>;

  // Customer operations
  getAllCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  getRecentCustomers(limit: number): Promise<Customer[]>;
  updateCustomerBalance(id: number, amount: number): Promise<Customer | undefined>;
  addCustomerTransaction(id: number, transaction: {
    date: string;
    amount: number;
    description: string;
    type: 'order' | 'payment' | 'loan' | 'other';
  }): Promise<Customer | undefined>;
  addCustomerLoan(id: number, loan: {
    date: string;
    amount: number;
    dueDate: string;
    status: 'pending' | 'paid' | 'overdue';
    description: string;
  }): Promise<Customer | undefined>;

  // Order operations
  getAllOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByOrderNumber(orderNumber: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  getOrdersByCustomerId(customerId: number): Promise<Order[]>;
  getRecentOrders(limit: number): Promise<Order[]>;
  
  // Order items operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Statistics
  getDashboardStats(): Promise<DashboardStats>;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  newCustomers: number;
  lowStockItems: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  lowStockChange: number;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private customers: Map<number, Customer>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  
  private userId: number;
  private productId: number;
  private customerId: number;
  private orderId: number;
  private orderItemId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.customers = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    this.userId = 1;
    this.productId = 1;
    this.customerId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  // Helper method to generate unique IDs and order numbers
  private generateOrderNumber(): string {
    return `ORD-${7447 + this.orderId}`;
  }

  private initializeData() {
    // Create sample users with different roles
    const sampleUsers: InsertUser[] = [
      {
        username: "admin",
        password: "admin123", // In a real app, you'd use password hashing
        email: "admin@retailsystem.com",
        fullName: "Admin User",
        role: "admin",
        darkMode: false,
        createdBy: null,
        lastLogin: null,
      },
      {
        username: "manager",
        password: "manager123",
        email: "manager@retailsystem.com",
        fullName: "Manager User",
        role: "manager",
        darkMode: false,
        createdBy: 1, // Created by admin
        lastLogin: null,
      },
      {
        username: "employee",
        password: "employee123",
        email: "employee@retailsystem.com",
        fullName: "Employee User",
        role: "employee",
        darkMode: false,
        createdBy: 1, // Created by admin
        lastLogin: null,
      }
    ];

    for (const user of sampleUsers) {
      this.createUser(user);
    }
    
    // Create sample products
    const sampleProducts: InsertProduct[] = [
      {
        name: "Wireless Earbuds Pro",
        description: "High-quality wireless earbuds with noise cancellation",
        sku: "WEP-1234",
        price: 12900, // $129.00
        stock: 2,
        category: "Electronics",
        imageUrl: "",
      },
      {
        name: "Smart Watch Series 5",
        description: "Stylish smart watch with health tracking features",
        sku: "SWS-5678",
        price: 24999, // $249.99
        stock: 5,
        category: "Electronics",
        imageUrl: "",
      },
      {
        name: "Bluetooth Speaker Mini",
        description: "Portable bluetooth speaker with excellent sound quality",
        sku: "BSM-9012",
        price: 4999, // $49.99
        stock: 3,
        category: "Electronics",
        imageUrl: "",
      },
      {
        name: "Portable Power Bank",
        description: "High capacity power bank for charging devices on the go",
        sku: "PPB-3456",
        price: 3499, // $34.99
        stock: 8,
        category: "Electronics",
        imageUrl: "",
      },
      {
        name: "Ultra HD Monitor",
        description: "27-inch 4K monitor with HDR support",
        sku: "UHM-7890",
        price: 34999, // $349.99
        stock: 12,
        category: "Electronics",
        imageUrl: "",
      },
    ];

    for (const product of sampleProducts) {
      this.createProduct(product);
    }

    // Create sample customers
    const sampleCustomers: InsertCustomer[] = [
      {
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
        phone: "555-123-4567",
        address: "123 Main St",
        city: "Anytown",
        state: "CA",
        zipCode: "94123",
        notes: "",
      },
      {
        name: "Michael Chen",
        email: "mchen@example.com",
        phone: "555-987-6543",
        address: "456 Oak Ave",
        city: "Springfield",
        state: "IL",
        zipCode: "62704",
        notes: "",
      },
      {
        name: "James Wilson",
        email: "jwilson@example.com",
        phone: "555-456-7890",
        address: "789 Pine Rd",
        city: "Lakeside",
        state: "NY",
        zipCode: "10001",
        notes: "",
      },
      {
        name: "Emma Garcia",
        email: "egarcia@example.com",
        phone: "555-234-5678",
        address: "246 Elm St",
        city: "Riverdale",
        state: "TX",
        zipCode: "75001",
        notes: "",
      },
      {
        name: "David Lee",
        email: "dlee@example.com",
        phone: "555-876-5432",
        address: "135 Cedar Ln",
        city: "Westville",
        state: "CA",
        zipCode: "90210",
        notes: "",
      },
    ];

    for (const customer of sampleCustomers) {
      this.createCustomer(customer);
    }

    // Create sample orders
    const orderDates = [
      new Date(2023, 7, 12), // Aug 12, 2023
      new Date(2023, 7, 11), // Aug 11, 2023
      new Date(2023, 7, 11), // Aug 11, 2023
      new Date(2023, 7, 10), // Aug 10, 2023
      new Date(2023, 7, 10), // Aug 10, 2023
    ];
    
    const orderStatuses = ["completed", "pending", "pending", "completed", "completed"] as ("pending" | "completed")[];
    const orderTotals = [23450, 8999, 14520, 6780, 43225]; // in cents
    
    for (let i = 0; i < 5; i++) {
      const order: InsertOrder = {
        orderNumber: this.generateOrderNumber(),
        customerId: i + 1,
        date: orderDates[i],
        status: orderStatuses[i],
        total: orderTotals[i],
        notes: "",
      };
      
      const createdOrder = this.createOrder(order);
      
      // Add order items
      if (i === 0) {
        this.addOrderItem({
          orderId: createdOrder.id,
          productId: 1,
          quantity: 1,
          price: 12900,
        });
        this.addOrderItem({
          orderId: createdOrder.id,
          productId: 4,
          quantity: 3,
          price: 3499,
        });
      } else if (i === 1) {
        this.addOrderItem({
          orderId: createdOrder.id,
          productId: 3,
          quantity: 1,
          price: 4999,
        });
        this.addOrderItem({
          orderId: createdOrder.id,
          productId: 4,
          quantity: 1,
          price: 3499,
        });
      } else if (i === 2) {
        this.addOrderItem({
          orderId: createdOrder.id,
          productId: 2,
          quantity: 1,
          price: 14520,
        });
      } else if (i === 3) {
        this.addOrderItem({
          orderId: createdOrder.id,
          productId: 3,
          quantity: 1,
          price: 4999,
        });
        this.addOrderItem({
          orderId: createdOrder.id,
          productId: 4,
          quantity: 1,
          price: 1781,
        });
      } else if (i === 4) {
        this.addOrderItem({
          orderId: createdOrder.id,
          productId: 1,
          quantity: 1,
          price: 12900,
        });
        this.addOrderItem({
          orderId: createdOrder.id,
          productId: 2,
          quantity: 1,
          price: 24999,
        });
        this.addOrderItem({
          orderId: createdOrder.id,
          productId: 4,
          quantity: 2,
          price: 3499,
        });
      }
    }
    
    // Users are already created at the beginning of initializeData
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role === role
    );
  }
  
  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      return undefined;
    }
    
    const updatedUser = { ...existingUser, ...userUpdate };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
  
  async updateUserDarkMode(id: number, darkMode: boolean): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      return undefined;
    }
    
    const updatedUser = { ...existingUser, darkMode };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.sku === sku,
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, productUpdate: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) {
      return undefined;
    }
    
    const updatedProduct = { ...existingProduct, ...productUpdate };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  async getLowStockProducts(threshold: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.stock <= threshold,
    );
  }

  // Customer methods
  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(
      (customer) => customer.email === email,
    );
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.customerId++;
    const customer: Customer = { ...insertCustomer, id };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, customerUpdate: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const existingCustomer = this.customers.get(id);
    if (!existingCustomer) {
      return undefined;
    }
    
    const updatedCustomer = { ...existingCustomer, ...customerUpdate };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
  }

  async getRecentCustomers(limit: number): Promise<Customer[]> {
    // In a real DB, we would order by creation date
    return Array.from(this.customers.values())
      .sort((a, b) => b.id - a.id) // Most recent first
      .slice(0, limit);
  }
  
  async updateCustomerBalance(id: number, amount: number): Promise<Customer | undefined> {
    const existingCustomer = this.customers.get(id);
    if (!existingCustomer) {
      return undefined;
    }
    
    const newBalance = (existingCustomer.accountBalance || 0) + amount;
    const updatedCustomer = { 
      ...existingCustomer, 
      accountBalance: newBalance 
    };
    
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }
  
  async addCustomerTransaction(id: number, transaction: {
    date: string;
    amount: number;
    description: string;
    type: 'order' | 'payment' | 'loan' | 'other';
  }): Promise<Customer | undefined> {
    const existingCustomer = this.customers.get(id);
    if (!existingCustomer) {
      return undefined;
    }
    
    const transactionHistory = existingCustomer.transactionHistory || [];
    const updatedCustomer = { 
      ...existingCustomer, 
      transactionHistory: [...transactionHistory, transaction] 
    };
    
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }
  
  async addCustomerLoan(id: number, loan: {
    date: string;
    amount: number;
    dueDate: string;
    status: 'pending' | 'paid' | 'overdue';
    description: string;
  }): Promise<Customer | undefined> {
    const existingCustomer = this.customers.get(id);
    if (!existingCustomer) {
      return undefined;
    }
    
    const loanHistory = existingCustomer.loanHistory || [];
    const updatedCustomer = { 
      ...existingCustomer, 
      loanHistory: [...loanHistory, loan] 
    };
    
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  // Order methods
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderByOrderNumber(orderNumber: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(
      (order) => order.orderNumber === orderNumber,
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const order: Order = { 
      ...insertOrder, 
      id,
      orderNumber: insertOrder.orderNumber || this.generateOrderNumber(),
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) {
      return undefined;
    }
    
    const validStatuses = ["pending", "processing", "shipped", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid order status. Must be one of: ${validStatuses.join(", ")}`);
    }
    
    const updatedOrder = { ...existingOrder, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async getOrdersByCustomerId(customerId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.customerId === customerId,
    );
  }

  async getRecentOrders(limit: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  // Order items methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId,
    );
  }

  async addOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  // Statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const allOrders = Array.from(this.orders.values());
    
    // Calculate total revenue (in cents)
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Count total orders
    const totalOrders = allOrders.length;
    
    // Count customers (this is just a proxy for new customers since we don't track creation dates)
    const newCustomers = this.customers.size;
    
    // Count low stock items (threshold of 5)
    const lowStockItems = Array.from(this.products.values()).filter(
      (product) => product.stock <= 5
    ).length;
    
    // Calculate changes (mocked since we don't have historical data)
    return {
      totalRevenue,
      totalOrders,
      newCustomers,
      lowStockItems,
      revenueChange: 12.5, // Percentages
      ordersChange: 8.2,
      customersChange: 4.6,
      lowStockChange: -3, // Negative means increase in low stock items (bad)
    };
  }
}

export const storage = new MemStorage();
