// Home.jsx
import React from 'react';
import styles from './home.module.css';
import Main from '../Main/Main';
import Footer from '../Footer/Footer';
import { Link } from 'react-router-dom';
import im1 from '../../images/im1.jpg';
import im2 from '../../images/im2.jpg';
import im3 from '../../images/im3.jpg';
import im4 from '../../images/im4.jpg';

const Home = () => {
    return (
        <div>
            <Main isHome={true} />
            <div className={styles.home_container}>
                <h1 className={styles.welcome_title}>Welcome to EduPlatform</h1>
                <p className={styles.welcome_subtitle}>Your one-stop destination for learning web development!</p>

               

                <div className={styles.course_highlights}>
                    <h2>Featured Courses</h2>
                    <div className={styles.course_card}>
                        <img src={im1} alt="Comprehensive Learning" className={styles.course_image} />
                        <h3>Comprehensive Learning</h3>
                        <p>Explore various topics in depth with our specialized courses.</p>
                    </div>
                    <div className={styles.course_card}>
                        <img src={im2} alt="Web Development" className={styles.course_image} />
                        <h3>Web Development</h3>
                        <p>Learn how to build beautiful websites with HTML, CSS, and JavaScript.</p>
                    </div>
                    <div className={styles.course_card}>
                        <img src={im3} alt="Data Science" className={styles.course_image} />
                        <h3>Data Science</h3>
                        <p>Master the skills needed to analyze and visualize data.</p>
                    </div>
                    <div className={styles.course_card}>
                        <img src={im4} alt="Graphic Design" className={styles.course_image} />
                        <h3>Graphic Design</h3>
                        <p>Create stunning visuals and graphics that stand out.</p>
                    </div>
                </div>

                <Link to="/studentdashboard" className={styles.arrow_link}>
                    <span className={styles.arrow}>➡️</span>
                    Go to Student Dashboard
                </Link>
            </div>
            <Footer />
        </div>
    );
};

export default Home;
