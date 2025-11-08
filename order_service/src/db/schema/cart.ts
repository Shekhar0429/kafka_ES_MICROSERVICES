import {
  integer,
  pgTable,
  timestamp,
  serial,
  numeric,
} from "drizzle-orm/pg-core";
import { InferSelectModel, relations } from "drizzle-orm";
import { varchar } from "drizzle-orm/pg-core";

export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updateAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Cart = InferSelectModel<typeof carts>;
export type NewCart = InferSelectModel<typeof carts>;

export const cartLineItems = pgTable("cart_line_items", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  cartId: integer("cart_id") // onDelete cascade : when a cart is deleted, all its line items are also deleted
    .references(() => carts.id, { onDelete: "cascade" }) // reference to carts table
    .notNull(),
  itemName: varchar("item_name", { length: 255 }).notNull(),
  variant: varchar("variant", { length: 255 }), // e.g., size, color
  qty: integer("qty").notNull(),
  price: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updateAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CartLineItem = InferSelectModel<typeof cartLineItems>;

// Define relations between carts and cartLineItems tables
export const cartRelations = relations(carts, ({ many }) => ({
  // a cart has many line items
  lineItems: many(cartLineItems),
}));

export const cartLineItemRelations = relations(cartLineItems, ({ one }) => ({
  // a line item belongs to one cart
  cart: one(carts, {
    fields: [cartLineItems.cartId], // cartId in cartLineItems
    references: [carts.id], // references, id in carts
  }),
}));
