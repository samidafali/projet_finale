import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./styles.module.css"; // Assuming you have styles for your components

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [successMessage, setSuccessMessage] = useState(""); // State to track success message

  // Fetch all courses on component mount
  useEffect(() => {
    axios
      .get("http://localhost:8050/api/courses/admin/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      .then((response) => {
        console.log("Courses fetched:", response.data.data);
        setCourses(response.data.data || []); // Ensure courses is an array
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
      });
  }, []);

  // Function to handle course approval or rejection
  const handleApproveReject = (courseId, isapproved) => {
    axios
      .patch(
        `http://localhost:8050/api/courses/${courseId}/approve`,
        { isapproved },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      .then((response) => {
        console.log(`Course ${isapproved ? 'approved' : 'rejected'} successfully`);
        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course._id === courseId ? { ...course, isapproved } : course
          )
        );
        setSuccessMessage(`Course ${isapproved ? 'approved' : 'rejected'} successfully!`);
        setTimeout(() => setSuccessMessage(""), 3000);
      })
      .catch((error) => {
        console.error(`Error ${isapproved ? 'approving' : 'rejecting'} course:`, error);
      });
  };

  // Function to handle course deletion
  const handleDelete = (courseId) => {
    axios
      .delete(`http://localhost:8050/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      .then((response) => {
        console.log("Course deleted successfully");
        setSuccessMessage("Course deleted successfully!");
        setCourses(courses.filter((course) => course._id !== courseId));
        setTimeout(() => setSuccessMessage(""), 3000);
      })
      .catch((error) => {
        console.error("Error deleting course:", error);
      });
  };

  return (
    <div className={styles.courses_container}>
      <h2>All Courses</h2>

      {/* Success message */}
      {successMessage && <p className={styles.success_message}>{successMessage}</p>}

      {courses.length > 0 ? (
        <ul className={styles.courses_list}>
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
              <p>Approved: {course.isapproved ? "Yes" : "No"}</p>

              {/* Display the course image */}
              {course.imageUrl && (
                <div>
                  <h4>Course Image:</h4>
                  <img src={course.imageUrl} alt="Course" className={styles.course_image} />
                </div>
              )}

              {/* Display course videos, if videoUrls is not undefined */}
              {course.videos && course.videos.length > 0 && (
                <div>
                  <h4>Course Videos:</h4>
                  {course.videos.map((video, index) => (
                    <div key={index}>
                      <p>{video.title}</p>
                      <video key={index} src={video.url} controls width="300" />
                    </div>
                  ))}
                </div>
              )}

              {/* Approve and Reject buttons */}
              <div>
                <button
                  onClick={() => handleApproveReject(course._id, true)}
                  className={styles.approve_btn}
                >
                  Approve Course
                </button>
                <button
                  onClick={() => handleApproveReject(course._id, false)}
                  className={styles.reject_btn}
                >
                  Reject Course
                </button>
              </div>

              {/* Delete button */}
              <button onClick={() => handleDelete(course._id)} className={styles.delete_btn}>
                Delete Course
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No courses available.</p>
      )}
    </div>
  );
};

export default AdminCourses;
