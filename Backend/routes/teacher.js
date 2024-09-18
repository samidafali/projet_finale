const express = require("express");
const { teacherRegister, teacherLogin, verifyTeacherEmail } = require("../controllers/teacherAuthController");
const router = express.Router();

// Teacher Registration
router.post("/register", teacherRegister);

// Teacher Login
router.post("/login", teacherLogin);

// Email Verification
router.get("/:id/verify/:token", verifyTeacherEmail);

module.exports = router;
