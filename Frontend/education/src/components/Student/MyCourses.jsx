import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './styles.module.css';
import { useNavigate } from 'react-router-dom';
import Main from '../Main/Main';
const MyCourses = () => {
  const [courses, setCourses] = useState([]); // State to store enrolled courses
  const [videosVisibility, setVideosVisibility] = useState({}); // State to store visibility of videos
  const [selectedCourseId, setSelectedCourseId] = useState(null); // State for selected course in fullscreen
  const [error, setError] = useState(""); // Error message state
  const [success, setSuccess] = useState(""); // Success message state

  const studentId = localStorage.getItem("studentId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch enrolled courses for the student
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        console.log("Fetching enrolled courses for student:", studentId);

        const response = await axios.get(`http://localhost:8050/api/courses/students/${studentId}/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Enrolled courses response:", response.data);
        setCourses(response.data.data || []); // Update state with enrolled courses
        setError("");
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        setError("Failed to fetch your courses.");
      }
    };

    fetchEnrolledCourses();
  }, [studentId, token]);

  // Fetch videos for a specific course
  const fetchVideosForCourse = async (courseId) => {
    try {
      console.log(`Fetching videos for course ID: ${courseId}`);

      const response = await axios.get(`http://localhost:8050/api/courses/${courseId}/videos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Videos response:", response.data);

      return response.data.videos;
    } catch (error) {
      console.error("Error fetching course videos:", error);
      setError("Failed to fetch course videos.");
      return [];
    }
  };

  // Toggle videos visibility for a course and switch to full screen view
  const handleSelectCourse = async (courseId) => {
    // If selecting a course for the first time, fetch its videos
    if (!videosVisibility[courseId]) {
      const videos = await fetchVideosForCourse(courseId);
      setVideosVisibility((prevState) => ({
        ...prevState,
        [courseId]: videos, // Set the fetched videos for the course
      }));
      setSuccess("Videos fetched successfully!");
    }

    // Set the selected course to full screen
    setSelectedCourseId(courseId);
  };

  // Back to normal view
  const handleBackToCourses = () => {
    setSelectedCourseId(null); // Deselect the course and show all courses
  };

  return (
    <div>
      <Main />
      <div className={styles.courses_container}>
        <h1>My Enrolled Courses</h1>
        {error && <div className={styles.error_msg}>{error}</div>}
        {success && <div className={styles.success_msg}>{success}</div>}
        {courses.length === 0 && <p>No courses found. You haven't enrolled in any courses yet.</p>}

        <div className={styles.courses_list}>
          {courses.map((course) => (
            <div
              key={course._id}
              className={`${styles.course_item} ${selectedCourseId && selectedCourseId !== course._id ? styles.hide : ''} ${selectedCourseId === course._id ? styles.fullscreen : ''}`}
            >
              <h3>{course.coursename}</h3>
              <p>{course.description}</p>

              {/* Add course image */}
              {course.imageUrl && (
                <img 
                  src={course.imageUrl} 
                  alt={course.coursename} 
                  className={styles.course_image} 
                />
              )}

              {/* Button to view course in full screen */}
              {!selectedCourseId && (
                <button
                  className={styles.toggle_videos_btn}
                  onClick={() => handleSelectCourse(course._id)}
                >
                  View Course
                </button>
              )}

              {/* Display videos if this course is selected */}
              {selectedCourseId === course._id && (
                <div>
                  <div className={styles.video_section}>
                    <h4>Course Videos</h4>
                    {videosVisibility[course._id].map((video, index) => (
                      <div key={index} className={styles.video_item}>
                        <h4>{video.title}</h4>
                        <video controls>
                          <source src={video.url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ))}
                  </div>
                  {/* Button to go back to the normal course view */}
                  <button className={styles.back_btn} onClick={handleBackToCourses}>
                    Back to Courses
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
