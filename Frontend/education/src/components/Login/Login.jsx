import { useState } from "react";
import axios from "axios";
import { Link} from "react-router-dom";
import styles from "./styles.module.css";

const Login = () => {
	const [data, setData] = useState({ email: "", password: "" });
	const [role, setRole] = useState("user");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(""); // Ajout d'un état pour les messages de succès

	// Gérer les changements dans les champs du formulaire
	const handleChange = ({ currentTarget: input }) => {
		setData({ ...data, [input.name]: input.value });
		setError(""); // Réinitialiser l'erreur en cas de modification
		setSuccess(""); // Réinitialiser le succès en cas de modification
	};

	// Gérer le changement du rôle (utilisateur ou admin)
	const handleRoleChange = (e) => {
		setRole(e.target.value);
	};

	// Gérer la soumission du formulaire
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const url = role === "admin"
				? "http://localhost:8050/api/admin/login"
				: "http://localhost:8050/api/auth/login";
			const { data: res } = await axios.post(url, data);
			localStorage.setItem("token", res.accessToken); // Store token
			localStorage.setItem("role", role); // Store role as 'admin' or 'user'
			setSuccess("Login successful!");
	
			// Redirect based on role
			window.location = role === "admin" ? "/admindashboard" : "/";
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

						{/* Sélection du rôle */}
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
									value="admin"
									checked={role === "admin"}
									onChange={handleRoleChange}
								/>
								Admin
							</label>
						</div>

						{/* Messages de succès ou d'erreur */}
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