import { CatchAsyncError } from "./catchAsyncError";
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";
import { json } from "stream/consumers";
import { registrationUser } from "../controlers/user.controller";

export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const accesstoken = req.cookies.access_token;
    if (!accesstoken) {
      return next(new ErrorHandler("Login to access this resource", 400));
    }
    const decode = jwt.verify(
      accesstoken,
      process.env.ACCESS_TOKEN as string
    ) as JwtPayload;
    if (!decode) {
      return next(new ErrorHandler("Invalid token", 400));
    }
    const user = await redis.get(decode.id);
    if (!user) {
      return next(new ErrorHandler("Please Login to access this resourse", 400));
    }
    req.user = JSON.parse(user);
    next();
  }
);

// validate user role:
/**
 * 
 * @param roles accepts a list of n number of string and store it as list
 * @returns a middleware function.
 * 
 */
export const authorizedRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role: ${req.user?.role} is not allowed to access this resource, only ADMIN!!`,
          403
        )
      );
    }
    next();
  };
};
