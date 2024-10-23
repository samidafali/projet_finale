// models/message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
  imageUrl: { type: String, required: false } // Champ pour l'URL de l'image
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
