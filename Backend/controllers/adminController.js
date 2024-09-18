const Admin = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Fonction d'inscription admin
const adminSignUp = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const existingAdmin = await Admin.findOne({ username });

    if (existingAdmin) {
        return res.status(409).json({ message: "Admin already exists" });
    }

    const admin = new Admin({ username, password });
    await admin.save();

    res.status(201).json({ message: "Admin registered successfully" });
};

// Fonction de connexion admin
const adminLogin = async (req, res) => {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin || !(await admin.isPasswordCorrect(password))) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    res.status(200).json({ accessToken, refreshToken });
};

// Fonction de déconnexion admin
const adminLogout = async (req, res) => {
    res.status(200).json({ message: "Admin logged out" });
};

module.exports = { adminSignUp, adminLogin, adminLogout };
