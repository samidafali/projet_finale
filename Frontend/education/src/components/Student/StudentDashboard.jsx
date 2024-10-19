import { useEffect, useState } from 'react';
import Main from '../Main/Main'; // Adjust the import path as necessary
import axios from 'axios';
import styles from './styles.module.css'; // Import your CSS module

const StudentDashboard = () => {
    const [student, setStudent] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isEditing, setIsEditing] = useState(false); // New state to toggle edit mode

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

    return (
        <div>
            <Main /> {/* Include the main navigation */}
            <div className={styles.dashboard_content}>
                <h1>User Dashboard</h1>
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

                {isEditing && (
                    <div>
                        {/* Update form */}
                        <form onSubmit={handleUpdate} className={styles.update_form}>
                            <div className={styles.form_group}>
                                <label>First Name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className={styles.input}
                                    required
                                />
                            </div>
                            <div className={styles.form_group}>
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className={styles.input}
                                    required
                                />
                            </div>
                            <div className={styles.form_group}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    className={styles.input}
                                    readOnly // Make email read-only
                                />
                            </div>

                            <button type="submit" className={styles.green_btn}>
                                Save Changes
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
