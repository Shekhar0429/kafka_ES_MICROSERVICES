import { Consumer, Producer } from "kafkajs";
import { CatalogService } from "./catalog.service";
import { MessageBroker } from "../utils/broker";

export class BrokerService {
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;
  private catalogService!: CatalogService;

  constructor(catalagService: CatalogService) {
    this.catalogService = catalagService;
  }

  public async initializeBroker() {
    this.producer = await MessageBroker.connectProducer<Producer>();
    this.producer.on("producer.connect", () => {
      console.log("CATALOG SERVICE :: Kafka Producer connected");
    });

    this.consumer = await MessageBroker.connectConsumer<Consumer>();
    this.consumer.on("consumer.connect", () => {
      console.log("CATALOG SERVICE :: Kafka Consumer connected");
    });

    // keep listining to consumer events :: consumer task
    // perform actions based on events :: consumer task
    // order service listens to payments
    await MessageBroker.subscribe(
      this.catalogService.handleBrokerMessage.bind(this.catalogService),
      "CatalogEvents"
    );
  }

  // publish discontinue product event : HW
  // handle event in catalog service for order cancel
  public async sendDeleteProductMessage(data: any) {}
}
