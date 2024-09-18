import { Link } from "react-router-dom";
import styles from "./styles.module.css";

const Main = () => {
	const role = localStorage.getItem("role"); // Assuming role is stored in localStorage after login

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("role");
		window.location.reload();
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