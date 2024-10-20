import { useEffect, useState } from 'react';
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
  const navigate = useNavigate();

  // Fetch courses function
  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:8050/api/courses', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Logging the courses response
      console.log("Courses response:", response.data);

      if (Array.isArray(response.data.data)) {
        setCourses(response.data.data); // Ensure response is an array
      } else {
        setCourses([]); // Default to an empty array if the response is not valid
      }
      setError("");
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to fetch courses.");
    }
  };

  // Fetch student details
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

        // Logging student details
        console.log("Student details fetched:", response.data);

        setStudent(response.data.data);
        setError("");
      } catch (error) {
        console.error("Error fetching student details:", error);
        setError("An error occurred while fetching student details.");
      }
    };
    fetchStudentDetails();
  }, [studentId, token]);

  // Fetch courses after page load
  useEffect(() => {
    fetchCourses();
  }, [token]);

  // Check if the student is enrolled in the course
  const isEnrolled = (course) => {
    console.log("Checking enrollment for course:", course.coursename);
    console.log("Course enrolled users:", course.enrolledUsers);
    console.log("Current student ID:", studentId);

    // Ensure that enrolledUsers is not null and contains the student's ID
    return course.enrolledUsers && Array.isArray(course.enrolledUsers) && course.enrolledUsers.includes(studentId);
  };

  // Handle enrollment and payment
  const handleEnroll = (courseId, isFree) => {
    console.log(`Handle enroll for course: ${courseId}, isFree: ${isFree}`);

    if (isFree) {
      // Handle enrollment for free courses
      axios.post(`http://localhost:8050/api/courses/${courseId}/enroll`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        console.log(`Successfully enrolled in course: ${courseId}`);
        setSuccess("Enrolled in course successfully!");
        setError("");
        fetchCourses(); // Refresh the course list after enrollment
      })
      .catch((error) => {
        console.error("Error during enrollment:", error);
        setError("An error occurred while enrolling.");
        setSuccess("");
      });
    } else {
      // Redirect to the payment page for paid courses
      console.log(`Redirecting to payment page for course: ${courseId}`);
      navigate(`/payment/${courseId}`); // Redirect to payment page with courseId
    }
  };

  // Handle redirection to "My Courses"
  const handleRedirectToMyCourses = () => {
    navigate("/my-courses"); // Change to your actual route for "My Courses"
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
              <p>{course.isFree ? "Free" : `Price: $${course.price}`}</p>

              {/* If enrolled in the course */}
              {isEnrolled(course) ? (
                <>
                  {/* Only show "Go to My Courses" for paid courses */}
                  {!course.isFree && (
                    <button onClick={handleRedirectToMyCourses} className={styles.enroll_btn}>
                      Go to My Courses
                    </button>
                  )}
                </>
              ) : (
                // Show "Pay to Enroll" for paid courses or "Enroll in Course" for free courses
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
