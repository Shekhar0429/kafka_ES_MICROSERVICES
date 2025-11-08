export enum PaymentEvent {
  CREATE_PAYMENT = "create_payment",
  UPDATE_PAYMENT = "update_payment",
}

export type TOPIC_TYPE = "OrderEvents";

// kind of record
export interface MessageType {
  headers?: Record<string, any>;
  event: PaymentEvent;
  data: Record<string, any>;
}
