import React, { useState } from 'react';
import axios from 'axios';

const ChatWithCourse = ({ courseId }) => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post(`http://localhost:5000/chat/${courseId}`, {
        question,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      setResponse(res.data.response);
    } catch (error) {
      setError('Failed to get response from the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Course Chatbot</h2>
      <form onSubmit={handleQuestionSubmit}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question"
        />
        <button type="submit">Send</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {response && (
        <div>
          <h3>Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default ChatWithCourse;
