import React, { useEffect, useState } from "react";
import axios from "axios";
import Main from "../Main/Main"; // Assuming Main is your navbar component
//import EnrollStudent from "./EnrollStudent"; // Assuming EnrollStudent component is already created
import EnrollStudent from "./EnrollStudent ";
import styles from "./styles.module.css";
import TeacherCreateCourse from "./TeacherCreateCourse ";

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]); // State to store courses
  const [error, setError] = useState(null); // State to store errors

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token"); // Retrieve token from local storage
        const response = await axios.get("http://localhost:8050/api/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(response.data.data); // Assuming the courses are in response.data.data
      } catch (error) {
        setError("Failed to fetch courses");
        console.error(error);
      }
    };

    fetchCourses(); // Fetch courses on component mount
  }, []);

  const handleEditCourse = (courseId) => {
    // Logic to edit the course
    console.log(`Edit course with ID: ${courseId}`);
  };

  const handleDeleteCourse = (courseId) => {
    const token = localStorage.getItem("token");
    axios
      .delete(`http://localhost:8050/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        // Update the UI after successful deletion
        setCourses(courses.filter((course) => course._id !== courseId));
        console.log("Course deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting course:", error);
      });
  };

  return (
    <div className={styles.dashboard_container}>
      <Main /> {/* Include the navbar */}
	  <TeacherCreateCourse/>
      <div className={styles.dashboard_content}>
        <h1>Teacher Dashboard</h1>
        <p>Manage your courses here.</p>

        {/* Display errors */}
        {error && <p className={styles.error}>{error}</p>}

        {/* List of courses */}
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

                {/* Add Edit and Delete buttons */}
                <button onClick={() => handleEditCourse(course._id)}>Edit Course</button>
                <button onClick={() => handleDeleteCourse(course._id)}>Delete Course</button>

                {/* Form to enroll students */}
                <EnrollStudent courseId={course._id} />
              </li>
            ))}
          </ul>
        ) : (
          <p>No courses available</p>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
