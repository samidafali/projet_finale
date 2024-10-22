import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Main from '../Main/Main';
import axios from 'axios';
import styles from './styles.module.css';

const StudentDashboard = () => {
  const [student, setStudent] = useState(null); // State for student details
  const [courses, setCourses] = useState([]); // State for courses list
  const [error, setError] = useState(""); // Error message state
  const [success, setSuccess] = useState(""); // Success message state

  const studentId = localStorage.getItem("studentId");
  const token = localStorage.getItem("token");
  
  const navigate = useNavigate(); // Define navigate using useNavigate hook

  // Function to fetch courses
  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:8050/api/courses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data.data || []);
      setError("");
    } catch (error) {
      setError("Failed to fetch courses.");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [token]);

  // Check if the student is enrolled in the course
  const isEnrolled = (course) => {
    return course.enrolledUsers && Array.isArray(course.enrolledUsers) && course.enrolledUsers.includes(studentId);
  };

  // Function to handle enrollment
  const handleEnroll = async (courseId, isFree) => {
    try {
      if (isFree) {
        // Handle enrollment for free courses
        await axios.post(`http://localhost:8050/api/courses/${courseId}/enroll`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess("Successfully enrolled in course!");
        fetchCourses(); // Refresh courses after enrollment
      } else {
        // Redirect to the payment page for paid courses
        navigate(`/payment/${courseId}`);
      }
    } catch (error) {
      setError("Failed to enroll in the course.");
    }
  };

  return (
    <div>
      <Main /> {/* Include the main navigation */}
      <div className={styles.dashboard_content}>
        <h1>Student Dashboard</h1>
        {error && <div className={styles.error_msg}>{error}</div>}
        {success && <div className={styles.success_msg}>{success}</div>}

        <h2>Available Courses</h2>
        <div className={styles.courses_list}>
          {courses.length === 0 && <p>No available courses at the moment.</p>}
          {Array.isArray(courses) && courses.map((course) => (
            <div key={course._id} className={styles.course_item}>
              <img src={course.imageUrl} alt={course.coursename} className={styles.course_image} />
              <h3>{course.coursename}</h3>
              <p>{course.description}</p>
              <p>Difficulty: {course.difficulty}</p>
              <p>Category: {course.category}</p> {/* Always show category */}

              {/* Only show price if the course is not free */}
              {!course.isFree && <p>Price: ${course.price}</p>}

              {/* If enrolled in the course */}
              {isEnrolled(course) ? (
                <div>
                  <button onClick={() => navigate('/my-courses')} className={styles.enroll_btn}>
                    Go to My Courses
                  </button>
                </div>
              ) : (
                <button onClick={() => handleEnroll(course._id, course.isFree)} className={styles.enroll_btn}>
                  {course.isFree ? "Enroll in Course" : "Pay to Enroll"}
                </button>
              )}
            </div>
          ))}
        </div>

     
      </div>
    </div>
  );
};

export default StudentDashboard;
