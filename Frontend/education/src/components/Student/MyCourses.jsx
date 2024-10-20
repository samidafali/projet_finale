import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './styles.module.css';
import { useNavigate } from 'react-router-dom';
import Main from '../Main/Main';

const MyCourses = () => {
  const [courses, setCourses] = useState([]); // State to store enrolled courses
  const [videos, setVideos] = useState([]); // State to store videos
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
  const handleViewVideos = async (courseId) => {
    try {
      console.log(`Fetching videos for course ID: ${courseId}`);

      const response = await axios.get(`http://localhost:8050/api/courses/${courseId}/videos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Videos response:", response.data);
      if (response.data.videos.length > 0) {
        setVideos(response.data.videos); // Store the videos in state to display
        setSuccess("Videos fetched successfully!");
        setError("");
      } else {
        setError("No videos available for this course.");
        setVideos([]);
      }
    } catch (error) {
      console.error("Error fetching course videos:", error);
      setError("Failed to fetch course videos.");
    }
  };

  return (
    <div>
        <Main/>
    <div className={styles.courses_container}>
      <h1>My Enrolled Courses</h1>
      {error && <div className={styles.error_msg}>{error}</div>}
      {success && <div className={styles.success_msg}>{success}</div>}
      {courses.length === 0 && <p>No courses found. You haven't enrolled in any courses yet.</p>}

      {courses.map((course) => (
        <div key={course._id} className={styles.course_item}>
          <h3>{course.coursename}</h3>
          <p>{course.description}</p>
          <button
            className={styles.view_videos_btn}
            onClick={() => handleViewVideos(course._id)}
          >
            View Course Videos
          </button>
        </div>
      ))}

      {/* Display videos if they exist */}
      {videos.length > 0 && (
        <div className={styles.video_section}>
          <h2>Course Videos</h2>
          {videos.map((video, index) => (
            <div key={index} className={styles.video_item}>
              <h4>{video.title}</h4>
              <video controls>
                <source src={video.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default MyCourses;
