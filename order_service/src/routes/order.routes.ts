import express from "express";
import { MessageBroker } from "../utils/broker";
import { OrderEvent, OrderStatus } from "../types";
import { RequestAuthorizer } from "./middleware";
import * as service from "../services/order.service";
import { OrderRepository, CartRepository } from "../repository";

const router = express.Router();
const orderRepo = OrderRepository;
const cartRepo = CartRepository;

// router.use(RequestAuthorizer);

// Example route for getting order items
router.get("/orders", RequestAuthorizer,async (req, res, next) => {
  const user = req.user;
  if (!user) {
    next(new Error("User Not Found"));
    return;
  }
  const response = await service.GetOrders(user.id, orderRepo);
  res.status(200).json(response);
});

router.get("/orders/:id",RequestAuthorizer, async (req, res, next) => {
  const user = req.user;
  const orderId = +req.params.id;
  if (!user) {
    next(new Error("User Not Found"));
    return;
  }
  const response = await service.GetOrder(orderId, orderRepo);
  res.status(200).json(response);
});

router.post("/orders", RequestAuthorizer,async (req, res, next) => {
  const user = req.user;
  if (!user) {
    next(new Error("User Not Found"));
    return;
  }
  const response = await service.CreateOrder(user.id, orderRepo, cartRepo);
  res.status(200).json(response);
});

// only going to call from microservice
router.patch("/orders/:id",RequestAuthorizer, async (req, res, next) => {
  //security check for microservice calls only
  const orderId = +req.params.id;
  const status = req.body.status;
  console.log("------- status--------", status);
  const response = await service.UpdateOrder(orderId, status, orderRepo);
  res.status(200).json(response);
});

// only going to call from microservice
router.delete("/orders/:id",RequestAuthorizer, async (req, res, next) => {
  const user = req.user;
  if (!user) {
    next(new Error("User Not Found"));
    return;
  }
  const orderId = +req.params.id;
  const response = await service.DeleteOrder(orderId, orderRepo);
  res.status(201).json(response);
});

router.get("/orders/:id/checkout", async (req, res) => {
  const orderNumber = parseInt(req.params.id);
  console.log("-----order number for checkout----", orderNumber);
  const response = await service.CheckOutOrder(orderNumber,orderRepo);
  return res.status(200).json(response);
});

export default router;
