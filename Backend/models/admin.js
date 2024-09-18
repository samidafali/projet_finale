const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "admin",
    },
});

// Méthode pour hacher le mot de passe avant de le sauvegarder
adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Vérifier si le mot de passe est correct
adminSchema.methods.isPasswordCorrect = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Générer un jeton d'authentification
adminSchema.methods.generateAccessToken = function () {
    return jwt.sign({ _id: this._id, role: this.role }, process.env.JWTPRIVATEKEY, {
        expiresIn: "1h",
    });
};

// Méthode pour générer un jeton JWT (refresh token)
adminSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ _id: this._id, role: this.role }, process.env.JWTPRIVATEKEY, {
        expiresIn: "7d",
    });
};

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
