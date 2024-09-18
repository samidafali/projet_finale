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
	const [error, setError] = useState("");
	const [msg, setMsg] = useState("");

	// Gérer les changements dans les champs du formulaire
	const handleChange = ({ currentTarget: input }) => {
		setData({ ...data, [input.name]: input.value });
		// Effacer les messages d'erreur ou de succès si l'utilisateur modifie les champs
		setError("");
		setMsg("");
	};

	// Gérer la soumission du formulaire
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const url = "http://localhost:8050/api/users";
			const { data: res } = await axios.post(url, data);
			setMsg(res.message); // Affiche le message de succès
			setError(""); // Efface tout message d'erreur
		} catch (error) {
			// Vérifier les erreurs de réponse
			if (
				error.response &&
				error.response.status >= 400 &&
				error.response.status <= 500
			) {
				setError(error.response.data.message); // Affiche le message d'erreur
				setMsg(""); // Efface tout message de succès
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