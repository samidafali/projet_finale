const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const studentAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
    console.log("Token received:", token);
    console.log("Decoded token:", decoded);

    // Check if the user's role is 'user' instead of 'student'
    const student = await User.findOne({ _id: decoded._id, role: 'user' });

    if (!student) {
      console.log("Student not found.");
      throw new Error("Student not found.");
    }

    req.student = student; // Set the student in the request
    next();
  } catch (error) {
    console.log("Authentication failed:", error.message);
    res.status(401).send({ error: "Please authenticate as a student." });
  }
};



module.exports = studentAuth;
