import { DB } from "../db/db.connection";
import { OrderLineItem } from "../db/schema/order";
import {
  InProcessOrder,
  OrderLineItemType,
  OrderWithLineItems,
} from "../dto/orderRequest.dto";
import { CartRepositoryType } from "../repository/cart.repository";
import { OrderRepository, OrderRepositoryType } from "../repository/order.repository";
import { MessageType, OrderStatus } from "../types";
import { NotFoundError } from "../utils";
import {
  SendCancelOrderMessage,
  SendCreateOrderMessage,
} from "./broker.service";

export const CreateOrder = async (
  userId: number,
  repo: OrderRepositoryType,
  cartRepo: CartRepositoryType
) => {
  // find cart by customer Id
  const cart = await cartRepo.findCart(userId);
  if (!cart) throw new Error("Cart Not Found");

  // calculate total order amount
  let cartTotal = 0;
  let orderLineItems: OrderLineItemType[] = [];
  cart.lineItems.forEach((item) => {
    cartTotal = item.qty * Number(item.price);
    orderLineItems.push({
      productId: item.productId.toString(),
      itemName: item.itemName,
      qty: item.qty,
      price: +item.price,
    } as OrderLineItemType);
  });

  // create orderLine items from cart items
  const orderNumber = Math.floor(Math.random() * 100000);
  const orderInput: OrderWithLineItems = {
    orderNumber,
    txnId: null,
    customerId: userId,
    status: OrderStatus.PENDING, //payment status will be updated by payment service
    amount: cartTotal.toString(),
    orderItems: orderLineItems,
  } as OrderWithLineItems;

  // create order with line items
  const order = await repo.createOrder(orderInput);
  await cartRepo.clearCart(userId);

  // fire a message to subscribtion service [catalog service] to update stock
  await SendCreateOrderMessage(orderInput);

  // return success message
  return { message: "Order Created Successfully", orderNumber };
};

export const UpdateOrder = async (
  orderId: number,
  status: OrderStatus,
  repo: OrderRepositoryType
) => {
  const order: any = await repo.updateOrder(orderId, status);
  // fire a message to subscription service [catlog service] to update stock
  // TODO: handle kafka calls
  if (status === OrderStatus.CANCELLED) {
    console.log("------- cancelling order----------", order);
    SendCancelOrderMessage(order);
  }

  return { message: "Order updated successfully" };
};

export const GetOrder = async (orderId: number, repo: OrderRepositoryType) => {
  const order = repo.findOrder(orderId);
  if (!order) throw new NotFoundError("Order Not found");
  return order;
};

export const GetOrders = async (userId: number, repo: OrderRepositoryType) => {
  const orders = await repo.findOrdersByCustomerId(userId);
  if (!Array.isArray(orders)) throw new NotFoundError("Order Not found");
  return orders;
};

export const DeleteOrder = async (
  orderId: number,
  repo: OrderRepositoryType
) => {
  await repo.deleteOrder(orderId);
  return true;
};

export const HandleSubscription = async (message: MessageType) => {
  if(message && message.event === 'update_payment'){
    const {orderNumber,status} = message.data;
    const orderRepo = OrderRepository;
    const order = await orderRepo.findOrderByOrderNumber(orderNumber);
    UpdateOrder(order?.id!,status,orderRepo);
  }
  console.log("Message recieved by order kafka consumer", message);
};

export const CheckOutOrder = async (
  orderNumber: number,
  repo: OrderRepositoryType
) => {
  const order = await repo.findOrderByOrderNumber(orderNumber);
  if (!order) {
    throw new Error("Order not found");
  }
const orderItem = {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    customerId: order.customerId,
    amount: +order.amount,
    createdAt: order.createdAt,
    updatedAt: order.updateAt,
  } as InProcessOrder;
  console.log("-----order item checkout time-------", orderItem);
  return orderItem;
};
