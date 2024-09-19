import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";

const Signup = () => {
	const [data, setData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
	});
	const [role, setRole] = useState("user"); // Added role selection
	const [error, setError] = useState("");
	const [msg, setMsg] = useState("");

	// Handle input change
	const handleChange = ({ currentTarget: input }) => {
		setData({ ...data, [input.name]: input.value });
		setError(""); // Clear error
		setMsg(""); // Clear message
	};

	// Handle role change (user or teacher)
	const handleRoleChange = (e) => {
		setRole(e.target.value);
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const url = role === "teacher"
				? "http://localhost:8050/api/teachers/register" // Teacher registration endpoint
				: "http://localhost:8050/api/users"; // User registration endpoint

			const { data: res } = await axios.post(url, data);
			setMsg(res.message); // Display success message
			setError(""); // Clear error
		} catch (error) {
			if (error.response && error.response.status >= 400 && error.response.status <= 500) {
				setError(error.response.data.message); // Display error message
				setMsg(""); // Clear success message
			}
		}
	};

	return (
		<div className={styles.signup_container}>
			<div className={styles.signup_form_container}>
				<div className={styles.left}>
					<h1>Welcome Back</h1>
					<Link to="/login">
						<button type="button" className={styles.white_btn}>
							Sign In
						</button>
					</Link>
				</div>
				<div className={styles.right}>
					<form className={styles.form_container} onSubmit={handleSubmit}>
						<h1>Create Account</h1>
						<input
							type="text"
							placeholder="First Name"
							name="firstName"
							onChange={handleChange}
							value={data.firstName}
							required
							className={styles.input}
						/>
						<input
							type="text"
							placeholder="Last Name"
							name="lastName"
							onChange={handleChange}
							value={data.lastName}
							required
							className={styles.input}
						/>
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

						{/* Role Selection: User or Teacher */}
						<div className={styles.role_container}>
							<label>
								<input
									type="radio"
									name="role"
									value="user"
									checked={role === "user"}
									onChange={handleRoleChange}
								/>
								User
							</label>
							<label>
								<input
									type="radio"
									name="role"
									value="teacher"
									checked={role === "teacher"}
									onChange={handleRoleChange}
								/>
								Teacher
							</label>
						</div>

						{/* Display success or error message */}
						{error && <div className={styles.error_msg}>{error}</div>}
						{msg && <div className={styles.success_msg}>{msg}</div>}

						<button type="submit" className={styles.green_btn}>
							Sign Up
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Signup;