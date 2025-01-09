import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { timeStamp } from "console";
import jwt from "jsonwebtoken";
require("dotenv").config();

const emailRegexPattern: RegExp =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerfied: boolean;
  courses: Array<{ couseId: string }>;
  comparePassword: (password: string) => Promise<boolean>;
  SignedAccesToken: () => string;
  SignRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      resuired: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please eneter your email"],
      validate: {
        validator: function (value: string) {
          return emailRegexPattern.test(value);
        },
        message: "Please enter a valid email",
      },
      unique: true,
    },
    password: {
      type: String,
      // required: [true, "Please enter your password"],
      minlength: [6, "Password must be atleast 6 charecter"],
      select: false,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      default: "User",
    },
    isVerfied: {
      type: Boolean,
      default: false,
    },
    courses: [
      {
        courseId: String,
      },
    ],
  },
  { timestamps: true }
);

// Hash Password Before
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare Password
userSchema.methods.comparePassword = async function (
  entredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(entredPassword, this.password);
};

//Generate sign token
userSchema.methods.SignedAccesToken = function (): string {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || "", {expiresIn:"5m"});
};
//Generate refresh token
userSchema.methods.SignRefreshToken = function (): string {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || " ", {expiresIn:"3d"});
};

const userModel: Model<IUser> = mongoose.model("user", userSchema);
export default userModel;
