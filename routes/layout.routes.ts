import express from "express";
import { createLayout, editLayout, getLayoutByType } from "../controlers/layout.controllers";
import { authorizedRoles, isAuthenticated } from "../middleware/auth";

const layoutRouter = express.Router();

layoutRouter.post(
  "/create-layout",
  isAuthenticated,
  authorizedRoles("admin"),
  createLayout
);

layoutRouter.put(
  "/edit-layout",
  isAuthenticated,
  authorizedRoles("admin"),
  editLayout
);

layoutRouter.get("/get-layout", getLayoutByType);
export default layoutRouter;
