// controllers/messageController.js
const Message = require("../models/message");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiResponse } = require("../utils/ApiResponse");
const { ApiError } = require("../utils/ApiError");

// Envoyer un message à un enseignant
const sendMessage = asyncHandler(async (req, res) => {
  const { courseId, receiverId, content, imageUrl } = req.body;
  const senderId = req.student._id; // L'ID de l'utilisateur qui envoie le message

  // Créer un nouveau message
  const message = new Message({
    courseId,
    senderId,
    receiverId,
    content, // Ajoutez ce champ si vous souhaitez inclure le texte du message
    imageUrl, // URL de l'image si fournie
  });

  await message.save();

  return res.status(201).json(new ApiResponse(201, message, "Message sent successfully."));
});

// Récupérer les messages d'un cours
const getMessagesForCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const messages = await Message.find({ courseId })
    .populate('senderId', 'firstName lastName email') // Populate le nom de l'expéditeur
    .populate('receiverId', 'firstName lastName email'); // Populate le nom du destinataire

  return res.status(200).json(new ApiResponse(200, messages, "Messages fetched successfully."));
});

// Récupérer tous les messages envoyés par un utilisateur
const getSentMessages = asyncHandler(async (req, res) => {
  const senderId = req.student._id;

  const messages = await Message.find({ senderId })
    .populate('courseId') // Populate le cours associé
    .populate('receiverId', 'firstName lastName email'); // Populate le nom du destinataire

  return res.status(200).json(new ApiResponse(200, messages, "Sent messages fetched successfully."));
});

// Allow a teacher to send a message back to a student
// Allow a teacher to send a message back to a student
// Allow a teacher to send a message back to a student
const replyToMessage = asyncHandler(async (req, res) => {
    const { messageId, content } = req.body; // Assuming messageId is passed to reference the original message
    const teacherId = req.teacher._id; // The teacher replying

    // Find the original message to ensure it exists
    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
        throw new ApiError(404, "Original message not found");
    }

    const receiverId = originalMessage.senderId; // The student who originally sent the message

    // Create the reply message
    const replyMessage = new Message({
        courseId: originalMessage.courseId,
        senderId: teacherId,
        receiverId: receiverId,
        content,
    });

    await replyMessage.save();

    return res.status(201).json(new ApiResponse(201, replyMessage, "Reply sent successfully."));
});


module.exports = {
  sendMessage,
  getMessagesForCourse,
  getSentMessages,
  replyToMessage 
};
