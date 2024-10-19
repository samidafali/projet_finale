const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const studentAuth = async (req, res, next) => {
    console.log("Request headers:", req.headers); // Log headers for debugging
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token) {
        console.log("Token not found");
        return res.status(401).json({ message: "Access denied, no token provided" });
    }

    try {
        console.log("Verifying token:", token);
        const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
        const student = await User.findById(decoded._id);

        if (!student) {
            return res.status(401).json({ message: "Access denied, student not found" });
        }

        req.student = student;
        next();
    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(400).json({ message: "Invalid token" });
    }
};

module.exports = studentAuth;
