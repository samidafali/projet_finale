import { useEffect, useState } from 'react';
import Main from '../Main/Main'; // Adjust the import path as necessary
import axios from 'axios';
import styles from './styles.module.css'; // Import your CSS module

const StudentDashboard = () => {
    const [student, setStudent] = useState(null);
    const [courses, setCourses] = useState([]); // State to store all approved courses
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isEditing, setIsEditing] = useState(false); // New state to toggle edit mode
    const [selectedCourseId, setSelectedCourseId] = useState(null); // Track which course is selected

    // State for the editable form fields
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState(""); // This will be read-only

    const studentId = localStorage.getItem("studentId"); // Get the student ID from localStorage
    const token = localStorage.getItem("token"); // Get the token for authentication

    // Fetch student details when the component mounts
    useEffect(() => {
        const fetchStudentDetails = async () => {
            if (!studentId || !token) {
                setError("Student ID or token is missing. Please log in again.");
                return;
            }

            console.log("Fetching student details for ID:", studentId);

            try {
                const response = await axios.get(`http://localhost:8050/api/students/${studentId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Ensure the token is correctly formatted
                    },
                });
                console.log("Student data fetched:", response.data);
                setStudent(response.data.data); // Set student data

                // Populate the form fields with the fetched student data
                setFirstName(response.data.data.firstName);
                setLastName(response.data.data.lastName);
                setEmail(response.data.data.email); // Properly set the email
                setError(""); // Clear error
            } catch (error) {
                console.error("Error fetching student details:", error);
                setError(error.response ? error.response.data.message : "An error occurred while fetching student details.");
            }
        };

        fetchStudentDetails();
    }, [studentId, token]); // Dependencies: runs when studentId or token changes

    // Fetch all approved courses when the component mounts
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get('http://localhost:8050/api/courses', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCourses(response.data.data); // Assuming the courses are in response.data.data
                setError("");
            } catch (error) {
                setError(error.response ? error.response.data.message : "Failed to fetch courses.");
            }
        };

        fetchCourses();
    }, [token]);

    // Handle form submission to update student details
    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!student) return; // Prevent update if student data is not loaded

        try {
            const updatedStudent = {
                firstName, // The updated first name
                lastName,  // The updated last name
                // Email should remain the same; it is not editable
            };

            await axios.put(`http://localhost:8050/api/students/${studentId}`, updatedStudent, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSuccess("Student updated successfully!");
            setError(""); // Clear any previous error
            setIsEditing(false); // Switch back to view mode
        } catch (error) {
            setError(error.response ? error.response.data.message : "An error occurred while updating student details.");
            setSuccess(""); // Clear any previous success message
        }
    };

    // Handle student deletion
    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete your profile? This action cannot be undone.")) {
            try {
                await axios.delete(`http://localhost:8050/api/students/${studentId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setSuccess("Student deleted successfully!");
                setStudent(null); // Clear student data
            } catch (error) {
                setError(error.response ? error.response.data.message : "An error occurred while deleting student.");
                setSuccess(""); // Clear any previous success message
            }
        }
    };

    // Toggle edit mode to display the form
    const toggleEdit = () => {
        setIsEditing(true);
    };

    // Toggle video visibility for a course when the image is clicked
    const handleImageClick = (courseId) => {
        setSelectedCourseId(courseId === selectedCourseId ? null : courseId); // Toggle between showing and hiding videos
    };

    // Handle course enrollment
   // Handle  enrollment
   const handleEnroll = async (courseId) => {
    try {
        await axios.post(
            `http://localhost:8050/api/courses/${courseId}/enroll`,
            {}, // No data in the body
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Ensure the token is sent in headers
                },
            }
        );
        setSuccess("Enrolled in course successfully!");
        setError(""); // Clear any previous errors
    } catch (error) {
        // Handle various error cases
        if (error.response) {
            const { status, data } = error.response;
            if (status === 400 && data.message === "You are already enrolled in this course.") {
                setError("You are already enrolled in this course.");
            } else if (status === 404) {
                setError("Course not found.");
            } else if (status === 403) {
                setError("You need to log in to enroll in this course.");
            } else {
                setError("An unexpected error occurred. Please try again later.");
            }
        } else {
            setError("Network error. Please check your connection.");
        }
        setSuccess(""); // Clear any previous success messages
    }
};





return (
    <div>
        <Main /> {/* Include the main navigation */}
        <div className={styles.dashboard_content}>
            <h1>Student Dashboard</h1>
            {error && <div className={styles.error_msg}>{error}</div>}
            {success && <div className={styles.success_msg}>{success}</div>}

            {student && !isEditing && (
                <div>
                    {/* Display student information */}
                    <p>Welcome, {student.firstName} {student.lastName}!</p>
                    <p>Email: {student.email}</p>

                    {/* Show Update and Delete buttons */}
                    <button onClick={toggleEdit} className={styles.green_btn}>
                        Update Profile
                    </button>
                    <button onClick={handleDelete} className={styles.delete_btn}>
                        Delete Profile
                    </button>
                </div>
            )}

            {/* Display all approved courses */}
            <h2>Available Courses</h2>
            <div className={styles.courses_list}>
                {courses.length === 0 && <p>No available courses at the moment.</p>}
                {courses.map((course) => (
                    <div key={course._id} className={styles.course_item}>
                        {course.imageUrl && (
                            <img
                                src={course.imageUrl}
                                alt={course.coursename}
                                className={styles.course_image}
                                onClick={() => handleImageClick(course._id)} // Toggle videos when clicking the image
                            />
                        )}
                        <h3>{course.coursename}</h3>
                        <p>{course.description}</p>
                        <p>Difficulty: {course.difficulty}</p>
                        <p>{course.isFree ? "Free" : `Price: $${course.price}`}</p>

                        {/* Show enroll button */}
                        <button
                            onClick={() => handleEnroll(course._id)}
                            className={styles.enroll_btn}
                        >
                            Enroll in Course
                        </button>

                        {/* Only show videos if they exist */}
                        {selectedCourseId === course._id && course.videos && course.videos.length > 0 && (
                            <div className={styles.videos_section}>
                                <h4>Course Videos:</h4>
                                {course.videos.map((video, index) => (
                                    <div key={index} className={styles.video_item}>
                                        <p>{video.title || `Video ${index + 1}`}</p>
                                        <video width="100%" height="auto" controls>
                                            <source src={video.url} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </div>
);
}
export default StudentDashboard;
