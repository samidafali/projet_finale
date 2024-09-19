const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");

const adminAuth = async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied, no token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.JWTPRIVATEKEY); // Vérifiez les deux variables
        console.log("Decoded Token:", decoded); // Log du contenu du jeton

        const admin = await Admin.findById(decoded._id);

        if (!admin) {
            return res.status(401).json({ message: "Access denied, admin not found" });
        }

        // Vérification du rôle admin
        if (admin.role !== 'admin') {
            return res.status(403).json({ message: "Access denied, you are not authorized" });
        }

        req.admin = admin;
        next();
    } catch (error) {
        console.error("Error verifying token:", error); // Log de l'erreur de vérification du jeton
        res.status(400).json({ message: "Invalid token" });
    }
};

module.exports = adminAuth;
