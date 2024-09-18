const express = require("express");
const router = express.Router();
const { adminLogin, adminSignUp, adminLogout } = require("../controllers/adminController");

// Route pour s'inscrire en tant qu'admin
router.post("/signup", adminSignUp);

// Route pour se connecter en tant qu'admin
router.post("/login", adminLogin);

// Route pour se déconnecter en tant qu'admin
router.post("/logout", adminLogout);

module.exports = router;
