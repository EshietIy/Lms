import { NextFunction, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import OrderModel from "../models/orderModel";

// create a new order
export const newOrder = CatchAsyncError(
  async (data: any, res: Response, next: NextFunction) => {
    const order = await OrderModel.create(data);
    // send respond
    res.status(201).json({
      success: true,
      order,
    });
  }
);

// get all orders
export const getOrdersService = async (res: Response) => {
  const order = await OrderModel.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    order,
  });
};