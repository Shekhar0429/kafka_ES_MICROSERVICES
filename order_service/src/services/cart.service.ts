import { CartEditRequestInput, CartRequestType } from "../dto/cartRequest.dto";
// import { CartRepositoryType } from "../types/repository.type";
import { CartRepositoryType } from "../repository/cart.repository";
import { AuthorizeError, logger, NotFoundError } from "../utils";
import { GetProductDetails, GetStockDetails } from "../utils/broker";
import { Cart, CartLineItem } from "../db/schema";
import { line } from "drizzle-orm/pg-core";
export const CreateCart = async (
  input: CartRequestType & { customerId: number },
  repo: CartRepositoryType
) => {
  // make a call to catalog microservice to check if the product exists
  // synchronous call
  const product = await GetProductDetails(input.productId);
  if (product.stock < input.qty) {
    throw new NotFoundError("Insufficient stock");
  }

  //find if the product already exists in cart for the user
  const lineItem = await repo.findCartByProductId(
    input.customerId,
    input.productId
  );

  if (lineItem) {
    return await repo.updateCart(lineItem.id, lineItem.qty + input.qty);
  }
  return await repo.createCart(input.customerId, {
    productId: product.id,
    price: product.price.toString(),
    qty: input.qty,
    itemName: product.name,
    variant: product.variant,
  } as CartLineItem);
};

export const GetCart = async (id: number, repo: CartRepositoryType) => {
  // get customer cart by customer id
  const cart = await repo.findCart(id);
  if (!cart) throw new NotFoundError("Cart not found");

  // list out all line items in the cart
  const lineItems = cart.lineItems;

  if (!lineItems.length) throw new NotFoundError("No items in cart");

  // verify with catalog service if the products are still available
  const productIds = lineItems.map((item) => item.productId);
  const stockDetails = await GetStockDetails(productIds);
  logger.info(stockDetails);

  if (Array.isArray(stockDetails) && stockDetails.length) {
    // update the cart line items with latest stock availability
    cart.lineItems = lineItems.map((item) => {
      const stockItem = stockDetails.find(
        (stock) => stock.id === item.productId
      );
      if (stockItem) {
        return {
          ...item,
          availableStock: stockItem.stock,
        };
      }
      return item;
    });
  }

  // return updated cart data with latest stock availability
  return cart;
};

const AuthorisedCart = async (
  lineItemId: number,
  customerId: number,
  repo: CartRepositoryType
) => {
  const cart = await repo.findCart(customerId);
  if (!cart) {
    throw new NotFoundError("Cart not found");
  }
  const lineItem = cart.lineItems.find((item) => item.id === lineItemId);
  if (!lineItem) {
    throw new AuthorizeError("Line item not found in your cart");
  }
  return lineItem;
};

export const EditCart = async (
  input: CartEditRequestInput,
  repo: CartRepositoryType
) => {
  // validate if the cart line item belongs to the customer
  await AuthorisedCart(input.id, input.customerId, repo);

  // Load the line item to get its productId
  const lineItem = await repo.getCartLineItem(input.id);

  // Check current stock from catalog for the associated product
  const product = await GetProductDetails(lineItem.productId);
  logger.info(product);
  if (product.stock < input.qty) {
    throw new NotFoundError("Insufficient stock");
  }

  // Proceed to update the cart line item quantity
  const data = await repo.updateCart(input.id, input.qty);
  return data;
};

export const DeleteCart = async (
  input: {
    id: number;
    customerId: number;
  },
  repo: CartRepositoryType
) => {
  // validate if the cart line item belongs to the customer
  await AuthorisedCart(input.id, input.customerId, repo);

  // Proceed to delete the cart line item
  const data = await repo.deleteCart(input.id);
  return data;
};
