import { Link } from "react-router-dom";
import styles from "./styles.module.css";
import axios from "axios";
const Main = () => {
	const role = localStorage.getItem("role"); // Assuming role is stored in localStorage after login

	const handleLogout = async () => {
		try {
			// API call to logout admin
			await axios.post("http://localhost:8050/api/admin/logout");
			// Remove token and role from localStorage
			localStorage.removeItem("token");
			localStorage.removeItem("role");
			// Reload the page or redirect to login
			window.location.href = "/login";
		
		} catch (error) {
			console.error("Error logging out", error);
		}
	};

	return (
		<div className={styles.main_container}>
			<nav className={styles.navbar}>
				<div className={styles.logo}>
					<h1>Fakebook</h1>
				</div>
				<ul className={styles.nav_links}>
					<li>
						<Link to="/">Home</Link>
					</li>
					{role === "admin" && (
						<>
							<li>
								<Link to="/admin-dashboard">Dashboard</Link>
							</li>
							<li>
								<Link to="/manage-users">Manage Users</Link>
							</li>
						</>
					)}
					{role !== "admin" && (
						<>
							<li>
								<Link to="/profile">Profile</Link>
							</li>
							<li>
								<Link to="/about">About</Link>
							</li>
							<li>
								<Link to="/contact">Contact</Link>
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