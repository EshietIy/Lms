import express from "express";
import {
  getUserAnalytics,
  getCourseAnalytics,
  getOrderAnalytics,
} from "../controlers/analytics.controller";
import { authorizedRoles, isAuthenticated } from "../middleware/auth";

const analyticsRouter = express.Router();

analyticsRouter.get(
  "/get-user-analytics",
  isAuthenticated,
  authorizedRoles("admin"),
  getUserAnalytics
);

analyticsRouter.get(
  "/get-course-analytics",
  isAuthenticated,
  authorizedRoles("admin"),
  getCourseAnalytics
);

analyticsRouter.get(
    "/get-order-analytics",
    isAuthenticated,
    authorizedRoles("admin"),
    getOrderAnalytics
  );
  

export default analyticsRouter;
