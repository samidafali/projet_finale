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
  getEnrolledCourses,
} = require("../controllers/courseController.js");
const adminAuth = require("../middleware/adminMiddleware");
const multer = require("multer");

const upload = multer({ dest: "uploads/" }); // Temporary storage in 'uploads/' before processing

const router = express.Router();

// Public Routes
router.get("/", getAllCourses);
router.get("/admin/all", adminAuth, getAllCourses);
router.get("/:id", getCourseById);

// Protected routes for admins and teachers
router.post(
  "/",
  adminAuth,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "videos", maxCount: 5 },
  ]),
  createCourse
);
router.put(
  "/:id",
  adminAuth,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "videos", maxCount: 5 },
  ]),
  updateCourse
);

router.delete("/:id", adminAuth, deleteCourse);
router.put("/:id/addTeacher", adminAuth, addTeacherToCourse);
router.put("/:courseId/enroll", addUserToCourse); // Enroll user route
router.patch("/:id/approve", adminAuth, approveCourse);

module.exports = router;
