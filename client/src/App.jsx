import  { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";

const stripePromise = loadStripe("pk_test_51PqrtDDjTBY7dhCvXuGNMVqyGbeb52GfUjyRWHGgnOOB4jreDxeZ2tjICv5yuo8SlAAfgqe3va52VDUQx9eqsi7L00VHucnBFL");

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/create-payment-intent", {
        amount: amount * 100, 
      });

      const clientSecret = response.data.clientSecret;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setStatus(`Payment failed: ${result.error.message}`);
      } else {
        setStatus("Payment successful!");
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const showForm = () => {
    setIsFormVisible(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm p-8 bg-white shadow-lg rounded-lg">
        {!isFormVisible ? (
          <button
            onClick={showForm}
            className="w-full bg-blue-500 text-white py-3 rounded-md text-lg font-semibold hover:bg-blue-600 transition duration-300"
          >
            Checkout
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Payment Details</h2>
            <div className="mb-4">
              <label className="block text-gray-600 mb-2">Amount (USD)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                placeholder="Enter amount"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 mb-2">Card Details</label>
              <div className="p-3 border border-gray-300 rounded-md">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#32325d",
                        "::placeholder": {
                          color: "#a0aec0",
                        },
                      },
                      invalid: {
                        color: "#fa755a",
                        iconColor: "#fa755a",
                      },
                    },
                  }}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!stripe}
              className="w-full bg-green-500 text-white py-3 rounded-md text-lg font-semibold hover:bg-green-600 transition duration-300"
            >
              Pay ${amount}
            </button>
            {status && <p className="mt-4 text-center text-red-500">{status}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

const App = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default App;
