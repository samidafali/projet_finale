import React, { useState, useEffect } from "react";
import axios from "axios";
import Main from "../Main/Main";
import TeacherDropdown from "./TeacherDropdown"; // Assurez-vous que ce composant existe
import styles from "./styles.module.css";

const AdminUpdateCourse = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courseData, setCourseData] = useState({
    coursename: "",
    description: "",
    schedule: [],
    enrolledteacher: ""
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Pour gérer les erreurs

  // Fetch all courses on component mount
  useEffect(() => {
    axios
      .get("http://localhost:8050/api/courses/admin/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        setCourses(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        setErrorMessage("Error fetching courses");
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
          console.error("Error fetching course details:", error);
          setErrorMessage("Error fetching course details");
        });
    }
  }, [selectedCourseId]);

  const handleCourseChange = (e) => {
    setSelectedCourseId(e.target.value);
  };

  const handleInputChange = (e) => {
    setCourseData({
      ...courseData,
      [e.target.name]: e.target.value
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
      schedule: [...courseData.schedule, { day: "", starttime: "", endtime: "" }]
    });
  };

  const removeScheduleEntry = (index) => {
    const newSchedule = courseData.schedule.filter((_, i) => i !== index);
    setCourseData({ ...courseData, schedule: newSchedule });
  };

  const handleTeacherSelect = (teacherId) => {
    setCourseData({ ...courseData, enrolledteacher: teacherId });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting course data:", courseData); // Log course data
    axios
      .put(`http://localhost:8050/api/courses/${selectedCourseId}`, courseData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        console.log("Course updated successfully:", response.data);
        setUpdateSuccess(true);
        setErrorMessage("");
      })
      .catch((error) => {
        console.error("Error updating course:", error);
        setErrorMessage("Error updating course");
      });
  };
  

  return (
    <div>
      <Main />
      <div className={styles.update_course_container}>
        <h2>Update Course</h2>

        {/* Success Message */}
        {updateSuccess && (
          <p className={styles.success_message}>Course updated successfully!</p>
        )}

        {/* Error Message */}
        {errorMessage && (
          <p className={styles.error_message}>{errorMessage}</p>
        )}

        {/* Dropdown to select a course */}
        <select
          onChange={handleCourseChange}
          value={selectedCourseId}
          className={styles.dropdown}
        >
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

            {/* Teacher Dropdown */}
            <TeacherDropdown
              selectedTeacher={courseData.enrolledteacher}
              onSelect={handleTeacherSelect}
            />

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
