const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const studentAuth = async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied, no token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
        const student = await User.findById(decoded._id);

        if (!student) {
            return res.status(401).json({ message: "Access denied, student not found" });
        }

        req.student = student; // Ensure this is set correctly
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token" });
    }
};

module.exports = studentAuth;

