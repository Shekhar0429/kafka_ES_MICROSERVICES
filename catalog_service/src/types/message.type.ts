import { OrderStatus } from "../types";

export type OrderLineItemType = {
  id?: number;
  productId: string;
  qty: number;
};

export interface OrderWithLineItems {
  id?: number;
  orderNumber: number;
  orderItems: OrderLineItemType[];
}
