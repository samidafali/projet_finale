// Footer.js
import React from 'react';
import styles from './footer.module.css'; // Create a separate CSS module for footer styles

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <p>&copy; {new Date().getFullYear()} EduPlatform. All rights reserved.</p>
                <p>
                    <a href="/privacy-policy" className={styles.footerLink}>Privacy Policy</a> | 
                    <a href="/terms-of-service" className={styles.footerLink}> Terms of Service</a>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
