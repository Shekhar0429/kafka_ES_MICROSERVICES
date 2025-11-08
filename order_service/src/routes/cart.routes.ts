import express, { Request, Response, NextFunction } from "express";
import * as service from "../services/cart.service";
// import { CartRepositoryType } from "../types/repository.type";
import { CartRepository } from "../repository/cart.repository";
import { CartRequestSchema, CartRequestType } from "../dto/cartRequest.dto";
import { ValidateRequest } from "../utils";
import { RequestAuthorizer } from "./middleware";
import { ne } from "drizzle-orm";

const router = express.Router();
const repo = CartRepository;

router.use(RequestAuthorizer);
router.post("/cart", async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      next(new Error("User not found in request"));
      return;
    }
    req.body.customerId = user.id;
    const err = ValidateRequest<CartRequestType>(req.body, CartRequestSchema);
    if (err) return res.status(400).json({ error: err });

    const input = req.body as CartRequestType;
    const response = await service.CreateCart(
      { ...input, customerId: user.id },
      repo
    );
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

router.get("/cart", async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      next(new Error("User not found in request"));
      return;
    }
    const response = await service.GetCart(user.id, repo);
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.patch("/cart/:lineItemId", async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      next(new Error("User not found in request"));
      return;
    }
    const cartLineItemId = req.params.lineItemId;
    const response = await service.EditCart(
      {
        id: +cartLineItemId,
        qty: req.body.qty,
        customerId: user.id,
      },
      repo
    );
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.delete("/cart/:lineItemId", async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      next(new Error("User not found in request"));
      return;
    }
    const cartLineItemId = req.params.lineItemId;
    const response = await service.DeleteCart(
      {
        id: +cartLineItemId,
        customerId: user.id,
      },
      repo
    );
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
