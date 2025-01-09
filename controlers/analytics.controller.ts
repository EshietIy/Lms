import ErrorHandler from "../utils/ErrorHandler";
import { Response, Request, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import userModel from "../models/user.models";
import { generateLast12MothsData } from "../utils/analytics.generator";
import CourseModel from "../models/course.model";
import OrderModel from "../models/orderModel";

// get user analytics

export const getUserAnalytics = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await generateLast12MothsData(userModel);
      res.status(200).json({
        success: true,
        users,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get courses analytics
export const getCourseAnalytics = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await generateLast12MothsData(CourseModel);
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//   get order model
export const getOrderAnalytics = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await generateLast12MothsData(OrderModel);
      res.status(200).json({
        success: true,
        order,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
