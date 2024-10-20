import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom';

const PaymentPage = () => {
  const { courseId } = useParams(); // Get courseId from the URL
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // State for success message
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token"); // Get token from localStorage

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
  
    if (!stripe || !elements) {
      setErrorMessage("Stripe.js hasn't loaded yet.");
      return;
    }
  
    const cardElement = elements.getElement(CardElement);
  
    try {
      console.log("Sending request to backend to create checkout session...");
      const response = await axios.post(
        `http://localhost:8050/api/courses/${courseId}/create-checkout-session`, // Ensure this matches your backend
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Ensure the token is sent
          },
        }
      );
  
      console.log("Response from backend:", response.data);
  
      const { clientSecret } = response.data;
  
      // Confirm the payment using Stripe's API
      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });
  
      if (error) {
        console.log("Payment error:", error.message);
        setErrorMessage(error.message);
        setIsProcessing(false);
      } else if (paymentIntent.status === 'succeeded') {
        console.log("Payment succeeded:", paymentIntent.id);
        setSuccessMessage("Payment successful! Redirecting to dashboard...");
        
        // Delay redirection to show the success message
        setTimeout(() => {
          navigate(`/studentdashboard`); // Redirect after 3 seconds
        }, 3000);
      }
    } catch (error) {
      console.log("Error in payment process:", error.response ? error.response.data : error.message);
      setErrorMessage('Failed to process payment. Please try again.');
      setIsProcessing(false);
    }
  };
  

  return (
    <div className="payment-page-container">
      <h1>Complete your Payment</h1>
      <form onSubmit={handleSubmit}>
        <CardElement className="StripeElement" />
        {errorMessage && <div className="error">{errorMessage}</div>}
        {successMessage && <div className="success">{successMessage}</div>} {/* Display success message */}
        <button type="submit" disabled={!stripe || isProcessing} className="bg-blue-500 text-white py-2 px-4 rounded">
          {isProcessing ? 'Processing...' : 'Pay'}
        </button>
      </form>
    </div>
  );
};

export default PaymentPage;
