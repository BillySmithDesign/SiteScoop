import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import styles from '../styles/Payment.module.css';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: clientSecret } = await axios.post('/api/create-payment-intent');

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <CardElement className={styles.cardElement} />
      <button type="submit" disabled={!stripe || loading} className={styles.button}>
        {loading ? 'Processing...' : 'Pay $5'}
      </button>
      {error && <div className={styles.error}>{error}</div>}
    </form>
  );
};

const PaymentPage = () => {
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>SiteScoop Payment</h1>
      {!paymentSuccess ? (
        <Elements stripe={stripePromise}>
          <CheckoutForm onSuccess={() => setPaymentSuccess(true)} />
        </Elements>
      ) : (
        <p className={styles.success}>Payment successful! You can now <a href="/download">download</a> your site.</p>
      )}
    </div>
  );
};

export default PaymentPage;
