import { Static, Type } from "@sinclair/typebox";

export const CartRequestSchema = Type.Object({
  productId: Type.Integer(),
  qty: Type.Integer(),
});

export const CartEditSchema = Type.Object({
  id: Type.Integer(),
  qty: Type.Integer(),
  customerId: Type.Integer(),
});

export type CartEditRequestInput = Static<typeof CartEditSchema>; // Use 'typeof' to get the type from the schema
export type CartRequestType = Static<typeof CartRequestSchema>; // Use 'typeof' to get the type from the schema

type CartLineItem = {
  id: number;
  productId: number;
  itemName: string;
  variant?: string | null;
  price: string;
  qty: number;
  createdAt: Date;
  updateAt: Date;
  availablity?: number;
};

export interface CartWithLineItems {
  id: number;
  customerId: number;
  createdAt: Date;
  updateAt: Date;
  lineItems: CartLineItem[];
}
