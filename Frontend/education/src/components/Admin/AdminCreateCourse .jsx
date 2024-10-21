import React, { useState } from "react";
import axios from "axios";
import styles from "./styles.module.css";
import Main from "../Main/Main"; // Assuming Main is your navbar component
import TeacherDropdown from "./TeacherDropdown"; // Import the TeacherDropdown component

const AdminCreateCourse = () => {
  const [courseData, setCourseData] = useState({
    coursename: "",
    description: "",
    schedule: [], // Schedule array
    enrolledteacher: "", // Store selected teacher's ID here
    difficulty: "easy", // Default difficulty level
    isFree: "true", // Default value for course free status
    price: 0, // Default price (only relevant if the course is paid)
    category: "" // Add the category state here
  });

  const [newSchedule, setNewSchedule] = useState({ day: "", starttime: "", endtime: "" }); // New schedule entry
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const [image, setImage] = useState(null); // State to store selected image
  const [videos, setVideos] = useState([{ title: "", file: null }]); // State to store selected videos with titles
  const [pdfFile, setPdfFile] = useState(null); // State to store selected PDF

  // Handle input changes for course data
  const handleChange = (e) => {
    setCourseData({
      ...courseData,
      [e.target.name]: e.target.value
    });
  };

  // Handle the teacher selection from the dropdown
  const handleTeacherSelect = (teacherId) => {
    setCourseData({
      ...courseData,
      enrolledteacher: teacherId // Set the selected teacher's ID
    });
  };

  // Handle adding new schedule entry to the schedule array
  const handleAddSchedule = () => {
    if (newSchedule.day && newSchedule.starttime && newSchedule.endtime) {
      setCourseData({
        ...courseData,
        schedule: [...courseData.schedule, newSchedule] // Add new schedule to array
      });
      setNewSchedule({ day: "", starttime: "", endtime: "" }); // Clear inputs after adding
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    setImage(e.target.files[0]); // Set selected image file
  };

  // Handle video change with title input
  const handleVideoChange = (index, field, value) => {
    const updatedVideos = [...videos];
    updatedVideos[index][field] = value;
    setVideos(updatedVideos);
  };

  // Add more video fields
  const addVideoInputs = () => {
    setVideos([...videos, { title: "", file: null }]);
  };

  // Handle PDF upload
  const handlePdfChange = (e) => {
    setPdfFile(e.target.files[0]); // Set selected PDF file
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("coursename", courseData.coursename);
    formData.append("description", courseData.description);
    formData.append("enrolledteacher", courseData.enrolledteacher);
    formData.append("schedule", JSON.stringify(courseData.schedule));
    formData.append("difficulty", courseData.difficulty);
    formData.append("isFree", courseData.isFree);
    formData.append("category", courseData.category); // Add category to formData

    // If the course is not free, include the price
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

    // Append PDF if selected
    if (pdfFile) {
      formData.append("pdf", pdfFile);
    }

    axios
      .post("http://localhost:8050/api/courses", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log("Course created successfully:", response.data);
        setSuccessMessage("Course created successfully!");
      })
      .catch((error) => {
        console.error("Error creating course:", error);
      });
  };

  return (
    <div>
      <Main />
      <div className={styles.create_course_container}>
        <h2>Create a New Course</h2>

        {/* Display success message if exists */}
        {successMessage && <p className={styles.success_message}>{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          {/* Course name */}
          <input
            type="text"
            name="coursename"
            placeholder="Course Name"
            value={courseData.coursename}
            onChange={handleChange}
            required
          />

          {/* Course description */}
          <textarea
            name="description"
            placeholder="Course Description"
            value={courseData.description}
            onChange={handleChange}
            required
          />

          {/* Teacher Dropdown */}
          <TeacherDropdown
            selectedTeacher={courseData.enrolledteacher}
            onSelect={handleTeacherSelect}
          />

          {/* Difficulty level */}
          <div>
            <label>Course Difficulty</label>
            <select name="difficulty" value={courseData.difficulty} onChange={handleChange}>
              <option value="easy">easy</option>
              <option value="meduim">meduim</option>
              <option value="hard">hard</option>
            </select>
          </div>

          {/* Course Type: Free or Paid */}
          <div>
            <label>Is the Course Free?</label>
            <select name="isFree" value={courseData.isFree} onChange={handleChange}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Course Price (only if not free) */}
          {courseData.isFree === "false" && (
            <div>
              <label>Course Price</label>
              <input
                type="number"
                name="price"
                value={courseData.price}
                onChange={handleChange}
                placeholder="Enter course price"
              />
            </div>
          )}

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
              <button type="button" onClick={handleAddSchedule} className={styles.add_schedule_btn}>
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

          {/* Category selection */}
          <div>
            <label>Category</label>
            <input
              type="text"
              name="category"
              placeholder="Course Category"
              value={courseData.category}
              onChange={handleChange}
              required
            />
          </div>

          {/* Image input */}
          <div className={styles.file_input}>
            <label htmlFor="image">Course Image</label>
            <input type="file" id="image" name="image" accept="image/*" onChange={handleImageChange} />
          </div>

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

          {/* PDF input */}
          <div className={styles.file_input}>
            <label htmlFor="pdf">Course PDF</label>
            <input type="file" id="pdf" name="pdf" accept="application/pdf" onChange={handlePdfChange} />
          </div>

          <button type="submit">Create Course</button>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateCourse;
