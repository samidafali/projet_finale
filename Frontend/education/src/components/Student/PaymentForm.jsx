import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import './PaymentForm.css'; // Import the CSS

const PaymentForm = ({ courseId, token, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements) {
      setErrorMessage("Stripe.js hasn't loaded yet.");
      return;
    }

    const cardElement = elements.getElement(CardElement);

    try {
      const response = await axios.post(
        `http://localhost:8050/api/courses/${courseId}/create-checkout-session`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { clientSecret } = response.data;

      const { paymentIntent, error } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (error) {
        setErrorMessage(error.message);
        setIsProcessing(false);
      } else if (paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent.id); // Call the success callback with the payment intent ID
      }
    } catch (error) {
      setErrorMessage("Failed to process payment. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-form-container">
      <h2>Complete Your Payment</h2>
      <form onSubmit={handleSubmit}>
        <CardElement className="StripeElement" />
        {errorMessage && <div className="error">{errorMessage}</div>}
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          {isProcessing ? "Processing..." : "Pay"}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;
