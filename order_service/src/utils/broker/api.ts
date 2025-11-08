import axios from "axios";
import { APIError, AuthorizeError, NotFoundError } from "../error";
import { logger } from "../logger";
import { Product } from "../../dto/product.dto";
import { User } from "../../dto/User.model";
const CATALOG_SERVICE_BASE_URL =
  process.env.CATALOG_SERVICE_BASE_URL || "http://localhost:8000";

const AUTH_SERVICE_BASE_URL =
  process.env.AUTH_SERVICE_BASE_URL || "http://localhost:9002";
export const GetProductDetails = async (productId: number) => {
  try {
    const response = await axios.get(
      `${CATALOG_SERVICE_BASE_URL}/api/products/${productId}`
    );
    return response.data as Product;
  } catch (error) {
    logger.error(error);
    throw new APIError("Error fetching product details");
  }
};

export const GetStockDetails = async (
  productIds: number[]
): Promise<Product[]> => {
  try {
    const response = await axios.post(
      `${CATALOG_SERVICE_BASE_URL}/api/products/stock`,
      { productIds }
    );
    return response.data as Product[];
  } catch (error) {
    logger.error(error);
    throw new NotFoundError("Product not found");
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
