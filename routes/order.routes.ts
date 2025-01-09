import express from "express";
import { authorizedRoles, isAuthenticated } from "../middleware/auth";
import { createOrder, getOrders } from "../controlers/order.controllers";
const orderRouter = express.Router();

orderRouter.post("/create-order", isAuthenticated, createOrder);
orderRouter.get(
  "/get-orders",
  isAuthenticated,
  authorizedRoles("admin"),
  getOrders
);

export default orderRouter;
