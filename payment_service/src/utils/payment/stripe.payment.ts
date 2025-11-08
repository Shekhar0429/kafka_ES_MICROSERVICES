import { PaymentGateway } from "./payment.type";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

const createPayment = async (
  amount: number,
  metadata: { orderNumber: number; userId: number }
): Promise<{ secret: string; pubkey: string; amount: number }> => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    metadata, // info will be stored against order
  });
  return {
    secret: paymentIntent.client_secret as string,
    pubkey: process.env.STRIPE_PUBLISH_KEY as string,
    amount: paymentIntent.amount,
  };
};

const getPayment = async (
  paymentId: string
): Promise<Record<string, unknown>> => {
  const paymentResponse = await stripe.paymentIntents.retrieve(paymentId, {});
  console.log(paymentResponse);
  const { status } = paymentResponse;
  const orderNumber = paymentResponse.metadata['orderNumber'];
  return { status,orderNumber, paymentLog: paymentResponse };
};

export const StripePayment: PaymentGateway = {
  createPayment,
  getPayment,
};
