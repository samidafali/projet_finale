
const mongoose = require('mongoose');
const { Course } = require("../models/course.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { ApiError } = require("../utils/ApiError.js"); 
const { ApiResponse } = require("../utils/ApiResponse.js");
const Teacher = require("../models/teacher.js");
const { User } = require("../models/user.js"); 
const sendMail = require("../utils/sendEmail.js");
const cloudinary = require("../utils/cloudinary");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); 
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
  const user = req.admin || req.teacher || req.user;
  let courses;

  console.log("Fetching all courses...");
  
  if (user && checkRole(user, 'admin')) {
    courses = await Course.find()
      .populate('enrolledteacher', 'firstName lastName email')
      .select('coursename description schedule enrolledteacher imageUrl videos difficulty price enrolledUsers');
  } else {
    courses = await Course.find({ isapproved: true })
      .populate('enrolledteacher', 'firstName lastName email')
      .select('coursename description schedule enrolledteacher imageUrl videos difficulty price enrolledUsers');
  }

  return res.status(200).json(new ApiResponse(200, courses, "Courses fetched successfully"));
});





// Récupérer les détails d'un cours spécifique par ID
const getCourseById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.student;  // Utilisez req.student pour obtenir l'utilisateur

  console.log("Course ID from params:", id);
  console.log("User from token:", user);  // Vérifiez si l'utilisateur est bien trouvé

  if (!user || !user._id) {
    console.error('User or user ID is missing:', user);
    return res.status(400).json({ message: "User ID not found in request." });
  }

  const course = await Course.findById(id)
    .populate('enrolledteacher', 'firstName lastName email')
    .select('coursename description schedule enrolledteacher imageUrl videos difficulty price');

  if (!course) {
    console.error('Course not found with ID:', id);
    return res.status(404).json({ message: "Course not found" });
  }

  const isEnrolled = course.enrolledUsers.includes(user._id);
  const response = {
    ...course.toObject(),
    videos: isEnrolled ? course.videos : [],  // Les vidéos ne sont retournées que si l'utilisateur est inscrit
  };

  return res.status(200).json(response);
});



// Fetch course videos for enrolled users
const getCourseVideos = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const user = req.student; // Assuming `studentAuth` middleware is used

  console.log("Course ID:", courseId);
  console.log("User from token:", user);

  // Find the course by ID
  const course = await Course.findById(courseId)
    .select('videos enrolledUsers');

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  // Check if the user is enrolled in the course
  const isEnrolled = course.enrolledUsers.includes(user._id);
  if (!isEnrolled) {
    return res.status(403).json({ message: "Access denied. You are not enrolled in this course." });
  }

  // Return videos to the enrolled user
  return res.status(200).json({ videos: course.videos });
});










