const express = require("express");
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  approveCourse,
  addTeacherToCourse,
  addUserToCourse,
  getEnrolledCourses
} = require("../controllers/courseController.js");
const adminAuth = require("../middleware/adminMiddleware");

const router = express.Router();

// Routes publiques
router.get("/", getAllCourses);
router.get("/:id", getCourseById);

// Routes protégées par les rôles (admins and teachers)
router.post("/", adminAuth, createCourse);
router.put("/:id", adminAuth, updateCourse);
router.delete("/:id", adminAuth, deleteCourse);
router.put("/:id/addTeacher", adminAuth, addTeacherToCourse);
router.put("/:courseId/enroll", addUserToCourse);  // Add the route
router.patch("/:id/approve", adminAuth, approveCourse);

module.exports = router;