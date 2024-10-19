import React, { useState } from "react";
import axios from "axios";
import styles from "./styles.module.css";
import Main from "../Main/Main"; // Assuming Main is your navbar component

const TeacherCreateCourse = () => {
  const [courseData, setCourseData] = useState({
    coursename: "",
    description: "",
    schedule: [], // Schedule array
    difficulty: "easy", // Default difficulty
    isFree: "true", // Default to free course
    price: "", // Price for paid courses
  });

  const [newSchedule, setNewSchedule] = useState({ day: "", starttime: "", endtime: "" }); // New schedule entry
  const [image, setImage] = useState(null); // State to handle image upload
  const [videos, setVideos] = useState([{ title: "", file: null }]); // Dynamic video fields
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const [errorMessage, setErrorMessage] = useState(""); // State for error message

  // Handle input changes for course name, description, difficulty, etc.
  const handleChange = (e) => {
    setCourseData({
      ...courseData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle adding new schedule entry to the schedule array
  const handleAddSchedule = () => {
    if (newSchedule.day && newSchedule.starttime && newSchedule.endtime) {
      setCourseData({
        ...courseData,
        schedule: [...courseData.schedule, newSchedule], // Add new schedule to array
      });
      setNewSchedule({ day: "", starttime: "", endtime: "" }); // Clear inputs after adding
    }
  };

  // Handle image file upload
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Handle video fields changes
  const handleVideoChange = (index, field, value) => {
    const updatedVideos = [...videos];
    updatedVideos[index][field] = value;
    setVideos(updatedVideos);
  };

  // Add more video fields
  const addVideoInputs = () => {
    setVideos([...videos, { title: "", file: null }]);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("coursename", courseData.coursename);
    formData.append("description", courseData.description);
    formData.append("schedule", JSON.stringify(courseData.schedule));
    formData.append("difficulty", courseData.difficulty);
    formData.append("isFree", courseData.isFree);
    if (courseData.isFree === "false") {
      formData.append("price", courseData.price);
    }

    // Append image if selected
    if (image) {
      formData.append("image", image);
    }

    // Append videos and titles
    videos.forEach((video, index) => {
      if (video.file) {
        formData.append(`videos`, video.file);
        formData.append(`videoTitles[]`, video.title); // Append the corresponding title
      }
    });

    axios
      .post("http://localhost:8050/api/courses", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, // Add the Authorization header
      })
      .then((response) => {
        console.log("Course created successfully:", response.data);
        setSuccessMessage("Course created successfully and pending approval!"); // Set success message
        setErrorMessage(""); // Clear any previous error
        // Optionally, reset the form
        setCourseData({
          coursename: "",
          description: "",
          schedule: [],
          difficulty: "easy",
          isFree: "true",
          price: "",
        });
        setImage(null);
        setVideos([{ title: "", file: null }]);
      })
      .catch((error) => {
        console.error("Error creating course:", error);
        setErrorMessage(
          error.response && error.response.data.message
            ? error.response.data.message
            : "An error occurred while creating the course."
        );
        setSuccessMessage(""); // Clear any previous success message
      });
  };

  return (
    <div>
      <Main/>
     
      <div className={styles.create_course_container}>
        <h2>Create a New Course</h2>

        {/* Display success or error message if exists */}
        {successMessage && <p className={styles.success_message}>{successMessage}</p>}
        {errorMessage && <p className={styles.error_message}>{errorMessage}</p>}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <input
            type="text"
            name="coursename"
            placeholder="Course Name"
            value={courseData.coursename}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Course Description"
            value={courseData.description}
            onChange={handleChange}
            required
          />

          {/* Schedule input */}
          <div className={styles.schedule_container}>
            <h3>Course Schedule</h3>
            <div className={styles.schedule_item}>
              <input
                type="text"
                placeholder="Day (e.g., Monday)"
                value={newSchedule.day}
                onChange={(e) => setNewSchedule({ ...newSchedule, day: e.target.value })}
              />
              <input
                type="time"
                placeholder="Start Time"
                value={newSchedule.starttime}
                onChange={(e) => setNewSchedule({ ...newSchedule, starttime: e.target.value })}
              />
              <input
                type="time"
                placeholder="End Time"
                value={newSchedule.endtime}
                onChange={(e) => setNewSchedule({ ...newSchedule, endtime: e.target.value })}
              />
              <button
                type="button"
                onClick={handleAddSchedule}
                className={styles.add_schedule_btn}
              >
                Add Schedule
              </button>
            </div>

            {/* Display added schedules */}
            <ul>
              {courseData.schedule.map((sched, index) => (
                <li key={index}>
                  {sched.day}: {sched.starttime} - {sched.endtime}
                </li>
              ))}
            </ul>
          </div>

          {/* Difficulty level */}
          <label htmlFor="difficulty">Difficulty</label>
          <select
            name="difficulty"
            value={courseData.difficulty}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="facile">Easy</option>
            <option value="moyen">Medium</option>
            <option value="difficile">Hard</option>
          </select>

          {/* Free or paid course */}
          <label htmlFor="isFree">Is this course free?</label>
          <select
            name="isFree"
            value={courseData.isFree}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>

          {/* Price for paid courses */}
          {courseData.isFree === "false" && (
            <input
              type="number"
              name="price"
              placeholder="Course Price"
              value={courseData.price}
              onChange={handleChange}
              className={styles.input}
              required
            />
          )}

          {/* Image upload */}
          <label htmlFor="image">Course Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className={styles.file_input}
          />

          {/* Video inputs */}
          <div className={styles.video_inputs_container}>
            <h3>Course Videos</h3>
            {videos.map((video, index) => (
              <div key={index} className={styles.video_input_item}>
                <input
                  type="text"
                  placeholder={`Video Title ${index + 1}`}
                  value={video.title}
                  onChange={(e) => handleVideoChange(index, "title", e.target.value)}
                />
                <input
                  type="file"
                  name="videos[]"
                  accept="video/*"
                  onChange={(e) => handleVideoChange(index, "file", e.target.files[0])}
                />
              </div>
            ))}
            {videos.length < 5 && (
              <button type="button" onClick={addVideoInputs} className={styles.add_video_btn}>
                Add Another Video
              </button>
            )}
          </div>

          <button type="submit" className={styles.submit_btn}>
            Create Course
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherCreateCourse;