// Créer un nouveau cours (Admin ou Teacher)
// Créer un nouveau cours (Admin ou Teacher)
// Créer un nouveau cours (Admin ou Teacher)
const createCourse = asyncHandler(async (req, res) => {
  try {
    const user = req.admin || req.teacher; // Récupérer l'utilisateur (admin ou teacher)
    if (!user) {
      throw new ApiError(403, "User not found or role is not defined");
    }

    const { coursename, description, schedule, videoTitles, difficulty, isFree, price } = req.body;

    // Si l'utilisateur est un enseignant, utiliser son ID comme `enrolledteacher`
    const enrolledteacher = checkRole(user, 'teacher') ? user._id : req.body.enrolledteacher;

    if (checkRole(user, 'teacher') && !enrolledteacher) {
      throw new ApiError(400, "Enrolled teacher is required.");
    }

    // Initialize variables for uploaded files
    let imageUrl = null;
    let videos = [];

    // Handle image upload
    if (req.files && req.files.image) {
      const imageResult = await cloudinary.uploader.upload(req.files.image[0].path, {
        folder: "courses",
        resource_type: "image",
      });
      imageUrl = imageResult.secure_url;
    }

    // Handle video uploads with titles
    if (req.files && req.files.videos) {
      for (let i = 0; i < req.files.videos.length; i++) {
        const video = req.files.videos[i];
        const videoResult = await cloudinary.uploader.upload(video.path, {
          folder: "courses/videos",
          resource_type: "video",
        });
        videos.push({ url: videoResult.secure_url, title: videoTitles[i] });
      }
    }

    // Determine the price, if the course is paid
    const coursePrice = isFree === "false" ? price : 0;

    // Créer un nouveau cours avec les informations fournies
    const newCourse = await Course.create({
      coursename,
      description,
      schedule: JSON.parse(schedule),
      enrolledteacher,
      imageUrl,
      videos,
      difficulty,
      isFree: isFree === "true",
      price: coursePrice,
      isapproved: true // Le cours peut être approuvé par défaut ou en attente de validation selon votre logique
    });

    return res.status(201).json(new ApiResponse(201, newCourse, "New course created successfully."));
  } catch (error) {
    console.error("Error creating course:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});







// Mettre à jour les informations d'un cours (Admin ou Teacher qui a créé le cours)
// Mettre à jour les informations d'un cours (Admin ou Teacher qui a créé le cours)
// Mettre à jour les informations d'un cours (Admin ou Teacher qui a créé le cours)

// Update a course (Admin or Teacher)
// Update a course (Admin or Teacher who is assigned or created the course)


const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { coursename, description, schedule, difficulty, isFree, price } = req.body;
  const user = req.admin || req.teacher;

  if (!user) {
    throw new ApiError(403, "User not found or role is not defined");
  }

  const existingCourse = await Course.findById(id);
  if (!existingCourse) {
    throw new ApiError(404, "Course not found or could not be updated");
  }

  if (checkRole(user, 'admin') || (checkRole(user, 'teacher') && existingCourse.enrolledteacher.toString() === user._id.toString())) {
    const updateFields = {
      coursename,
      description,
      difficulty,
      isFree: isFree === "true",
      price: isFree === "false" ? price : 0,
    };

    // Mise à jour du planning (schedule) si fourni
    if (schedule) {
      try {
        updateFields.schedule = JSON.parse(schedule);
      } catch (err) {
        throw new ApiError(400, "Invalid schedule format");
      }
    }

    // Gestion des fichiers image et vidéo
    let imageUrl = existingCourse.imageUrl; // Garder l'ancienne image si aucune nouvelle n'est téléchargée
    let videos = existingCourse.videos || []; // Garder les anciennes vidéos si aucune nouvelle n'est téléchargée

    if (req.files) {
      // Gestion de l'image
      if (req.files.image) {
        const imageResult = await cloudinary.uploader.upload(req.files.image[0].path, {
          folder: "courses",
          resource_type: "image",
        });
        imageUrl = imageResult.secure_url; // Mettre à jour avec la nouvelle image
      }

      // Gestion des vidéos
      if (req.files.videos) {
        videos = [];
        for (let i = 0; i < req.files.videos.length; i++) {
          const video = req.files.videos[i];
          const videoResult = await cloudinary.uploader.upload(video.path, {
            folder: "courses/videos",
            resource_type: "video",
          });
          videos.push({ url: videoResult.secure_url, title: req.body.videoTitles[i] || "Untitled Video" });
        }
      }
    }

    // Ajouter imageUrl et vidéos à updateFields
    updateFields.imageUrl = imageUrl;
    updateFields.videos = videos;

    // Mise à jour du cours dans la base de données
    const updatedCourse = await Course.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
    return res.status(200).json(new ApiResponse(200, updatedCourse, "Course updated successfully"));
  } else {
    throw new ApiError(403, "Access denied, you are not authorized to update this course");
  }
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
  const { studentId } = req.params; // Extract student ID from the URL

  const user = await User.findById(studentId); // Use studentId to find the user
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const enrolledCourses = await Course.find({ enrolledUsers: studentId }).select("-enrolledUsers");

  if (!enrolledCourses || enrolledCourses.length === 0) {
    throw new ApiError(404, "No courses found for the specified user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, enrolledCourses, "Enrolled courses fetched successfully"));
});



// Enroll a user in a course with payment integration
const enrollInCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const user = req.student;

  console.log("Enroll in Course called for course ID:", courseId);

  if (!user) {
    console.log("User not found or not logged in.");
    throw new ApiError(403, "User not found or not logged in.");
  }

  const course = await Course.findById(courseId);
  if (!course) {
    console.log("Course not found with ID:", courseId);
    return res.status(404).json(new ApiResponse(404, null, "Course not found."));
  }

  // Check if user is already enrolled
  if (course.enrolledUsers.includes(user._id)) {
    console.log("User already enrolled in the course");
    return res.status(400).json(new ApiResponse(400, null, "You are already enrolled in this course."));
  }

  // Add the user to enrolledUsers
  course.enrolledUsers.push(user._id);
  await course.save();

  console.log(`User ${user.email} successfully enrolled in the course ${course.coursename}`);

  return res.status(200).json(new ApiResponse(200, course, "Successfully enrolled in the course."));
});


// Create checkout session for Stripe
const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.student; // Assuming req.student contains the logged-in user

    console.log("Request received to create checkout session.");
    console.log("Course ID:", courseId);
    console.log("Logged in user:", user ? user.email : "No user found");

    // Find the course by its ID
    const course = await Course.findById(courseId);
    if (!course) {
      console.log("Course not found.");
      return res.status(404).json({ message: "Course not found" });
    }

    console.log("Course found:", course.coursename);

    // Create the PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: course.price * 100, // Amount in cents
      currency: 'cad',
      payment_method_types: ['card'],
      receipt_email: user.email,
      metadata: {
        courseId: course._id.toString(),
        userId: user._id.toString(),
      },
    });

    console.log("Stripe payment intent created:", paymentIntent.id);

    // After successful payment, enroll the student in the course
    course.enrolledUsers.push(user._id);
    await course.save();

    console.log(`User ${user.email} successfully enrolled in the course ${course.coursename}`);
    console.log("Enrolled users after saving:", course.enrolledUsers); // Log enrolled users after saving

    // Send confirmation email after enrollment
    await sendMail(
      user.email,
      "Course Enrollment Confirmation",
      `Dear ${user.firstName}, you have successfully enrolled in the course ${course.coursename}!`
    );

    console.log(`Enrollment confirmation email sent to ${user.email}`);

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ message: "Server error" });
  }
};









module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  approveCourse,
  addTeacherToCourse,
  addUserToCourse,
  getEnrolledCourses,
  enrollInCourse,
  createCheckoutSession,
  getCourseVideos
};
