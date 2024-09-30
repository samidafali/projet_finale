const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
const Teacher = require("../models/teacher");

const adminAuth = async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied, no token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.JWTPRIVATEKEY);
        console.log("Decoded Token:", decoded);

        // Check if the user is an admin
        let admin = await Admin.findById(decoded._id);

        if (!admin) {
            // If not an admin, check if the user is a teacher
            const teacher = await Teacher.findById(decoded._id);

            if (!teacher) {
                return res.status(401).json({ message: "Access denied, admin or teacher not found" });
            }

            // Check if the teacher role exists
            if (teacher.role !== 'teacher') {
                return res.status(403).json({ message: "Access denied, you are not authorized" });
            }

            // If it's a teacher, attach the teacher to the request
            req.teacher = teacher;
            console.log("Teacher found:", req.teacher);
        } else {
            // If it's an admin, attach the admin to the request
            if (admin.role !== 'admin') {
                return res.status(403).json({ message: "Access denied, you are not authorized" });
            }

            req.admin = admin;
            console.log("Admin found:", req.admin);
        }

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(400).json({ message: "Invalid token" });
    }
};

module.exports = adminAuth;
