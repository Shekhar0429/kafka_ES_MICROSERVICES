import express, { NextFunction, Request, Response } from "express";
import * as service from "../service/payment.service";
import { RequestAuthorizer } from "./middleware";
import { PaymentGateway, StripePayment } from "../utils";

const router = express.Router();
const paymentGateway: PaymentGateway = StripePayment;

router.use(RequestAuthorizer);

router.post(
  "/create-payment",
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("execution inside create payment :: ");
    const user = req.user;
    if (!user) {
      next(new Error("User not fount"));
      return;
    }
    try {
      const { orderNumber } = req.body;
     console.log("execution inside create payment & order number :: ",orderNumber);

      const response = await service.CreatePayment(
        user.id,
        orderNumber,
        paymentGateway
      );
      res.status(200).json({ message: "Payment Successful", data: response });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/verify-payment/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      next(new Error("User not fount"));
      return;
    }
    const paymentId = req.params.id;
    if (!paymentId) {
      next(new Error("Payment Id is required"));
      return;
    }
    try {
      await service.VerifyPayment(paymentId, paymentGateway);
      res.status(200).json({ message: "Payment verification completed" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
