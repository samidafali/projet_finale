import React from "react";
import Main from "../Main/Main"; // Assuming Main is your navbar component
import styles from "./styles.module.css";

const TeacherDashboard = () => {
	return (
	  <div className={styles.dashboard_container}>
		<Main /> {/* Include the navbar */}
		<div className={styles.dashboard_content}>
		  <h1>Teacher Dashboard</h1>
		  <p>Welcome to the Admin Dashboard. Manage your data from here.</p>
		</div>
	  </div>
	);
  };
  
  export default TeacherDashboard;