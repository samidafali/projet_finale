import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Main from '../Main/Main';
import axios from 'axios';
import styles from './styles.module.css';

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const studentId = localStorage.getItem("studentId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!studentId || !token) {
        setError("Student ID or token is missing. Please log in again.");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8050/api/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudent(response.data.data);
        setError("");
      } catch (error) {
        setError("An error occurred while fetching student details.");
      }
    };
    fetchStudentDetails();
  }, [studentId, token]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:8050/api/courses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(response.data.data);
        setError("");
      } catch (error) {
        setError("Failed to fetch courses.");
      }
    };
    fetchCourses();
  }, [token]);

  const handleEnroll = (courseId, isFree) => {
    if (isFree) {
      // Handle enrollment for free courses
      axios.post(`http://localhost:8050/api/courses/${courseId}/enroll`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        setSuccess("Enrolled in course successfully!");
        setError("");
      })
      .catch(() => {
        setError("An error occurred while enrolling.");
        setSuccess("");
      });
    } else {
      // Redirect to the payment page for paid courses
      navigate(`/payment/${courseId}`); // Redirect to payment page with courseId
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
          {courses.map((course) => (
            <div key={course._id} className={styles.course_item}>
              <img src={course.imageUrl} alt={course.coursename} className={styles.course_image} />
              <h3>{course.coursename}</h3>
              <p>{course.description}</p>
              <p>Difficulty: {course.difficulty}</p>
              <p>{course.isFree ? "Free" : `Price: $${course.price}`}</p>

              <button onClick={() => handleEnroll(course._id, course.isFree)} className={styles.enroll_btn}>
                {course.isFree ? "Enroll in Course" : "Pay to Enroll"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
