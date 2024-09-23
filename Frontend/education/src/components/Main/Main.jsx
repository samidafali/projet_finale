import { Link,useNavigate  } from "react-router-dom";
import styles from "./styles.module.css";
import axios from "axios";
const Main = () => {
    const role = localStorage.getItem("role"); // Récupérer le rôle depuis le localStorage après login
    const navigate = useNavigate(); // Initialiser useNavigate

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token"); // Récupérer le token du localStorage
            if (!token) {
                console.error("No token found, redirecting to login.");
                navigate("/login"); // Rediriger si le token est manquant
                return;
            }

            // Choisir l'URL de l'API en fonction du rôle
            let logoutUrl = "";
            if (role === "admin") {
                logoutUrl = "http://localhost:8050/api/admin/logout";
            } else if (role === "teacher") {
                logoutUrl = "http://localhost:8050/api/teachers/logout";
            } else {
                console.error("Invalid role, redirecting to login.");
                navigate("/login"); // Rediriger pour un rôle invalide
                return;
            }

            // API call pour déconnecter l'utilisateur (admin ou enseignant)
            await axios.post(logoutUrl, {}, {
                headers: {
                    Authorization: `Bearer ${token}` // Inclure le token dans les en-têtes
                }
            });

            // Supprimer le token et le rôle du localStorage
            localStorage.removeItem("token");
            localStorage.removeItem("role");

            // Rediriger vers la page de connexion
            navigate("/login");
        } catch (error) {
            console.error("Error logging out", error.response ? error.response.data : error.message);
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
                    {role === "teacher" && (
                        <>
                            <li>
                                <Link to="/teacher-dashboard">Dashboard</Link>
                            </li>
                            <li>
                                <Link to="/profile">Profile</Link>
                            </li>
                        </>
                    )}
                    {role !== "admin" && role !== "teacher" && (
                        <>
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