const Admin = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Fonction d'inscription admin
const adminSignUp = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the email already exists
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
        return res.status(409).json({ message: "Admin with given email already exists" });
    }

    // Create new admin and hash the password
    const admin = new Admin({ email, password });
    await admin.save();

    res.status(201).json({ message: "Admin registered successfully" });
};

// Fonction de connexion admin
const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email });

    // Check if admin exists and if the password is correct
    if (!admin || !(await admin.isPasswordCorrect(password))) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate access and refresh tokens
    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    res.status(200).json({ accessToken, refreshToken });
};

// Fonction de déconnexion admin
const adminLogout = async (req, res) => {
    res.status(200).json({ message: "Admin logged out" });
};

module.exports = { adminSignUp, adminLogin, adminLogout };
