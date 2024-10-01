import React, { useState } from "react";
import axios from "axios";
import Main from "../Main/Main"; // Assuming Main is your navbar component

const TeacherCreateCourse = () => {
  const [courseData, setCourseData] = useState({
    coursename: "",
    description: "",
    schedule: [],
  });
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setCourseData({
      ...courseData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token"); // Get the auth token from local storage
    axios
      .post(
        "http://localhost:8050/api/courses",
        courseData,
        {
          headers: { Authorization: `Bearer ${token}` }, // Include the token for authorization
        }
      )
      .then((response) => {
        setSuccessMessage("Course created successfully!");
        console.log("Course created:", response.data);
      })
      .catch((error) => {
        console.error("Error creating course:", error);
      });
  };

  return (
    <div>
      <Main />
      <h2>Create New Course</h2>
      {successMessage && <p>{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="coursename"
          placeholder="Course Name"
          value={courseData.coursename}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Course Description"
          value={courseData.description}
          onChange={handleChange}
        />
        <button type="submit">Create Course</button>
      </form>
    </div>
  );
};

export default TeacherCreateCourse;
