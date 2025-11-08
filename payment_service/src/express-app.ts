import express, { Request, Response } from "express";
import cors from "cors";
import { HandleErrorWithLogger, httpLogger } from "./utils";
import { InitializeBroker } from "./service/broker.service";
import paymentRoutes from "./routes/payment.routes";

export const ExpressApp = async () => {
  const app = express();
  app.use(cors({ origin: "*" }));
  app.use(express.json());

  app.use(httpLogger);

  await InitializeBroker();

  app.use("/api", paymentRoutes);

  app.use("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "Payment Service is running" });
  });

  app.use(HandleErrorWithLogger);
  return app;
};
