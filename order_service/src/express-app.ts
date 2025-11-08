import express, { Request, Response } from "express";
import cors from "cors";
import orderRoutes from "./routes/order.routes";
import cartRoutes from "./routes/cart.routes";
import { HandleErrorWithLogger, httpLogger } from "./utils";
import { MessageBroker } from "./utils/broker";
import { Consumer, Producer } from "kafkajs";
import { InitializeBroker } from "./services/broker.service";

export const ExpressApp = async () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use(httpLogger);

  await InitializeBroker();

  app.use("/api", orderRoutes);
  app.use("/api", cartRoutes);

  //   app.use("/", (req: Request, res: Response) => {
  //     res.status(200).json({ message: "Order Service is running" });
  //   });

  app.use(HandleErrorWithLogger);
  return app;
};
