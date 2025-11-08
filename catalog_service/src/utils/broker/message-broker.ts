import { Consumer, Kafka, logLevel, Partitioners, Producer } from "kafkajs";
import { MessageBrokerType, MessageHandler, PublishType } from "./broker.type";
import { MessageType, CatalogEvent, TOPIC_TYPE } from "../../types";

// configuration properties
const CLIENT_ID = process.env.CLIENT_ID || "catalog-service";
const GROUP_ID = process.env.GROUP_ID || "catalog-service-group";
const BROKERS = [process.env.BROKER_1 || "localhost:9092"];

const kafka = new Kafka({
  clientId: CLIENT_ID,
  brokers: BROKERS,
  logLevel: logLevel.INFO,
});

let producer: Producer;
let consumer: Consumer;

// topic will be created by producer
const createTopic = async (topic: string[]) => {
  const topics = topic.map((t) => ({
    topic: t,
    numPartitions: 2, // how many partitions the record will be distributed across
    replicationFactor: 1, // based on avaiable brokers
  }));

  const admin = kafka.admin();
  await admin.connect();
  const topicExists = await admin.listTopics();
  console.log("Existing Topics:", topicExists);
  for (const t of topics) {
    if (!topicExists.includes(t.topic)) {
      await admin.createTopics({
        topics: [t],
      });
    }
  }
  await admin.disconnect();
};

const connectProducer = async <T>(): Promise<T> => {
  await createTopic(["CatalogEvents"]);
  if (producer) {
    console.log("Reusing existing producer instance");
    return producer as unknown as T;
  }
  producer = kafka.producer({
    createPartitioner: Partitioners.DefaultPartitioner,
  });
  await producer.connect();
  console.log("producer connected with a new connection");
  return producer as unknown as T;
};

const disconnectProducer = async (): Promise<void> => {
  if (producer) await producer.disconnect();
};

const publish = async (data: PublishType): Promise<boolean> => {
  const producer = await connectProducer<Producer>();
  const result = await producer.send({
    topic: data.topic,
    messages: [
      {
        headers: data.headers,
        key: data.event,
        value: JSON.stringify(data.message),
      },
    ],
  });
  console.log("Message published to topic:", result);
  return result.length > 0;
};

const connectConsumer = async <T>(): Promise<T> => {
  if (consumer) return consumer as unknown as T;
  consumer = kafka.consumer({
    groupId: GROUP_ID,
  });
  await consumer.connect();
  return consumer as unknown as T;
};

const disconnectConsumer = async (): Promise<void> => {
  if (consumer) await consumer.disconnect();
};

const subscribe = async (
  messageHandler: MessageHandler,
  topic: TOPIC_TYPE
): Promise<void> => {
  const consumer = await connectConsumer<Consumer>();
  await consumer.subscribe({ topic, fromBeginning: true });
  await consumer.run({
    // eachMessage will be called when a message is received
    eachMessage: async ({ topic, partition, message }) => {
      if (!["CatalogEvents"].includes(topic)) return;
      if (message.key && message.value) {
        const inputMessage = {
          headers: message.headers,
          event: message.key.toString() as CatalogEvent,
          data: message.value ? JSON.parse(message.value.toString()) : null,
        };
        await messageHandler(inputMessage);
        // commit offset after message is processed
        // to avoid re-processing the same message in case of failure
        await consumer.commitOffsets([
          { topic, partition, offset: (Number(message.offset) + 1).toString() },
        ]);
      }
    },
  });
};

export const MessageBroker: MessageBrokerType = {
  connectProducer,
  disconnectProducer,
  publish,
  connectConsumer,
  disconnectConsumer,
  subscribe,
};
