import { Producer } from "kafkajs";
import { MessageBroker } from "../utils/broker";
import { PaymentEvent } from "../types";

// initialize the broker
export const InitializeBroker = async () => {
  const producer = await MessageBroker.connectProducer<Producer>();
  producer.on("producer.connect", () => {
    console.log("inside payment")
    console.log("PAYMENT SERVICE :: Kafka Producer connected");
  });
};

// publish dedicated events based on usescases  :: producer task
export const SendPaymentUpdateMessage = async (data: any) => {
  await MessageBroker.publish({
    event: PaymentEvent.UPDATE_PAYMENT,
    topic: "OrderEvents",
    headers: {},
    message: { data },
  });
};
