import { PaymentGateway } from "../utils";
import { GetOrderDetails } from "../utils/broker";
import { SendPaymentUpdateMessage } from "./broker.service";

export const CreatePayment = async (
  userId: number,
  orderNumber: number,
  paymentGateway: PaymentGateway
) => {
  // get order details from order service
  const order = await GetOrderDetails(orderNumber);
  if (order && order.customerId !== userId) {
    throw new Error("user not authorized to create payment");
  }

  // create a new payment record
  const amountInCents = order.amount * 100;
  const orderMetaData = {
    orderNumber: order.orderNumber,
    userId: userId,
  };

  // call payment gateway to create payment
  const paymentResponse = await paymentGateway.createPayment(
    amountInCents,
    orderMetaData
  );
  console.log(paymentResponse);

  // return payment secrets
  return {
    secret: paymentResponse.secret,
    pubkey: paymentResponse.pubkey,
    amount: amountInCents,
  };
};

export const VerifyPayment = async (
  paymentId: string,
  paymentGateway: PaymentGateway
) => {
  // call payment gateway to verify payment
  const paymentResponse = await paymentGateway.getPayment(paymentId);
  const paymentStatus = paymentResponse.status;

  // update order status through message broker
  await SendPaymentUpdateMessage({
    status: paymentStatus,
    orderNumber: paymentResponse.orderNumber,
    paymentLog: paymentResponse.paymentLog,
  });
  // return payment status <= not neccessary just for response to frontend
  return {
    message: "Payment verified",
    status: paymentStatus,
    paymentLog: paymentResponse.paymentLog,
  };
};
