import React, { useState, useEffect } from "react";
import axios from "axios";
import Main from "../Main/Main";
import TeacherDropdown from "./TeacherDropdown"; // Assurez-vous que ce composant existe
import styles from "./styles.module.css";

const AdminUpdateCourse = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]); // Store teachers for the dropdown
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courseData, setCourseData] = useState({
    coursename: "",
    description: "",
    schedule: [],
    enrolledteacher: "",
    difficulty: "easy", // For difficulty level
    isFree: "true", // Course is free by default
    price: "", // Price (empty by default)
    category: "" // Ajout du champ category
  });
  const [image, setImage] = useState(null); // Image file for the course
  const [videos, setVideos] = useState([{ title: "", file: null }]); // Video files with titles
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // For handling errors

  // Fetch all courses and teachers on component mount
  useEffect(() => {
    // Fetch courses
    axios
      .get("http://localhost:8050/api/courses/admin/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        setCourses(response.data.data);
      })
      .catch((error) => {
        setErrorMessage("Error fetching courses");
      });

    // Fetch teachers for the dropdown
    axios
      .get("http://localhost:8050/api/teachers", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        setTeachers(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching teachers:", error);
      });
  }, []);

  // Fetch the selected course's details when the selected course changes
  useEffect(() => {
    if (selectedCourseId) {
      axios
        .get(`http://localhost:8050/api/courses/${selectedCourseId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          setCourseData(response.data.data);
        })
        .catch((error) => {
          setErrorMessage("");
        });
    }
  }, [selectedCourseId]);

  const handleCourseChange = (e) => {
    setSelectedCourseId(e.target.value);
  };

  const handleInputChange = (e) => {
    setCourseData({
      ...courseData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle the dynamic schedule inputs
  const handleScheduleChange = (index, field, value) => {
    const newSchedule = [...courseData.schedule];
    newSchedule[index][field] = value;
    setCourseData({ ...courseData, schedule: newSchedule });
  };

  const addScheduleEntry = () => {
    setCourseData({
      ...courseData,
      schedule: [...courseData.schedule, { day: "", starttime: "", endtime: "" }],
    });
  };

  const removeScheduleEntry = (index) => {
    const newSchedule = courseData.schedule.filter((_, i) => i !== index);
    setCourseData({ ...courseData, schedule: newSchedule });
  };

  const handleTeacherSelect = (teacherId) => {
    setCourseData({ ...courseData, enrolledteacher: teacherId });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Handle video uploads with title input
  const handleVideoChange = (index, field, value) => {
    const updatedVideos = [...videos];
    updatedVideos[index][field] = value;
    setVideos(updatedVideos);
  };

  // Add more video fields
  const addVideoInputs = () => {
    setVideos([...videos, { title: "", file: null }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("coursename", courseData.coursename);
    formData.append("description", courseData.description);
    formData.append("enrolledteacher", courseData.enrolledteacher);
    formData.append("schedule", JSON.stringify(courseData.schedule));
    formData.append("difficulty", courseData.difficulty);
    formData.append("isFree", courseData.isFree);
    formData.append("category", courseData.category); // Ajouter la catégorie

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
      .put(`http://localhost:8050/api/courses/${selectedCourseId}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log("Course updated successfully:", response.data);
        setUpdateSuccess(true);
        setErrorMessage("");
      })
      .catch((error) => {
        setErrorMessage("Error updating course");
      });
  };

  return (
    <div>
      <Main />
      <div className={styles.update_course_container}>
        <h2>Update Course</h2>

        {/* Success Message */}
        {updateSuccess && <p className={styles.success_message}>Course updated successfully!</p>}

        {/* Error Messages */}
        {errorMessage && <p className={styles.error_message}>{errorMessage}</p>}

        {/* Dropdown to select a course */}
        <select onChange={handleCourseChange} value={selectedCourseId} className={styles.dropdown}>
          <option value="" disabled>
            Select a course to update
          </option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.coursename}
            </option>
          ))}
        </select>

        {selectedCourseId && (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="coursename"
              placeholder="Course Name"
              value={courseData.coursename}
              onChange={handleInputChange}
              className={styles.input}
            />
            <textarea
              name="description"
              placeholder="Course Description"
              value={courseData.description}
              onChange={handleInputChange}
              className={styles.textarea}
            />

            {/* Schedule Section */}
            <h3>Schedule</h3>
            {courseData.schedule.map((scheduleItem, index) => (
              <div key={index} className={styles.schedule_item}>
                <input
                  type="text"
                  placeholder="Day"
                  value={scheduleItem.day}
                  onChange={(e) => handleScheduleChange(index, "day", e.target.value)}
                  className={styles.schedule_input}
                />
                <input
                  type="time"
                  placeholder="Start Time"
                  value={scheduleItem.starttime}
                  onChange={(e) => handleScheduleChange(index, "starttime", e.target.value)}
                  className={styles.schedule_input}
                />
                <input
                  type="time"
                  placeholder="End Time"
                  value={scheduleItem.endtime}
                  onChange={(e) => handleScheduleChange(index, "endtime", e.target.value)}
                  className={styles.schedule_input}
                />
                <button type="button" onClick={() => removeScheduleEntry(index)}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={addScheduleEntry}>
              Add Schedule Entry
            </button>

            {/* Difficulty Dropdown */}
            <h3>Difficulty</h3>
            <select
              name="difficulty"
              value={courseData.difficulty}
              onChange={handleInputChange}
              className={styles.dropdown}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {/* Is Free Section */}
            <h3>Is this course free?</h3>
            <select
              name="isFree"
              value={courseData.isFree}
              onChange={handleInputChange}
              className={styles.dropdown}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>

            {/* Price Section */}
            {courseData.isFree === "false" && (
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={courseData.price}
                onChange={handleInputChange}
                className={styles.input}
              />
            )}

            {/* Teacher Dropdown */}
            <TeacherDropdown
              selectedTeacher={courseData.enrolledteacher}
              onSelect={handleTeacherSelect}
              teachers={teachers} // Pass the fetched teachers
            />

            {/* Category input */}
            <div className={styles.file_input}>
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                placeholder="Enter course category"
                value={courseData.category}
                onChange={handleInputChange}
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

            <button type="submit" className={styles.submit_button}>
              Update Course
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminUpdateCourse;
