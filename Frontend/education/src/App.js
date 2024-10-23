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
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentPage from "./components/Student/PaymentPage.jsx";
import MyCourses from "./components/Student/MyCourses.jsx";
import UpdateProfile from "./components/Student/UpdateProfile.jsx";
import Recommendation from "./components/Student/Recommendation.jsx";
import Home from "./components/Home/Home.jsx"; // Import Home component
function App() {
	const user = localStorage.getItem("token");
	const stripePromise = loadStripe('pk_test_51PgA1t2MMlJMgqqrMy2H0fyasxX68p6sYn7zJvFGBFB7xsrxBzsIgJDZg53NnlA14H59IHe5Z9eKnfXGaDAFtnS600Jd4dovCS');
	return (
		<Elements stripe={stripePromise}>
		<Routes>
		<Route path="/" element={<Home />} />
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
			<Route path="/payment/:courseId" element={<PaymentPage />} /> 
			<Route path="/my-courses" element={<MyCourses />} />{/* Add the payment page route */}
			<Route path="/update" element={<UpdateProfile />} />{/* Add the payment page route */}

{/* Admin Routes */}
<Route path="/admin-dashboard" element={<AdminDashboard />} />
  <Route path="/admin-create-course" element={<AdminCreateCourse />} />
  <Route path="/admin-enroll-user" element={<AdminEnrollUser />} />
  <Route path="/admin-add-teacher-to-course" element={<AdminAddTeacherToCourse />} />
  <Route path="/admin-add-teacher" element={<AdminAddTeacherToCourse />} />
  <Route path="/admin-update-course" element={<AdminUpdateCourse />} />
  <Route path="/recommendation" element={<Recommendation />} /> 

  
					</Routes>
					</Elements>
	);
}

export default App;