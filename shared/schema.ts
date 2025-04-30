import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role", { enum: ['admin', 'manager', 'employee'] }).default("employee").notNull(),
  createdBy: integer("created_by"),
  lastLogin: timestamp("last_login"),
  darkMode: boolean("dark_mode").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  role: true,
  createdBy: true,
  lastLogin: true,
  darkMode: true,
});

// Product schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sku: text("sku").notNull().unique(),
  price: integer("price").notNull(), // Stored in cents
  stock: integer("stock").notNull().default(0),
  category: text("category"),
  imageUrl: text("image_url"),
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  sku: true,
  price: true,
  stock: true,
  category: true,
  imageUrl: true,
});

// Customer schema
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  notes: text("notes"),
  accountBalance: integer("account_balance").default(0).notNull(), // Stored in cents
  transactionHistory: jsonb("transaction_history").$type<Array<{
    date: string;
    amount: number;
    description: string;
    type: 'order' | 'payment' | 'loan' | 'other';
  }>>().default([]).notNull(),
  loanHistory: jsonb("loan_history").$type<Array<{
    date: string;
    amount: number;
    dueDate: string;
    status: 'pending' | 'paid' | 'overdue';
    description: string;
  }>>().default([]).notNull(),
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  name: true,
  email: true,
  phone: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  notes: true,
  accountBalance: true,
  transactionHistory: true,
  loanHistory: true,
});

// Order schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerId: integer("customer_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  status: text("status", { enum: ['pending', 'processing', 'shipped', 'completed', 'cancelled'] }).notNull().default("pending"),
  total: integer("total").notNull(), // Stored in cents
  notes: text("notes"),
  createdBy: integer("created_by").notNull().default(1), // User ID who created the order
});

export const insertOrderSchema = createInsertSchema(orders)
  .pick({
    orderNumber: true,
    customerId: true,
    date: true,
    status: true,
    total: true,
    notes: true,
    createdBy: true,
  })
  .transform((data) => {
    // Ensure date is properly handled
    if (data.date instanceof Date) {
      return data;
    }
    return {
      ...data,
      date: data.date ? new Date(data.date) : new Date()
    };
  });

// Order items schema
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(), // Price at time of order, in cents
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  quantity: true,
  price: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
