import React, { useState, useEffect } from "react";
import axios from "axios";
//import Main from "../Main/Main"; // Assuming Main is your navbar component

const EnrollStudent = () => {
  const [courses, setCourses] = useState([]); // Liste des cours
  const [students, setStudents] = useState([]); // Liste des étudiants
  const [selectedCourse, setSelectedCourse] = useState(""); // ID du cours sélectionné
  const [selectedStudent, setSelectedStudent] = useState(""); // ID de l'étudiant sélectionné

  // Charger la liste des cours à partir de l'API
  useEffect(() => {
    axios
      .get("http://localhost:8050/api/courses", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      .then((response) => {
        setCourses(response.data.data); // Assumer que les cours sont dans response.data.data
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
      });
  }, []);

  // Charger la liste des étudiants à partir de l'API
  useEffect(() => {
    axios
      .get("http://localhost:8050/api/students", { // Remplacez par votre API pour récupérer la liste des étudiants
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      .then((response) => {
        setStudents(response.data.data); // Assumer que les étudiants sont dans response.data.data
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
      });
  }, []);

  // Fonction pour inscrire un étudiant à un cours
  const handleEnrollUser = () => {
    if (!selectedCourse || !selectedStudent) {
      alert("Please select a course and a student");
      return;
    }

    axios
      .put(`http://localhost:8050/api/courses/${selectedCourse}/enroll`, { userId: selectedStudent })
      .then((response) => {
        console.log("Student enrolled successfully");
        alert("Student enrolled successfully");
      })
      .catch((error) => {
        console.error("Error enrolling student:", error);
        alert("Failed to enroll student");
      });
  };

  return (
    <div>
      
      <h2>Enroll a Student in a Course</h2>

      {/* Dropdown pour sélectionner un cours */}
      <select
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
      >
        <option value="">Select a Course</option>
        {courses.map((course) => (
          <option key={course._id} value={course._id}>
            {course.coursename}
          </option>
        ))}
      </select>

      {/* Dropdown pour sélectionner un étudiant */}
      <select
        value={selectedStudent}
        onChange={(e) => setSelectedStudent(e.target.value)}
      >
        <option value="">Select a Student</option>
        {students.map((student) => (
          <option key={student._id} value={student._id}>
            {student.firstName} {student.lastName}
          </option>
        ))}
      </select>

      <button onClick={handleEnrollUser}>Enroll Student</button> {/* Bouton pour inscrire l'étudiant */}
    </div>
  );
};

export default EnrollStudent;
