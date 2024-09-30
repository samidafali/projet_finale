import React, { useState } from "react";
import axios from "axios";
import Main from "../Main/Main";
const AdminAddTeacherToCourse = ({ courseId }) => {
  const [teacherId, setTeacherId] = useState("");

  const handleAddTeacher = () => {
    axios
      .put(`http://localhost:8050/api/courses/${courseId}/addTeacher`, { teacherId })
      .then((response) => {
        console.log("Teacher added successfully");
      })
      .catch((error) => {
        console.error("Error adding teacher:", error);
      });
  };

  return (
    <div>
      <Main/>
      <input
        type="text"
        placeholder="Enter Teacher ID"
        value={teacherId}
        onChange={(e) => setTeacherId(e.target.value)}
      />
      <button onClick={handleAddTeacher}>Add Teacher</button>
    </div>
  );
};

export default AdminAddTeacherToCourse;
