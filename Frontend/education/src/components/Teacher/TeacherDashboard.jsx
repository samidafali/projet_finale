import React, { useEffect, useState } from "react";
import axios from "axios";
import Main from "../Main/Main"; // Assuming Main is your navbar component
import styles from "./styles.module.css";

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]); // State to store courses
  const [error, setError] = useState(null); // State to store errors
  const [successMessage, setSuccessMessage] = useState(""); // State for success messages

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token"); // Retrieve token from localStorage
        const response = await axios.get("http://localhost:8050/api/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(response.data.data); // Assuming courses are in response.data.data
      } catch (error) {
        setError("Failed to fetch courses");
        console.error(error);
      }
    };

    fetchCourses(); // Call the fetch function on component mount
  }, []);

  // Handle course deletion
  const handleDeleteCourse = (courseId) => {
    const token = localStorage.getItem("token");
    axios
      .delete(`http://localhost:8050/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setCourses(courses.filter((course) => course._id !== courseId)); // Update UI after deletion
        setSuccessMessage("Course deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting course:", error);
        setError("Failed to delete course");
      });
  };

  return (
    <div className={styles.dashboard_container}>
      <Main /> {/* Include navbar component */}
      <div className={styles.dashboard_content}>
        <h1>Teacher Dashboard</h1>
        <p>Manage your courses here.</p>

        {/* Success and error messages */}
        {successMessage && <p className={styles.success_message}>{successMessage}</p>}
        {error && <p className={styles.error}>{error}</p>}

        {/* Course list */}
        <h2>Your Courses</h2>
        {courses.length > 0 ? (
          <ul className={styles.course_list}>
            {courses.map((course) => (
              <li key={course._id} className={styles.course_item}>
                <h3>{course.coursename}</h3>
                <p>{course.description}</p>
                <p>
                  Schedule:{" "}
                  {course.schedule
                    .map((s) => `${s.day}: ${s.starttime} - ${s.endtime}`)
                    .join(", ")}
                </p>
                <p>Difficulty: {course.difficulty}</p>
                <p>Price: {course.isFree === "true" ? "Free" : `$${course.price}`}</p>

                {/* Image display */}
                {course.imageUrl && (
                  <div className={styles.course_image_container}>
                    <img
                      src={course.imageUrl}
                      alt="Course"
                      className={styles.course_image}
                    />
                  </div>
                )}

                {/* Video display */}
                {course.videos && course.videos.length > 0 && (
                  <div>
                    <h4>Course Videos</h4>
                    {course.videos.map((video, index) => (
                      <div key={index} className={styles.video_container}>
                        <p>{video.title}</p>
                        <video
                          controls
                          width="300"
                          src={video.url}
                          className={styles.video_player}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Delete button */}
                <div className={styles.course_buttons}>
                  <button
                    className={styles.delete_button}
                    onClick={() => handleDeleteCourse(course._id)}
                  >
                    Delete Course
                  </button>
                </div>
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
