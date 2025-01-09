require("dotenv").config();
import { Response } from "express";
import { IUser } from "../models/user.models";
import { redis } from "./redis";
import { log } from "console";

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

 // pares environment variable to integrate with fallback
const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_AGE || "300", 10);
  const refreshTokenExpire = parseInt(
    process.env.REFRESH_TOKEN_AGE || "1200",
    10
  );
  // option for cookies
export const accessTokkenOptions: ITokenOptions = {
  expires: new Date(Date.now() + accessTokenExpire *60*60*1000),
  maxAge: accessTokenExpire *60*60*1000,
  httpOnly: true,
  sameSite: "lax",
};

export const refreshTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpire *24*60*60* 1000),
  maxAge: refreshTokenExpire *24*60*60*1000,
  httpOnly: true,
  sameSite: "lax",
};

export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = user.SignedAccesToken();
  const refreshToken = user.SignRefreshToken();

  //upload session Token to redis
  redis.set(user._id as string, JSON.stringify(user) as any);

   res.cookie("access_token", accessToken, accessTokkenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
  });
};
