import userModel from "../models/user.models";
import { Response } from "express";
import { redis } from "../utils/redis";

/**
 * get user by id
 * @param id
 * @param res
 */
export const getuserById = async (id: string, res: Response) => {
  const userJson = await redis.get(id);
  const user = JSON.parse(userJson);
  if (user) {
    res.status(200).json({
      success: true,
      user,
    });
  }
};

// Get all users
export const getAllUsersService = async (res: Response) => {
  const users = await userModel.find().sort({ createdAt: -1 });
  if (users) {
    res.status(200).json({
      success: true,
      users,
    });
  }
};

export const updateUserRoleServices = async (
  id: string,
  role: string,
  res: Response
) => {
  const user = await userModel.findByIdAndUpdate(id, { role }, { new: true });
  if (user) {
    res.status(201).json({
      success: true,
      user,
    });
  }
};
