import express, { NextFunction } from "express";
import { CatalogService } from "../services/catalog.service";
import { CatalogRepository } from "../repository/catalog.repository";
import { RequestValidator } from "../utils/requestValidator";
import { CreateProductRequest, updateProductRequest } from "../dto/product.dto";
import { logger } from "../utils";
import { BrokerService } from "../services/broker.service";

const router = express.Router();
export const catalogService = new CatalogService(new CatalogRepository());
const brokerService = new BrokerService(catalogService);
brokerService.initializeBroker();
// endpoints 
router.post("/products", async (req, res, next) => {
  try {
    const { errors, input } = await RequestValidator(
      CreateProductRequest,
      req.body
    );
    if (errors) return res.status(400).json(errors);

    const data = await catalogService.createProduct(input);
    return res.status(201).json(data);
  } catch (error) {
    const err = error as Error;
    console.log("--error--", err);
    return res.status(500).json(err.message);
  }
});

router.patch("/products/:id", async (req, res, next) => {
  try {
    const { errors, input } = await RequestValidator(
      updateProductRequest,
      req.body
    );

    const id = parseInt(req.params.id) || 0;
    if (errors) return res.status(400).json(errors);
    const data = await catalogService.updateProduct({ id, ...input });
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/products/stock", async (req, res, next) => {
  try {
    const productIds = req.body.productIds as number[];
    if (!productIds || !productIds.length)
      return res.status(400).json("productIds is required");
    const data = await catalogService.getProductsByIds(productIds);
    return res.status(200).json(data);
  } catch (error) {
    const err = error as Error;
    return res.status(500).json(err);
  }
});

router.get("/products", async (req, res, next) => {
  const limit = Number(req.query["limit"]) || 10;
  const offset = Number(req.query["offset"]) || 0;
  const search = req.query["search"] as string;
  console.log("search :: ",search);
  try {
    if (!limit || limit < 0)
      return res.status(400).json("limit should be greater than 1");
    logger.info("product info :: ");
    const data = await catalogService.getProducts(limit, offset,search);
    return res.status(200).json(data);
  } catch (error) {
    const err = error as Error;
    return res.status(500).json(err);
  }
});

router.get("/products/:id", async (req, res, next) => {
  try {
    // Id not present
    const productId = parseInt(req.params.id);
    if (!productId) {
      return res.status(400).json("Id not present");
    }
    const data = await catalogService.getProduct(productId);
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

router.delete("/products/:id", async (req, res, next) => {
  try {
    // Id not present
    const productId = parseInt(req.params.id) || 0;
    console.log("--------- id ---------", req.params.id);
    // if (!productId) return res.status(400).json("Id not present");
    const data = await catalogService.deleteProduct(productId);
    return res.status(200).json(data);
  } catch (error) {
    const err = error as Error;
    return res.status(500).json(err);
  }
});

export default router;
