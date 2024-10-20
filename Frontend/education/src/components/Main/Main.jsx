import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.css";
import axios from "axios";

const Main = () => {
    const role = localStorage.getItem("role"); // Get role from localStorage after login
    const navigate = useNavigate(); // Initialize useNavigate

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token"); // Retrieve token from localStorage
            if (!token) {
                console.error("No token found, redirecting to login.");
                navigate("/login"); // Redirect if token is missing
                return;
            }

            // Determine the API URL based on the role
            let logoutUrl = "";
            if (role === "admin") {
                logoutUrl = "http://localhost:8050/api/admin/logout";
            } else if (role === "teacher") {
                logoutUrl = "http://localhost:8050/api/teachers/logout";
            } else {
                console.error("Invalid role, redirecting to login.");
                navigate("/login"); // Redirect for an invalid role
                return;
            }

            // API call to log out the user (admin or teacher)
            await axios.post(logoutUrl, {}, {
                headers: {
                    Authorization: `Bearer ${token}` // Include token in headers
                }
            });

            // Remove token and role from localStorage
            localStorage.removeItem("token");
            localStorage.removeItem("role");

            // Redirect to the login page
            navigate("/login");
        } catch (error) {
            console.error("Error logging out", error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className={styles.main_container}>
            <nav className={styles.navbar}>
                <div className={styles.logo}>
                    <h1>EduPlatform</h1>
                </div>
                <ul className={styles.nav_links}>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    {role === "admin" && (
                        <>
                            <li>
                                <Link to="/admin-dashboard">Admin Dashboard</Link>
                            </li>
                            <li>
                                <Link to="/admin-update-course">Update Courses</Link>
                            </li>
                            <li>
                                <Link to="/admin-create-course">Create Course</Link>
                            </li>
                            <li>
                                <Link to="/admin-enroll-user">Enroll User</Link>
                            </li>
                            <li>
                                <Link to="/admin-add-teacher">Add Teacher</Link>
                            </li>
                        </>
                    )}
                    {role === "teacher" && (
                        <>
                            <li>
                                <Link to="/teacher-dashboard">Teacher Dashboard</Link>
                            </li>
                            <li>
                                <Link to="/teacher-update-course">Update Courses</Link>
                            </li>
                            <li>
                                <Link to="/teacher-create-course">Create Course</Link>
                            </li>
                        </>
                    )}
                    {role !== "admin" && role !== "teacher" && (
                        <>
                            <li>
                                <Link to="/my-courses">My Courses</Link> {/* Add "My Courses" link */}
                            </li>
                            <li>
                                <Link to="/studentdashboard">Student dashboard</Link>
                            </li>
                            <li>
                                <Link to="/update">update</Link>
                            </li>
                        </>
                    )}
                </ul>
                <button className={styles.logout_btn} onClick={handleLogout}>
                    Logout
                </button>
            </nav>
        </div>
    );
};

export default Main;
