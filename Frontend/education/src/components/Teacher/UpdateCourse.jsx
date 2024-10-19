// UpdateCourse.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import styles from "./styles.module.css";
import Main from "../Main/Main"; // Votre composant Navbar

const UpdateCourse = ({ onClose }) => {
  const [allCourses, setAllCourses] = useState([]); // Liste de tous les cours
  const [selectedCourseId, setSelectedCourseId] = useState(""); // ID du cours sélectionné
  const [courseData, setCourseData] = useState({
    coursename: "",
    description: "",
    schedule: [],
  });
  const [error, setError] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(true); // Chargement des cours
  const [loadingDetails, setLoadingDetails] = useState(false); // Chargement des détails du cours

  // Récupérer tous les cours pour la liste déroulante
  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8050/api/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllCourses(response.data.data);
        setLoadingCourses(false);
      } catch (error) {
        setError("Échec de la récupération des cours");
        console.error(error);
        setLoadingCourses(false);
      }
    };

    fetchAllCourses();
  }, []);

  // Récupérer les détails du cours sélectionné
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!selectedCourseId) return;

      try {
        setLoadingDetails(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:8050/api/courses/${selectedCourseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourseData(response.data.data);
        setLoadingDetails(false);
      } catch (error) {
        setError("Échec de la récupération des détails du cours");
        console.error(error);
        setLoadingDetails(false);
      }
    };

    fetchCourseDetails();
  }, [selectedCourseId]);

  const handleCourseSelect = (e) => {
    setSelectedCourseId(e.target.value);
    setError(null); // Réinitialiser les erreurs lors de la sélection d'un nouveau cours
  };

  const handleInputChange = (e) => {
    setCourseData({
      ...courseData,
      [e.target.name]: e.target.value,
    });
  };

  const handleScheduleChange = (index, field, value) => {
    const newSchedule = [...courseData.schedule];
    newSchedule[index][field] = value;
    setCourseData({ ...courseData, schedule: newSchedule });
  };

  const addScheduleEntry = () => {
    setCourseData({
      ...courseData,
      schedule: [...courseData.schedule, { day: "", starttime: "", endtime: "" }],
    });
  };

  const removeScheduleEntry = (index) => {
    const newSchedule = courseData.schedule.filter((_, i) => i !== index);
    setCourseData({ ...courseData, schedule: newSchedule });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCourseId) {
      setError("Veuillez sélectionner un cours à mettre à jour.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`http://localhost:8050/api/courses/${selectedCourseId}`, courseData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Cours mis à jour avec succès:", response.data);
      onClose(); // Fermer le formulaire de mise à jour après une mise à jour réussie
    } catch (error) {
      setError("Erreur lors de la mise à jour du cours");
      console.error("Erreur lors de la mise à jour du cours:", error.response ? error.response.data : error.message);
    }
  };

  return (
    <>
      <Main />
      <div className={styles.update_course_container}>
        <h2>Mettre à jour un cours</h2>

        {/* Affichage des erreurs */}
        {error && <p className={styles.error}>{error}</p>}

        {/* Liste déroulante pour sélectionner un cours */}
        {loadingCourses ? (
          <p>Chargement des cours...</p>
        ) : (
          <div className={styles.dropdown_container}>
            <label htmlFor="courseSelect">Sélectionnez un cours à mettre à jour :</label>
            <select
              id="courseSelect"
              onChange={handleCourseSelect}
              value={selectedCourseId}
              className={styles.select}
            >
              <option value="" disabled>
                -- Choisissez un cours --
              </option>
              {allCourses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.coursename}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Formulaire de mise à jour du cours */}
        {loadingDetails ? (
          <p>Chargement des détails du cours...</p>
        ) : (
          selectedCourseId && (
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="text"
                name="coursename"
                placeholder="Nom du cours"
                value={courseData.coursename}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
              <textarea
                name="description"
                placeholder="Description du cours"
                value={courseData.description}
                onChange={handleInputChange}
                className={styles.textarea}
                required
              />

              <h3>Horaire</h3>
              {courseData.schedule.map((scheduleItem, index) => (
                <div key={index} className={styles.schedule_item}>
                  <input
                    type="text"
                    name="day"
                    placeholder="Jour"
                    value={scheduleItem.day}
                    onChange={(e) => handleScheduleChange(index, "day", e.target.value)}
                    className={styles.schedule_input}
                    required
                  />
                  <input
                    type="time"
                    name="starttime"
                    placeholder="Heure de début"
                    value={scheduleItem.starttime}
                    onChange={(e) => handleScheduleChange(index, "starttime", e.target.value)}
                    className={styles.schedule_input}
                    required
                  />
                  <input
                    type="time"
                    name="endtime"
                    placeholder="Heure de fin"
                    value={scheduleItem.endtime}
                    onChange={(e) => handleScheduleChange(index, "endtime", e.target.value)}
                    className={styles.schedule_input}
                    required
                  />
                  <button type="button" onClick={() => removeScheduleEntry(index)} className={styles.remove_button}>
                    Supprimer
                  </button>
                </div>
              ))}
              <button type="button" onClick={addScheduleEntry} className={styles.add_button}>
                Ajouter une entrée d'horaire
              </button>
              <button type="submit" className={styles.submit_button}>
                Mettre à jour le cours
              </button>
            </form>
          )
        )}
      </div>
    </>
  );
};

UpdateCourse.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default UpdateCourse;
