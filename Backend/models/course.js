const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  day: { type: String, required: true },
  starttime: { type: String, required: true },
  endtime: { type: String, required: true }
});

const courseSchema = new mongoose.Schema({
  coursename: { type: String, required: true },
  description: { type: String, required: true },
  schedule: [scheduleSchema], // Programme des cours
  enrolledteacher: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }], // Enseignant associé
  enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Utilisateurs inscrits
  isapproved: { type: Boolean, default: false }, // Statut d'approbation du cours
  imageUrl: { type: String }, // Image URL for the course
  videos: [ // Videos array containing video URLs and titles
    {
      url: { type: String },
      title: { type: String }
    }
  ]
});

const Course = mongoose.model("Course", courseSchema);

module.exports = { Course };
