import axios from "axios";
import { APIError, AuthorizeError, NotFoundError } from "../error";
import { logger } from "../logger";
import { User } from "../../dto/User.model";
import { InProcessOrder } from "../../dto/Order.model";
const ORDER_SERVICE_BASE_URL =
  process.env.ORDER_SERVICE_BASE_URL || "http://localhost:9000";

const AUTH_SERVICE_BASE_URL =
  process.env.AUTH_SERVICE_BASE_URL || "http://localhost:9002";
export const GetOrderDetails = async (orderNumber: number) => {
  try {
    console.log("--- order Number in payment service----", orderNumber);
    const url = `${ORDER_SERVICE_BASE_URL}/api/orders/${orderNumber}/checkout`;
    console.log('---url---', url);
    const response = await axios.get(
      `${ORDER_SERVICE_BASE_URL}/api/orders/${orderNumber}/checkout`,
    );
    console.log("--- order in payment service----", response);
    logger.info(response.data);
    return response.data as InProcessOrder;
  } catch (error) {
    logger.error(error);
    throw new APIError("Error fetching product details");
  }
};

export const ValidateUser = async (token: string) => {
  try {
    const response = await axios.get(
      `${AUTH_SERVICE_BASE_URL}/api/auth/validate`,
      {
        headers: { Authorization: token },
      }
    );
    if (response.status !== 200)
      throw new AuthorizeError("User not authorized");
    return response.data as User;
  } catch (error) {
    throw new AuthorizeError("User not authorized");
  }
};
