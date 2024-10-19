import { Route, Routes, Navigate } from "react-router-dom";

import Main from "./components/Main/Main.jsx";
import Signup from "./components/Signup/Signup.jsx";
import Login from "./components/Login/Login.jsx";
import EmailVerify from "./components/EmailVerify/EmailVerify.jsx";
import AdminDashboard from "./components/Admin/AdminDashboard.jsx";
import TeacherEmailVerify from "./components/EmailVerify/TeacherEmailVerify.jsx";
import TeacherDashboard from "./components/Teacher/TeacherDashboard.jsx";
import TeacherCreateCourse from "./components/Teacher/TeacherCreateCourse .jsx"
import UpdateCourse from "./components/Teacher/UpdateCourse.jsx";
import AdminCreateCourse from "./components/Admin/AdminCreateCourse .jsx";
import AdminEnrollUser from "./components/Admin/AdminEnrollUser .jsx";
import AdminAddTeacherToCourse from "./components/Admin/AdminAddTeacherToCourse .jsx";
import AdminUpdateCourse from "./components/Admin/AdminUpdateCourse .jsx";
import StudentDashboard from "./components/Student/StudentDashboard.jsx";

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
			<Route path="/teacher-dashboard" element={<TeacherDashboard />} />
			<Route path="/studentdashboard" element={<StudentDashboard />} />
			<Route path="/teacher-create-course" element={<TeacherCreateCourse />} />
			<Route path="/teacher-update-course" element={<UpdateCourse/>} />


{/* Admin Routes */}
<Route path="/admin-dashboard" element={<AdminDashboard />} />
  <Route path="/admin-create-course" element={<AdminCreateCourse />} />
  <Route path="/admin-enroll-user" element={<AdminEnrollUser />} />
  <Route path="/admin-add-teacher-to-course" element={<AdminAddTeacherToCourse />} />
  <Route path="/admin-add-teacher" element={<AdminAddTeacherToCourse />} />
  <Route path="/admin-update-course" element={<AdminUpdateCourse />} />


  
					</Routes>
	);
}

export default App;