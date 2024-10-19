import React, { useEffect, useState } from "react";
import axios from "axios";
import Main from "../Main/Main"; // Assuming Main is your navbar component
//import EnrollStudent from "./EnrollStudent";
import styles from "./styles.module.css";
//import TeacherCreateCourse from "./TeacherCreateCourse";
import UpdateCourse from "./UpdateCourse"; // Importer le nouveau composant

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]); // État pour stocker les cours
  const [error, setError] = useState(null); // État pour stocker les erreurs
  const [selectedCourseId, setSelectedCourseId] = useState(null); // État pour l'ID du cours sélectionné

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token"); // Récupérer le token depuis le stockage local
        const response = await axios.get("http://localhost:8050/api/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(response.data.data); // Supposons que les cours sont dans response.data.data
      } catch (error) {
        setError("Failed to fetch courses");
        console.error(error);
      }
    };

    fetchCourses(); // Récupérer les cours au montage du composant
  }, []);

  const handleEditCourse = (courseId) => {
    setSelectedCourseId(courseId); // Mettre à jour l'ID du cours sélectionné
  };

  const handleDeleteCourse = (courseId) => {
    const token = localStorage.getItem("token");
    axios
      .delete(`http://localhost:8050/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setCourses(courses.filter((course) => course._id !== courseId)); // Mettre à jour l'UI après la suppression
        console.log("Course deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting course:", error);
      });
  };

  return (
    <div className={styles.dashboard_container}>
      <Main /> {/* Inclure la barre de navigation */}
      <div className={styles.dashboard_content}>
        <h1>Teacher Dashboard</h1>
        <p>Manage your courses here.</p>

        {/* Affichage des erreurs */}
        {error && <p className={styles.error}>{error}</p>}

        {/* Liste des cours */}
        <h2>Your Courses</h2>
        {courses.length > 0 ? (
          <ul>
            {courses.map((course) => (
              <li key={course._id}>
                <h3>{course.coursename}</h3>
                <p>{course.description}</p>
                <p>
                  Schedule:{" "}
                  {course.schedule
                    .map((s) => `${s.day}: ${s.starttime} - ${s.endtime}`)
                    .join(", ")}
                </p>

                {/* Boutons de modification et de suppression */}
                <button onClick={() => handleEditCourse(course._id)}>Edit Course</button>
                <button onClick={() => handleDeleteCourse(course._id)}>Delete Course</button>

                {/* Formulaire pour inscrire des étudiants */}
                
              </li>
            ))}
          </ul>
        ) : (
          <p>No courses available</p>
        )}

        {/* Affichage du formulaire de mise à jour si un cours est sélectionné */}
        {selectedCourseId && (
          <UpdateCourse courseId={selectedCourseId} onClose={() => setSelectedCourseId(null)} />
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;