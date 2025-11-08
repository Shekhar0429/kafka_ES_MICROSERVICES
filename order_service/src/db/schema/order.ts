import { InferSelectModel, relations } from "drizzle-orm";
import {
  integer,
  numeric,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// These tables will be created on running the migrations defined in package.json
//db:generate -> db:migrate
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: integer("order_number").notNull().unique(),
  customerId: integer("customer_id").notNull(),
  amount: numeric("amount").notNull(),
  status: varchar("status").default("pending"), // e.g., pending, completed, shipped
  txnId: varchar("txn_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updateAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Order = InferSelectModel<typeof orders>;

export const orderLineItems = pgTable("order_line_items", {
  id: serial("id").primaryKey(),
  itemName: varchar("item_name").notNull(),
  qty: integer("qty").notNull(),
  price: numeric("price").notNull(),
  orderId: integer("order_id") // onDelete cascade : when an order is deleted, all its line items are also deleted
    .references(() => orders.id, { onDelete: "cascade" }) // reference to orders table
    .notNull(),
  productId:integer("product_id"),  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updateAt: timestamp("updated_at").notNull().defaultNow(),
});

export type OrderLineItem = InferSelectModel<typeof orderLineItems>;

export const orderRelations = relations(orders, ({ many }) => ({
  // an order has many line items
  lineItems: many(orderLineItems),
}));

export const orderItemRelations = relations(orderLineItems, ({ one }) => ({
  // a line item belongs to one order
  order: one(orders, {
    fields: [orderLineItems.orderId], // orderId in orderLineItems
    references: [orders.id], // references, id in orders
  }),
}));
