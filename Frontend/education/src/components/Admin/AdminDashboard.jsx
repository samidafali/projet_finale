import React from "react";
import Main from "../Main/Main"; // Assuming Main is your navbar component
import styles from "./styles.module.css";
import AdminTeachers from "./AdminTeachers";
import AdminCourses from "./AdminCourses";

const AdminDashboard = () => {
	return (
	  <div className={styles.dashboard_container}>
		<Main /> {/* Include the navbar */}
		<div className={styles.dashboard_content}>
		  <h1>Admin Dashboard</h1>
		  <p>Welcome to the Admin Dashboard. Manage your data from here.</p>
		  <AdminTeachers />
		  
<AdminCourses/>

		</div>
	  </div>
	);
  };
  
  export default AdminDashboard;