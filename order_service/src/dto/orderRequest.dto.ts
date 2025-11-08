import { OrderStatus } from "../types";

export type OrderLineItemType = {
  id?: number;
  itemName: string;
  productId: string;
  qty: number;
  price: number;
  orderId?: number;
  createdAt?: Date;
  updateAt?: Date;
};

export interface OrderWithLineItems {
  id?: number;
  customerId: number;
  orderNumber: number;
  txnId: string | null;
  amount: string;
  status: OrderStatus,
  orderItems: OrderLineItemType[];
  createdAt: Date;
  updateAt: Date;
}

export interface InProcessOrder {
  id?: number;
  orderNumber: number;
  status: string;
  customerId: number;
  amount: number;
  createdAt?: Date;
  updatedAt?: Date;
}
