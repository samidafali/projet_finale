import { useState, useEffect } from 'react';
import axios from 'axios';
import Main from '../Main/Main';
import Footer from '../Footer/Footer';

const UpdateProfile = () => {
  const [student, setStudent] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');
  const studentId = localStorage.getItem('studentId');

  useEffect(() => {
    // Fetch current student details on component mount
    const fetchStudentDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8050/api/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudent(response.data.data);
      } catch (error) {
        console.error('Error fetching student details:', error);
      }
    };
    fetchStudentDetails();
  }, [studentId, token]);

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:8050/api/students/${studentId}`,
        { firstName: student.firstName, lastName: student.lastName }, // Only updating first and last name
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessage(response.data.message);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile');
    }
  };

  // Inline CSS styles
  const styles = {
    container: {
      padding: '20px',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    formGroup: {
      marginBottom: '15px',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold',
    },
    input: {
      width: '100%',
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      fontSize: '16px',
    },
    button: {
      backgroundColor: '#4CAF50',
      color: 'white',
      padding: '10px 15px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '16px',
      marginTop: '10px',
    },
    buttonHover: {
      backgroundColor: '#45a049',
    },
    message: {
      color: 'green',
      marginBottom: '15px',
    },
  };

  return (
    <div>
      <Main />
      <div style={styles.container}>
        <h2>Update Profile</h2>
        {message && <p style={styles.message}>{message}</p>}
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>First Name:</label>
            <input
              type="text"
              name="firstName"
              value={student.firstName}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={student.lastName}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email:</label>
            <input
              type="email"
              name="email"
              value={student.email}
              disabled
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.button}>
            Update Profile
          </button>
        </form>
      </div>
      <br />
      <br />
      <br />
      <br />
<Footer/>
    </div>
  );
};

export default UpdateProfile;
