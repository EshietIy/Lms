import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import cloudinary from "cloudinary";
import LayoutModel from "../models/layout.models";

// create layout
export const createLayout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;
      const isTypeExist = await LayoutModel.findOne({ type });
      if (isTypeExist) {
        return next(new ErrorHandler("Layout already exist", 400));
      }

      if (type === "Banner") {
        const { image, title, subTitle } = req.body;
        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "layout",
        });
        const banner = {
          image: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          },
          title,
          subTitle,
        };
        await LayoutModel.create(banner);
      }

      if (type === "FAQ") {
        const { faq } = req.body;
        await LayoutModel.create({ type: "FAQ", faq });
      }

      if (type === "Categories") {
        const { categories } = req.body;
        await LayoutModel.create({ type: "Categories", categories });
      }

      //   give response
      res.status(200).json({
        success: true,
        message: "Layout created successfuly",
      });
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);

// Edit Layout
export const editLayout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;
      if (type === "Banner") {
        const bannerData: any = await LayoutModel.findOne({ type: "Banner" });
        const { image, title, subTitle } = req.body;
        if (bannerData) {
          await cloudinary.v2.uploader.destroy(bannerData.image.public_id);
        }

        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "layout",
        });

        const banner = {
          type: "Banner",
          image: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          },
          title,
          subTitle,
        };
        await LayoutModel.findOneAndUpdate(bannerData._id, { banner });
      }

      if (type === "FAQ") {
        const { faq } = req.body;
        const faqData: any = await LayoutModel.findOne({ type: "FAQ" });
        await LayoutModel.findOneAndUpdate(faqData._id, { type: "FAQ", faq });
      }

      if (type === "Categories") {
        const { categories } = req.body;
        const categoriesData: any = await LayoutModel.findOne({
          type: "Categories",
        });
        await LayoutModel.findOneAndUpdate(categoriesData._id, {
          type: "Categories",
          categories,
        });
      }

      //   give response
      res.status(200).json({
        success: true,
        message: "Layout updated successfuly",
      });
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);

// get layout by types
export const getLayoutByType= CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const layout = await LayoutModel.findOne({ type: req.body.type });
      if (!layout) {
        return next(new ErrorHandler("Layout not found", 404));
      }
      res.status(200).json({
        success: true,
        layout,
      });
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);
