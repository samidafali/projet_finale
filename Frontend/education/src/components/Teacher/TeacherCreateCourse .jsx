import React, { useState } from "react";
import axios from "axios";
import styles from "./styles.module.css";
import Main from "../Main/Main"; // Assuming Main is your navbar component

const TeacherCreateCourse = () => {
  const [courseData, setCourseData] = useState({
    coursename: "",
    description: "",
    schedule: [], // Schedule array
  });

  const [newSchedule, setNewSchedule] = useState({ day: "", starttime: "", endtime: "" }); // New schedule entry
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const [errorMessage, setErrorMessage] = useState(""); // State for error message

  // Handle input changes for course name, description, etc.
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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:8050/api/courses", courseData, {
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
        });
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

        <form onSubmit={handleSubmit}>
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

          <button type="submit" className={styles.submit_btn}>
            Create Course
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherCreateCourse;
