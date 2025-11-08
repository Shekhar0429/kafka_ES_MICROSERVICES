import { eq } from "drizzle-orm";
import { DB } from "../db/db.connection";
import { Cart, CartLineItem, cartLineItems, carts } from "../db/schema";
import { logger, NotFoundError } from "../utils";
import { CartWithLineItems } from "../dto/cartRequest.dto";
// import { CartRepositoryType } from "../types/repository.type";
// declare repository type here

export type CartRepositoryType = {
  findCartByProductId(customerId: number, productId: number): Promise<CartLineItem>;
  createCart: (customerId: number, lineItem: CartLineItem) => Promise<number>;
  findCart: (id: number) => Promise<CartWithLineItems>;
  getCartLineItem: (id: number) => Promise<CartLineItem>;
  updateCart: (id: number, qty: number) => Promise<CartLineItem>;
  deleteCart: (id: number) => Promise<boolean>;
  clearCart: (id: number) => Promise<boolean>;
};

// create cart and add line item to it
const createCart = async (
  customerId: number,
  lineItem: CartLineItem
): Promise<number> => {
  const result = await DB.insert(carts)
    .values({
      customerId: customerId, // insert customerId (unique
    })
    .returning() // return the inserted row(complete row)
    .onConflictDoUpdate({
      // if customerId already exists, update the updatedAt timestamp
      target: carts.customerId,
      set: { updateAt: new Date() },
    });
  const [{ id }] = result; // get the cart id from the result
  if (id > 0) {
    await DB.insert(cartLineItems).values({
      // insert the line item
      cartId: id,
      itemName: lineItem.itemName,
      price: lineItem.price,
      qty: lineItem.qty,
      productId: lineItem.productId,
      variant: lineItem.variant,
    });
  }
  return id;
};

const findCart = async (id: number): Promise<CartWithLineItems> => {
  const cart = await DB.query.carts.findFirst({
    where: (carts, { eq }) => eq(carts.customerId, id), // find cart by customerId
    with: { lineItems: true }, // all the relations(foreign keys) are fetched (line items in this case)
  });
  if (!cart) {
    throw new NotFoundError("Cart not found");
  }
  return cart;
};

const getCartLineItem = async (id: number): Promise<CartLineItem> => {
  const item = await DB.query.cartLineItems.findFirst({
    where: (cli, { eq }) => eq(cli.id, id),
  });
  if (!item) {
    throw new NotFoundError("Cart line item not found");
  }
  return item;
};

const findCartByProductId = async (customerId: number, productId: number):Promise<CartLineItem> => {
  const cart = await DB.query.carts.findFirst({
    where: (carts, { eq }) => eq(carts.customerId, customerId), // find cart by customerId
    with: { lineItems: true }, // all the relations(foreign keys) are fetched (line items in this case)
  });
  if (!cart) {
    return null as any;
    throw new NotFoundError("Cart not found");
  }
  const lineItem = cart.lineItems.find((item) => item.productId === productId);
  return lineItem as CartLineItem;
};

const updateCart = async (id: number, qty: number): Promise<CartLineItem> => {
  const [cartLineItem] = await DB.update(cartLineItems)
    .set({ qty })
    .where(eq(cartLineItems.id, id))
    .returning();
  if (!cartLineItem) {
    throw new NotFoundError("Cart line item not found");
  }
  return cartLineItem;
};

const deleteCart = async (id: number): Promise<boolean> => {
  await DB.delete(cartLineItems).where(eq(cartLineItems.id, id)).returning();
  return true;
};

const clearCart = async (id: number): Promise<boolean> => {
  await DB.delete(carts).where(eq(carts.customerId, id)).execute();
  return true;
};

export const CartRepository: CartRepositoryType = {
  createCart,
  findCart,
  getCartLineItem,
  updateCart,
  deleteCart,
  clearCart,
  findCartByProductId,
};

// const createCart = async (input: any): Promise<{}> => {
//   // Implement the logic to create a cart in the database
//   const result = await DB.insert(carts)
//     .values({
//       customerId: 123, // Replace with input.customerId or appropriate value
//     })
//     .returning({ cartId: carts.id });
//   return Promise.resolve({ message: "Cart created successfully", input });
// };

// const findCart = async (input: any): Promise<{}> => {
//   return Promise.resolve({ message: "Cart found successfully", input });
// };

// const updateCart = async (input: any): Promise<{}> => {
//   return Promise.resolve({});
// };

// const deleteCart = async (input: any): Promise<{}> => {
//   return Promise.resolve({});
// };

// export const CartRepository: CartRepositoryType = {
//   create: createCart,
//   find: findCart,
//   update: updateCart,
//   delete: deleteCart,
// };
