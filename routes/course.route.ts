import express from "express";
import {
  uploadCourse,
  editCourse,
  getSingleCourse,
  getAllCourse,
  getCourseByUser,
  addQuestion,
  addAnswer,
  addReview,
  addReplyToReview,
  getAllCourses,
  deleteCourse,
} from "../controlers/course.controler";
import { authorizedRoles, isAuthenticated } from "../middleware/auth";
const courseRouter = express.Router();

courseRouter.post(
  "/create-course",
  isAuthenticated,
  authorizedRoles("admin"),
  uploadCourse
);
courseRouter.put(
  "/edit-course/:id",
  isAuthenticated,
  authorizedRoles("admin"),
  editCourse
);
courseRouter.get("/get-course/:id", getSingleCourse);
courseRouter.get("/get-courses", getAllCourse);
courseRouter.get("/get-courses-content/:id", isAuthenticated, getCourseByUser);
courseRouter.put("/add-question", isAuthenticated, addQuestion);
courseRouter.put("/answer-question", isAuthenticated, addAnswer);
courseRouter.put("/add-review/:id", isAuthenticated, addReview);
courseRouter.put(
  "/add-reply",
  isAuthenticated,
  authorizedRoles("admin"),
  addReplyToReview
);
courseRouter.get(
  "/get-all-cources",
  isAuthenticated,
  authorizedRoles("admin"),
  getAllCourses
);
courseRouter.delete(
  "/delete-course/:id",
  isAuthenticated,
  authorizedRoles("admin"),
  deleteCourse
);

export default courseRouter;
