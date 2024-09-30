import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./styles.module.css"; // Import styles

const TeacherDropdown = ({ selectedTeacher, onSelect }) => {
  const [teachers, setTeachers] = useState([]);

  // Fetch all teachers on component mount
  useEffect(() => {
    axios
      .get("http://localhost:8050/api/admin/teachers", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        setTeachers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching teachers:", error);
      });
  }, []);

  return (
    <div className={styles.dropdown_container}>
      <label htmlFor="teacher-select" className={styles.label}>Select Teacher:</label>
      <select
        id="teacher-select"
        value={selectedTeacher}
        onChange={(e) => onSelect(e.target.value)}
        className={styles.dropdown}
      >
        <option value="" disabled>Select a teacher</option>
        {teachers.length > 0 ? (
          teachers.map((teacher) => (
            <option key={teacher._id} value={teacher._id}>
              {teacher.firstName} {teacher.lastName}
            </option>
          ))
        ) : (
          <option value="" disabled>No teachers available</option>
        )}
      </select>
    </div>
  );
};

export default TeacherDropdown;
