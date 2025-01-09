import express from "express";
import {
  getNotifications,
  updateNotification,
} from "../controlers/notification.controllers";
import { authorizedRoles, isAuthenticated } from "../middleware/auth";

const notificationRoutes = express.Router();

notificationRoutes.get(
  "/get-all-notifications",
  isAuthenticated,
  authorizedRoles("admin"),
  getNotifications
);
notificationRoutes.put(
  "/update-notification/:id",
  isAuthenticated,
  authorizedRoles("admin"),
  updateNotification
);

export default notificationRoutes;
