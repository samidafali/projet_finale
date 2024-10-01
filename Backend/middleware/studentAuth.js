const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const studentAuth = async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied, no token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.JWTPRIVATEKEY);
        const student = await User.findById(decoded._id);

        if (!student) {
            return res.status(401).json({ message: "Access denied, student not found" });
        }

        req.student = student; // Attache l'étudiant à la requête
        next(); // Passe au prochain middleware ou à la route
    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(400).json({ message: "Invalid token" });
    }
};

module.exports = studentAuth;
