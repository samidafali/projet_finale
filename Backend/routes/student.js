const express = require("express");
const { getAllStudents,  updateStudent, deleteStudent } = require("../controllers/studentController");
const studentAuth = require("../middleware/studentAuth"); 
const router = express.Router();

router.get("/", getAllStudents);
router.put("/:id", studentAuth, updateStudent); // Mettre à jour un étudiant
router.delete("/:id", studentAuth, deleteStudent); // Supprimer un étudiant

module.exports = router;
