
const mongoose = require('mongoose');
const { Course } = require("../models/course.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { ApiError } = require("../utils/ApiError.js"); 
const { ApiResponse } = require("../utils/ApiResponse.js");
const Teacher = require("../models/teacher.js");
const { User } = require("../models/user.js"); 
const sendMail = require("../utils/sendEmail.js");

// Vérifier le rôle d'un utilisateur (Admin ou Teacher)
const checkRole = (user, role) => {
  if (!user || !user.role) {
    throw new ApiError(403, "User not found or role is not defined");
  }
  return user.role === role;
};


// Récupérer tous les cours approuvés
// Récupérer tous les cours
const getAllCourses = asyncHandler(async (req, res) => {
  const user = req.admin || req.teacher || req.user; // Récupérer l'utilisateur connecté

  let courses;

  // Si l'utilisateur est un administrateur, renvoyer tous les cours
  if (user && checkRole(user, 'admin')) {
    courses = await Course.find().populate('enrolledteacher', 'firstName lastName email');
    return res
      .status(200)
      .json(new ApiResponse(200, courses, "All courses fetched successfully"));
  } else {
    // Sinon, renvoyer uniquement les cours approuvés
    courses = await Course.find({ isapproved: true }).populate('enrolledteacher', 'firstName lastName email');
    return res
      .status(200)
      .json(new ApiResponse(200, courses, "Approved courses fetched successfully"));
  }
});


// Récupérer les détails d'un cours spécifique par ID
const getCourseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const singleCourse = await Course.findById(id);
  if (!singleCourse) {
    throw new ApiError(404, "Course not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, singleCourse, "Course details fetched successfully"));
});

// Créer un nouveau cours (Admin ou Teacher)
// Créer un nouveau cours (Admin ou Teacher)
// Créer un nouveau cours (Admin ou Teacher)
const createCourse = asyncHandler(async (req, res) => {
  const user = req.admin || req.teacher; // Admin or teacher

  console.log("Utilisateur connecté:", user); // Log the connected user

  if (!user) {
    throw new ApiError(403, "User not found or role is not defined");
  }

  const { coursename, description, schedule } = req.body;
  let { enrolledteacher } = req.body; // Enrolled teacher may or may not be provided

  // Vérifier les champs requis
  if (!coursename || !description || !schedule) {
    throw new ApiError(400, "All fields (coursename, description, schedule) are required");
  }

  // Si l'utilisateur est un administrateur
  if (checkRole(user, 'admin')) {
    if (!enrolledteacher) {
      throw new ApiError(400, "enrolledteacher is required for admin to create a course");
    }

    // Vérifier si le format de l'ID de l'enseignant est valide
    if (!mongoose.Types.ObjectId.isValid(enrolledteacher)) {
      throw new ApiError(400, "Invalid teacher ID format");
    }

    const newCourse = await Course.create({
      coursename,
      description,
      schedule,
      enrolledteacher,
      isapproved: true // Automatically approve since it's created by admin
    });

    return res
      .status(201)
      .json(new ApiResponse(201, newCourse, "New course created successfully and approved."));
  }
  // Si l'utilisateur est un enseignant
  else if (checkRole(user, 'teacher')) {
    enrolledteacher = user._id; // Assign the logged-in teacher's ID

    const newCourse = await Course.create({
      coursename,
      description,
      schedule,
      enrolledteacher,
      isapproved: false // Course needs to be approved by admin
    });

    return res
      .status(201)
      .json(new ApiResponse(201, newCourse, "New course created successfully and pending approval."));
  } else {
    throw new ApiError(403, "You are not authorized to create a course");
  }
});



// Mettre à jour les informations d'un cours (Admin ou Teacher qui a créé le cours)
// Mettre à jour les informations d'un cours (Admin ou Teacher qui a créé le cours)
const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { coursename, description, schedule, enrolledteacher, isapproved } = req.body;
  const user = req.admin || req.teacher; // Admin or teacher from middleware

  if (!user) {
    throw new ApiError(403, "User not found or role is not defined");
  }

  const existingCourse = await Course.findById(id);
  if (!existingCourse) {
    throw new ApiError(404, "Course not found or could not be updated");
  }

  if (checkRole(user, 'admin')) {
    console.log("User is an admin, authorized to update");
  } else if (checkRole(user, 'teacher') && existingCourse.enrolledteacher.toString() === user._id.toString()) {
    console.log("Teacher is authorized to update their own course");
  } else {
    throw new ApiError(403, "Access denied, you are not authorized to update this course");
  }

  const updateFields = {
    coursename,
    description,
    schedule,
    isapproved,
  };

  // Vérification de l'ID de l'enseignant
  if (enrolledteacher) {
    if (!mongoose.Types.ObjectId.isValid(enrolledteacher)) {
      throw new ApiError(400, "Invalid teacher ID format");
    }
    updateFields.enrolledteacher = new mongoose.Types.ObjectId(enrolledteacher); // Assurez-vous que c'est un ObjectId valide
  }

  const updatedCourse = await Course.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, updatedCourse, "Course updated successfully"));
});





