import { eq } from "drizzle-orm";
import { DB } from "../db/db.connection";
import { orderLineItems, orders } from "../db/schema";
import { OrderWithLineItems } from "../dto/orderRequest.dto";
import { OrderStatus } from "../types";
import { NotFoundError } from "../utils";

export type OrderRepositoryType = {
  createOrder(lineItems: OrderWithLineItems): Promise<number>;
  findOrder(id: number): Promise<OrderWithLineItems | null>;
  updateOrder(id: number, status: string): Promise<OrderWithLineItems>;
  deleteOrder(id: number): Promise<boolean>;
  findOrdersByCustomerId(customerId: number): Promise<OrderWithLineItems[]>;
  findOrderByOrderNumber(
    orderNumber: number
  ): Promise<OrderWithLineItems | null>;
};

const createOrder = async (lineItems: OrderWithLineItems): Promise<number> => {
  console.log("lineitems on repo :: ", lineItems);
  const result = await DB.insert(orders)
    .values({
      orderNumber: lineItems.orderNumber,
      customerId: lineItems.customerId,
      status: lineItems.status,
      txnId: lineItems.txnId || null,
      amount: lineItems.amount + 1,
    })
    .returning();

  const [{ id }] = result;
  console.log("id from results :: ", result);
  if (id > 0) {
    for (const item of lineItems.orderItems) {
      await DB.insert(orderLineItems)
        .values({
          itemName: item.itemName,
          qty: item.qty,
          price: item.price.toString(),
          orderId: id,
          productId: +item.productId,
        })
        .execute();
    }
  }
  return id;
};

export const findOrder = async (
  id: number
): Promise<OrderWithLineItems | null> => {
  const order = await DB.query.orders.findFirst({
    where: (orders, { eq }) => eq(orders.id, id),
    with: { lineItems: true },
  });
  if (!order) {
    throw new NotFoundError("Order not found");
  }
  return order as unknown as OrderWithLineItems;
};

const updateOrder = async (
  id: number,
  status: OrderStatus
): Promise<OrderWithLineItems> => {
  await DB.update(orders).set({ status }).where(eq(orders.id, id)).execute();

  const order = await findOrder(id);
  if (!order) {
    throw new NotFoundError("Order item not found");
  }
  return order;
};


const deleteOrder = async (id: number): Promise<boolean> => {
  await DB.delete(orderLineItems).where(eq(orderLineItems.id, id)).execute();
  return true;
};

const findOrdersByCustomerId = async (
  customerId: number
): Promise<OrderWithLineItems[]> => {
  const orders = await DB.query.orders.findMany({
    where: (orders, { eq }) => eq(orders.customerId, customerId),
    with: {
      lineItems: true,
    },
  });
  return orders as unknown as OrderWithLineItems[];
};

const findOrderByOrderNumber = async (
  orderNumber: number
): Promise<OrderWithLineItems | null> => {
  const order = await DB.query.orders.findFirst({
    where: (orders, { eq }) => eq(orders.orderNumber, orderNumber),
    with: { lineItems: true },
  });
  if (!order) throw new NotFoundError("Order Not Found");
  return order as unknown as OrderWithLineItems;
};

export const OrderRepository: OrderRepositoryType = {
  createOrder,
  findOrder,
  updateOrder,
  deleteOrder,
  findOrdersByCustomerId,
  findOrderByOrderNumber,
};
