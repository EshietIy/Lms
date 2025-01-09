import express, { NextFunction, Request, Response } from "express";
require("dotenv").config();
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import { error } from "console";
import userRouter from "./routes/user.routes";
import courseRouter from "./routes/course.route";
import orderRoute from "./routes/order.routes";
import notificationRoutes from "./routes/notification.routes";
import analyticsRouter from "./routes/analytics.route";
import layoutRouter from "./routes/layout.routes";

export const app = express();

//body Parser
app.use(express.json({ limit: "50mb" }));

//cookie Parser
app.use(cookieParser());

//cors => cross orgin resourse sharing
app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);

//Route definition: course router order router
app.use(
  "/api/v1",
  userRouter,
  courseRouter,
  orderRoute,
  notificationRoutes,
  analyticsRouter,
  layoutRouter
);

// testing api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "Api is working",
  });
});

//unknow route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`route ${req.originalUrl} does not exist`) as any;
  err.statusCode = 400;
  next(err);
});

// use error middleware
app.use(ErrorMiddleware);