// Supprimer un cours (Admin uniquement)
const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.admin; // Ensure you're using req.admin since only admins can delete

  if (!user) {
    throw new ApiError(403, "User not found or role is not defined");
  }

  // Check if the user is an admin
  if (checkRole(user, 'admin')) {
    const deletedCourse = await Course.findByIdAndDelete(id);
    if (!deletedCourse) {
      throw new ApiError(404, "Course not found or could not be deleted");
    }
    return res.status(200).json(new ApiResponse(200, deletedCourse, "Course deleted successfully"));
  } else {
    throw new ApiError(403, "You are not authorized to delete a course");
  }
});


// Approuver un cours (admin uniquement)
const approveCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isapproved } = req.body;  // Expecting either `true` or `false` for approval status

  const user = req.admin || req.user;

  if (!user || !checkRole(user, 'admin')) {
    throw new ApiError(403, "You are not authorized to approve or reject a course");
  }

  if (typeof isapproved === 'undefined') {
    throw new ApiError(400, "Approval status is required");
  }

  const courseToApprove = await Course.findById(id);
  if (!courseToApprove) {
    throw new ApiError(404, "Course not found");
  }

  courseToApprove.isapproved = isapproved;
  await courseToApprove.save();

  return res
    .status(200)
    .json(new ApiResponse(200, courseToApprove, `Course ${isapproved ? 'approved' : 'rejected'} successfully`));
});



// Ajouter un enseignant à un cours
const addTeacherToCourse = asyncHandler(async (req, res) => {
  const { id } = req.params; // Course ID
  const { teacherId } = req.body; // Teacher ID

  console.log("AddTeacherToCourse Function Called");
  console.log("Course ID:", id);
  console.log("Teacher ID:", teacherId);

  if (!teacherId) {
    console.log("Teacher ID missing in the request");
    throw new ApiError(400, "Teacher ID is required");
  }

  // Check if the teacher exists
  console.log("Checking if Teacher exists...");
  const teacher = await Teacher.findById(teacherId);
  console.log("Teacher:", teacher); // Log the teacher found (if any)

  if (!teacher) {
    console.log("Teacher not found");
    throw new ApiError(404, "Teacher not found");
  }

  // Check if the course exists
  console.log("Checking if Course exists...");
  const courseToUpdate = await Course.findById(id);
  console.log("Course found:", courseToUpdate); // Log the course found (if any)

  if (!courseToUpdate) {
    console.log("Course not found");
    throw new ApiError(404, "Course not found");
  }

  // Ensure enrolledteacher is an array
  if (!Array.isArray(courseToUpdate.enrolledteacher)) {
    courseToUpdate.enrolledteacher = [];
  }

  // Update the course by adding the teacher
  console.log("Updating course with teacher...");
  const updatedCourse = await Course.findByIdAndUpdate(
    id,
    { $addToSet: { enrolledteacher: teacherId } }, // Use $addToSet to add the teacher ID to the array
    { new: true }
  );

  console.log("Updated Course:", updatedCourse);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCourse, "Teacher added to course successfully"));
});




// Ajouter un utilisateur à un cours
// Ajouter un utilisateur à un cours
// Ajouter un utilisateur à un cours
const addUserToCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const theCourse = await Course.findById(courseId);
  if (!theCourse) {
    throw new ApiError(404, "Course not found");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  theCourse.enrolledUsers.push(userId);
  await theCourse.save();

  await sendMail(
    user.email, // Email de l'utilisateur
    "Course Enrollment Confirmation",
    `Dear ${user.firstName}, You have successfully enrolled in the course ${theCourse.coursename}!`
  );

  return res.status(200).json(new ApiResponse(200, theCourse, "User enrolled in course successfully"));
});



// Récupérer les cours auxquels un utilisateur est inscrit
const getEnrolledCourses = asyncHandler(async (req, res) => {
  const { id } = req.params; // ID de l'utilisateur

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const enrolledCourses = await Course.find({ enrolledUsers: id }).select("-enrolledUsers");

  if (!enrolledCourses || enrolledCourses.length === 0) {
    throw new ApiError(404, "No courses found for the specified user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, enrolledCourses, "Enrolled courses fetched successfully"));
});

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  approveCourse,
  addTeacherToCourse,
  addUserToCourse,
  getEnrolledCourses
};
