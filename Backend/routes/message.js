// routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const studentAuth = require("../middleware/studentAuth");
const adminAuth = require("../middleware/adminMiddleware");

// Route pour envoyer un message
router.post("/", studentAuth, messageController.sendMessage);

// Route pour récupérer les messages d'un cours spécifique
// Allow both students and teachers to access this route
router.get("/:courseId", studentAuth, adminAuth, messageController.getMessagesForCourse);

// Route pour récupérer tous les messages envoyés par un utilisateur
router.get("/sent", studentAuth,adminAuth, messageController.getSentMessages);

// Route pour qu'un enseignant réponde à un message
router.post("/reply", adminAuth, messageController.replyToMessage); // Teacher replies to a message

module.exports = router;
