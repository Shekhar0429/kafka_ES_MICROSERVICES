import { Consumer, Producer } from "kafkajs";
import { MessageBroker } from "../utils/broker";
import { HandleSubscription } from "./order.service";
import { OrderEvent } from "../types";

// initialize the broker
export const InitializeBroker = async () => {
  const producer = await MessageBroker.connectProducer<Producer>();
  producer.on("producer.connect", () => {
    console.log("ORDER SERVICE :: Kafka Producer connected");
  });

  const consumer = await MessageBroker.connectConsumer<Consumer>();
  consumer.on("consumer.connect", () => {
    console.log("ORDER SERVICE :: Kafka Consumer connected");
  });

  // keep listining to consumer events :: consumer task
  // perform actions based on events :: consumer task
  // order service listens to payments
  await MessageBroker.subscribe(HandleSubscription, "OrderEvents");
};

// publish dedicated events based on usescases  :: producer task
export const SendCreateOrderMessage = async (data: any) => {
  await MessageBroker.publish({
    event: OrderEvent.CREATE_ORDER,
    topic: "CatalogEvents",
    headers: {},
    message: data,
  });
};

export const SendCancelOrderMessage = async (data: any) => {
  await MessageBroker.publish({
    event: OrderEvent.CANCEL_ORDER,
    topic: "CatalogEvents",
    headers: {},
    message: data,
  });
};
