import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './styles.module.css';

const Quiz = ({ courseId }) => {
    const [questions, setQuestions] = useState([]); // State to store quiz questions
    const [error, setError] = useState(''); // State for error messages
    const [selectedOptions, setSelectedOptions] = useState({}); // State to track selected options

    // Fetch quiz questions when the component mounts or courseId changes
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await axios.get(`http://localhost:5002/quiz/${courseId}`);
                setQuestions(response.data.questions);
                setError(''); // Clear any previous error messages
            } catch (err) {
                setError('Failed to fetch quiz questions.');
                console.error(err);
            }
        };

        fetchQuiz();
    }, [courseId]);

    const handleOptionChange = (questionIndex, option) => {
        // Update the selected option for the question
        setSelectedOptions(prevState => ({
            ...prevState,
            [questionIndex]: option, // Save the selected option for this question
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent the default form submission
        // Logic to handle quiz submission
        console.log('Submitted answers:', selectedOptions);
        // Here you can send the selected options to your backend or perform any other action
    };

    return (
        <div className={styles.quiz_container}>
            <h2>Quiz for Course ID: {courseId}</h2>
            {error && <div className={styles.error_msg}>{error}</div>}
            <form onSubmit={handleSubmit}>
                {questions.map((q, index) => (
                    <div key={index}>
                        <p>{q.question}</p>
                        {q.options.map((option, i) => (
                            <div key={i}>
                                <input
                                    type="radio"
                                    id={`question-${index}-option-${i}`}
                                    name={`question-${index}`}
                                    value={option}
                                    onChange={() => handleOptionChange(index, option)}
                                    checked={selectedOptions[index] === option} // Check if this option is selected
                                />
                                <label htmlFor={`question-${index}-option-${i}`}>{option}</label>
                            </div>
                        ))}
                    </div>
                ))}
                <button type="submit">Submit Answers</button>
            </form>
        </div>
    );
};

export default Quiz;
