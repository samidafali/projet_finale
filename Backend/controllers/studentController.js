const { User } = require("../models/user");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const asyncHandler = require("express-async-handler");

// Récupérer tous les étudiants
const getAllStudents = asyncHandler(async (req, res) => {
    const students = await User.find(); // Récupère tous les utilisateurs
    if (!students || students.length === 0) {
        return res.status(404).json(new ApiResponse(404, null, "No students found"));
    }
    res.status(200).json(new ApiResponse(200, students, "Students retrieved successfully"));
});

// Mettre à jour les informations d'un étudiant
const updateStudent = asyncHandler(async (req, res) => {
    const { id } = req.params; // Student ID from URL parameters

    // Vérifier si l'ID de l'étudiant correspond à l'utilisateur connecté
    if (req.student._id.toString() !== id) {
        return res.status(403).json({ message: "You are not authorized to update this profile" });
    }

    const { firstName, lastName, email } = req.body; // Assuming these fields are to be updated

    const student = await User.findByIdAndUpdate(
        id,
        { firstName, lastName, email },
        { new: true }
    );

    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    res.status(200).json(new ApiResponse(200, student, "Student updated successfully"));
});

// Supprimer un étudiant
const deleteStudent = asyncHandler(async (req, res) => {
    const { id } = req.params; // Student ID from URL parameters

    // Vérifier si l'ID de l'étudiant correspond à l'utilisateur connecté
    if (req.student._id.toString() !== id) {
        return res.status(403).json({ message: "You are not authorized to delete this profile" });
    }

    const student = await User.findByIdAndDelete(id);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    res.status(200).json(new ApiResponse(200, null, "Student deleted successfully"));
});


// Exporter les fonctions
module.exports = {
    getAllStudents,
    updateStudent,
    deleteStudent,
};
