import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./styles.module.css";


const AdminTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8050/api/admin/teachers', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTeachers(response.data);
    } catch (error) {
      setError(error.response ? error.response.data.message : 'Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (teacherId, isApproved) => {
      try {
          const adminId = localStorage.getItem('adminId');
          const token = localStorage.getItem('token');
          await axios.put(`http://localhost:8050/api/admin/approve-teacher/${adminId}/${teacherId}`, {
              isApproved,
              remarks: isApproved === 'approved' ? 'All documents are valid.' : 'Please re-upload your documents.',
          }, {
              headers: {
                  Authorization: `Bearer ${token}`
              }
          });
          fetchTeachers(); // Met à jour la liste après approbation
      } catch (error) {
          console.error('Failed to update teacher status:', error);
      }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className={styles.error_msg}>{error}</p>; // Utilisez les styles ici

  return (
    <div className={styles.teacher_container}> {/* Utilisez les styles ici */}
      <h1 className={styles.h1}>Teacher List</h1> {/* Utilisez les styles ici */}
      <table className={styles.teacher_table}> {/* Utilisez les styles ici */}
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map(teacher => (
            <tr key={teacher._id}>
              <td>{teacher.name}</td>
              <td>{teacher.email}</td>
              <td>{teacher.isApproved}</td>
              <td>
                <button className={styles.approve_btn} onClick={() => handleApproval(teacher._id, 'approved')}>Approve</button> {/* Utilisez les styles ici */}
                <button className={styles.reject_btn} onClick={() => handleApproval(teacher._id, 'rejected')}>Reject</button> {/* Utilisez les styles ici */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTeachers;