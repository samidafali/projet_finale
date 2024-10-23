import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './styles.module.css'; // Assurez-vous d'avoir un fichier CSS pour les styles
import Main from '../Main/Main'; // Inclure la barre de navigation
import Footer from '../Footer/Footer';

const Recommendation = () => {
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [recommendedCourse, setRecommendedCourse] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null); // Pour gérer les messages de succès
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:5000/categories');
                setCategories(response.data.categories); // Assurez-vous que ce sont des catégories uniques
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/recommend', {
                category,
                difficulty,
            });
            setRecommendedCourse(response.data.recommended_course);
            setError(null); // Réinitialiser les erreurs précédentes
            setSuccess(null); // Réinitialiser les messages de succès
        } catch (error) {
            console.error("Error fetching recommendations:", error);
            setRecommendedCourse(null);
            setError("Aucun cours suggerer.");
            setSuccess(null);
        }
    };

    const handleEnroll = async (courseId, isFree) => {
        try {
            if (isFree) {
                // Inscription pour les cours gratuits
                await axios.post(`http://localhost:8050/api/courses/${courseId}/enroll`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSuccess("Successfully enrolled in course!"); // Message de succès
                setError(null); // Réinitialiser les erreurs précédentes
            } else {
                // Rediriger vers la page de paiement pour les cours payants
                window.location.href = `/payment/${courseId}`; // Utiliser window.location.href pour rediriger
            }
        } catch (error) {
            console.error("Failed to enroll in the course.", error);
            setError("Failed to enroll in the course."); // Message d'erreur
            setSuccess(null);
        }
    };

    return (
        <div className={styles.recommendation_container}>
            <Main /> {/* Inclure la barre de navigation */}
            <h2>Get Course Recommendations</h2>
            <form onSubmit={handleSubmit}>
                <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                >
                    <option value="">Select Category</option>
                    {categories.map((cat, index) => (
                        <option key={index} value={cat}>{cat}</option>
                    ))}
                </select>
        
                <input
                    type="text"
                    placeholder="Difficulty (easy, medium, hard)"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    required
                />
                <button type="submit">Get Recommendation</button>
            </form>
        
            {error && <div className={styles.error_msg}>{error}</div>}
            {success && <div className={styles.success_msg}>{success}</div>}
        
            <div className={styles.courses_list}> {/* Conteneur pour les cartes */}
                {recommendedCourse && (
                    <div className={styles.course_card}>
                        <img src={recommendedCourse.imageUrl} alt={recommendedCourse.coursename} className={styles.course_image} />
                        <h3>{recommendedCourse.coursename}</h3>
                        <p>{recommendedCourse.description}</p>
                        <p>Difficulty: {recommendedCourse.difficulty}</p>
                        <p>Category: {recommendedCourse.category}</p>
        
                        {!recommendedCourse.isFree && <p>Price: ${recommendedCourse.price}</p>}
        
                        <button onClick={() => handleEnroll(recommendedCourse._id, recommendedCourse.isFree)} className={styles.enroll_btn}>
                            {recommendedCourse.isFree ? "Enroll in Course" : "Pay to Enroll"}
                        </button>
                    </div>
                )}
            </div>
            <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />  <br />
      <br />
      <br />
<Footer/>
        </div>
    );
    
};

export default Recommendation;
