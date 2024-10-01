import { useEffect, useState } from 'react';
import Main from '../Main/Main'; // Adjust the import path as necessary
import axios from 'axios';
import styles from './styles.module.css'; // Import your CSS module

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const studentId = localStorage.getItem("studentId"); // Get the student ID from localStorage
  const token = localStorage.getItem("token"); // Get the token for authentication

  // Fetch student details
  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!studentId) {
        setError("Student ID is missing. Please log in again.");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8050/api/students/${studentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStudent(response.data.data); // Set student data
      } catch (error) {
        setError(error.response ? error.response.data.message : "An error occurred while fetching student details.");
      }
    };

    fetchStudentDetails();
  }, [studentId, token]);

  // Update student details
  const handleUpdate = async () => {
    try {
      const updatedStudent = { firstName: "NewFirstName", lastName: "NewLastName", email: "newemail@example.com" }; // Example data
      await axios.put(`http://localhost:8050/api/students/${studentId}`, updatedStudent, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess("Student updated successfully!");
      setError(""); // Clear any previous error
    } catch (error) {
      setError(error.response ? error.response.data.message : "An error occurred while updating student details.");
      setSuccess(""); // Clear any previous success message
    }
  };

  // Delete student
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

  return (
    <div>
      <Main /> {/* Include the main navigation */}
      <div className={styles.dashboard_content}>
        <h1>User Dashboard</h1>
        {error && <div className={styles.error_msg}>{error}</div>}
        {success && <div className={styles.success_msg}>{success}</div>}
        
        {student && (
          <div>
            <p>Welcome, {student.firstName} {student.lastName}!</p>
            <p>Email: {student.email}</p>
            <button onClick={handleUpdate} className={styles.update_btn}>Update Profile</button>
            <button onClick={handleDelete} className={styles.delete_btn}>Delete Profile</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
