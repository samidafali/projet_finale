import { Route, Routes, Navigate } from "react-router-dom";

import Main from "./components/Main/Main.jsx";
import Signup from "./components/Signup/Signup.jsx";
import Login from "./components/Login/Login.jsx";
import EmailVerify from "./components/EmailVerify/EmailVerify.jsx";
import AdminDashboard from "./components/Admin/AdminDashboard.jsx";
import TeacherEmailVerify from "./components/EmailVerify/TeacherEmailVerify.jsx";
import TeacherDashboard from "./components/Teacher/TeacherDashboard.jsx";


function App() {
	const user = localStorage.getItem("token");

	return (
		<Routes>
			{user && <Route path="/" exact element={<Main />} />}
			<Route path="/signup" exact element={<Signup />} />
			<Route path="/login" exact element={<Login />} />
			<Route path="/" element={<Navigate replace to="/login" />} />
			<Route path="/users/:id/verify/:token" element={<EmailVerify />} />
			<Route path="/teachers/:id/verify/:token" element={<TeacherEmailVerify />} />
			<Route path="/admindashboard" element={<AdminDashboard />} />
			<Route path="/teacherdashboard" element={<TeacherDashboard />} />

					</Routes>
	);
}

export default App;