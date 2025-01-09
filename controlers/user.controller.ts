import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user.models";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import { redis } from "../utils/redis";
import { getuserById, getAllUsersService, updateUserRoleServices } from "../services/user.service";
import cloudinary from "cloudinary";
import {
  accessTokkenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwt";
import { nextTick } from "process";


//register user
interface IRegstrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export const registrationUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      // check if the email already exist
      const isEmailExist = await userModel.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("Email already exist", 400));
      }
      const user: IRegstrationBody = {
        name,
        email,
        password,
      };
      const activationToken = createActivationToken(user);
      const activationCode = activationToken.activtationCode;
      const data = { user: { name: user.name }, activationCode };
      // const html = await ejs.renderFile(
      //   path.join(__dirname, "../mails/activation-mail.ejs"),
      //   data
      // );
      try {
        //await userModel.create();
        await sendMail({
          email: user.email,
          subject: "Activate your Account",
          template: "activation-mail.ejs",
          data,
        });
        res.status(201).json({
          success: true,
          message: `please check your email ${user.email} to activate your account`,
          activationToken: activationToken.token,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IActivationToken {
  token: string;
  activtationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
  const activtationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    {
      user,
      activtationCode,
    },
    process.env.ACTIVATION_SECRET,
    {
      expiresIn: "5m",
    }
  );

  return { token, activtationCode };
};

interface ActivationRequest {
  activation_token: string;
  activation_code: string;
}

// function that activate user
export const activateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code } =
        req.body as ActivationRequest;
      const newUser = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      ) as { user: IUser; activtationCode };
      if (activation_code !== newUser.activtationCode) {
        return next(new ErrorHandler("Invalid activaton code", 400));
      }
      const { email, name, password } = newUser.user;
      const isEmailExist = await userModel.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("Email already exist", 400));
      }
      const user = await userModel.create({
        email,
        name,
        password,
      });
      res.status(201).json({
        sucess: true,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Login user
interface IloginRequest {
  email: string;
  password: string;
}

export const loginUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as IloginRequest;
      if (!email || !password) {
        return next(new ErrorHandler("Enter your email and password", 400));
      }
      const user = await userModel.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("Invalied Email or Password", 400));
      }
      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalied Email or Password", 400));
      }
      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// logout User
export const logoutUser = CatchAsyncError(
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("access_token", " ", { maxAge: 1 });
      res.cookie("refresh_token", " ", { maxAge: 1 });
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
      // delete user from redis
      const userID = req.user?._id as string;
      redis.del(userID);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

/**
 * update access token using refresh token
 */
export const updateAccessToken = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refresh_token as string;
      const decoded = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN as string
      ) as JwtPayload;
      const message = "Could not get refresh token";
      if (!decoded) {
        return next(new ErrorHandler(message, 400));
      }
      const session = await redis.get(decoded.id as string);
      if (!session) {
        return next(new ErrorHandler("Login to access this resourse!", 400));
      }
      const user = JSON.parse(session);
      const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN as string,
        { expiresIn: "5m" }
      );
      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN as string,
        { expiresIn: "3d" }
      );
      req.user = user;
      res.cookie("access_token", accessToken, accessTokkenOptions);
      res.cookie("refresh_token", refreshToken, refreshTokenOptions);
      await redis.set(user._id, JSON.stringify(user), "EX", 60); // 7 days
      res.status(200).json({
        status: "success",
        accessToken,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

/**
 * Return user info based on id
 */
export const getUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id as string;
      getuserById(userId, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

/*
social Authentication.
*/
interface ISocialAuthBody {
  email: string;
  name: string;
  avatar: string;
}
export const socialAuth = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name, avatar } = req.body as ISocialAuthBody;
      const userExist = await userModel.findOne({ email });
      if (!userExist) {
        const user: IUser = await userModel.create({ email, name, avatar });
        sendToken(user, 200, res);
      } else {
        sendToken(userExist, 200, res);
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

/*
Update user info
*/

interface IUpdateUserInfo {
  name?: string;
  email?: string;
}

export const updateUserInfo = CatchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, email } = req.body as IUpdateUserInfo;
    const id = req.user._id as string;
    const user = await userModel.findById(id);
    if (email && user) {
      const ifEmailExist = await userModel.findOne({ email });
      if (ifEmailExist) {
        return next(new ErrorHandler("Email already exist !!", 400));
      }
      user.email = email;
    }
    if (name && user) {
      user.name = name;
    }
    await user.save();
    await redis.set(id, JSON.stringify(user));

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/*
Updatye user password
*/

interface IUpdatePassword {
  oldPassword: string;
  newPassword: string;
}

export const updatePassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body as IUpdatePassword;
      const userId = req.user._id as string;
      const user = await userModel.findById(userId).select("+password");
      const isPasswordMatch = await user.comparePassword(oldPassword);
      if (!isPasswordMatch) {
        return next(new ErrorHandler("Old Password incorrect", 400));
      }
      user.password = newPassword;
      const updatedUser = await user.save();
      await redis.set(userId, JSON.stringify(updatedUser));
      res.status(201).json({
        seccess: true,
        message: "Password Updated",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// update profile picture
interface IAvatar {
  avatar: string;
}

export const updateProfilePicture = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { avatar } = req.body;
      const userId = req.user._id;
      const user: IUser = userModel.findById(userId) as any;
      //  if an avatar exist then call this if
      if (avatar && user) {
        if (user.avatar.public_id) {
          // delete old image
          await cloudinary.v2.uploader.destroy(user.avatar.public_id);

          const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatar",
            width: 150,
          });
          user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        } else {
          const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatar",
            width: 150,
          });
          user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        }
      }
      const updatedUser = await user.save();
      await redis.set(userId as string, JSON.stringify(user));
      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// get all users
export const getAllUsers = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllUsersService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


// update user role
export const updateUserRole = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role, id } = req.body;
      
     updateUserRoleServices(id, role, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


// delete user
export const deleteUser = CatchAsyncError(async (req:Request, res:Response, next:NextFunction) => {
  try{
    const {id} = req.params;
    const user = await userModel.findById(id);

    if(!user){
      return next(new ErrorHandler("User not Found", 400));
    }
    await user.deleteOne({id});
    await redis.del(id);
    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  }catch(err){
    return next(new ErrorHandler(err.message, 400))
  }
})