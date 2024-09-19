import { useState } from "react";
import axios from "axios";
import { Link} from "react-router-dom";
import styles from "./styles.module.css";

const Login = () => {
	const [data, setData] = useState({ email: "", password: "" });
	const [role, setRole] = useState("user"); // Default role is user
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(""); // State for success message

	// Handle form data change
	const handleChange = ({ currentTarget: input }) => {
		setData({ ...data, [input.name]: input.value });
		setError(""); // Clear error on input change
		setSuccess(""); // Clear success on input change
	};

	// Handle role change (user, admin, teacher)
	const handleRoleChange = (e) => {
		setRole(e.target.value);
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			// Select the correct URL based on role
			const url = role === "admin"
				? "http://localhost:8050/api/admin/login"
				: role === "teacher"
				? "http://localhost:8050/api/teachers/login" // Teacher login endpoint
				: "http://localhost:8050/api/auth/login"; // User login endpoint

			const { data: res } = await axios.post(url, data);
			localStorage.setItem("token", res.accessToken); // Store token
			localStorage.setItem("role", role); // Store role

			setSuccess("Login successful!");

			// Redirect based on role
			window.location = role === "admin" ? "/admindashboard" : role === "teacher" ? "/teacherdashboard" : "/";
		} catch (error) {
			if (
				error.response &&
				error.response.status >= 400 &&
				error.response.status <= 500
			) {
				setError(error.response.data.message);
				setSuccess("");
			}
		}
	};

	return (
		<div className={styles.login_container}>
			<div className={styles.login_form_container}>
				<div className={styles.left}>
					<form className={styles.form_container} onSubmit={handleSubmit}>
						<h1>Login to Your Account</h1>
						<input
							type="email"
							placeholder="Email"
							name="email"
							onChange={handleChange}
							value={data.email}
							required
							className={styles.input}
						/>
						<input
							type="password"
							placeholder="Password"
							name="password"
							onChange={handleChange}
							value={data.password}
							required
							className={styles.input}
						/>

						{/* Role selection for User, Admin, or Teacher */}
						<div className={styles.role_container}>
    <label>
        <input
            type="radio"
            name="role"
            value="user"
            checked={role === "user"}
            onChange={handleRoleChange}
        />
        <span></span> User
    </label>
    <label>
        <input
            type="radio"
            name="role"
            value="admin"
            checked={role === "admin"}
            onChange={handleRoleChange}
        />
        <span></span> Admin
    </label>
    <label>
        <input
            type="radio"
            name="role"
            value="teacher"
            checked={role === "teacher"}
            onChange={handleRoleChange}
        />
        <span></span> Teacher
    </label>
</div>


						{/* Display success or error message */}
						{error && <div className={styles.error_msg}>{error}</div>}
						{success && <div className={styles.success_msg}>{success}</div>}

						<button type="submit" className={styles.green_btn}>
							Sign In
						</button>
					</form>
				</div>
				<div className={styles.right}>
					<h1>New Here?</h1>
					<Link to="/signup">
						<button type="button" className={styles.white_btn}>
							Sign Up
						</button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Login;