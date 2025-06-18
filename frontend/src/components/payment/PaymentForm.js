import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../../context/AuthContext';
import { buyProperty, confirmPayment } from '../../services/paymentService';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Debug: Check if Stripe key is loaded
console.log('Stripe publishable key:', process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ? 'Loaded' : 'Missing');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

const PaymentFormContent = ({ property, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [paymentError, setPaymentError] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setPaymentError('');

    if (!stripe || !elements) {
      console.log('Stripe or elements not ready:', { stripe: !!stripe, elements: !!elements });
      setProcessing(false);
      return;
    }

    try {
      console.log('Starting payment process for property:', property._id);
      
      // 1. Create payment intent via backend
      const paymentIntentResponse = await buyProperty({
        propertyId: property._id
      });

      console.log('Payment intent response:', paymentIntentResponse);
      const { clientSecret } = paymentIntentResponse;

      if (!clientSecret) {
        throw new Error('No client secret received from server');
      }

      // 2. Confirm payment with Stripe
      console.log('Confirming payment with Stripe...');
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user?.name || 'Property Buyer',
            email: user?.email
          }
        }
      });

      if (stripeError) {
        console.error('Stripe error:', stripeError);
        setPaymentError(stripeError.message);
        setProcessing(false);
        return;
      }

      console.log('Payment intent result:', paymentIntent);

      if (paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded, confirming with backend...');
        // 3. Confirm payment with our backend
        await confirmPayment(paymentIntent.id, property._id);
        
        console.log('Payment confirmed successfully');
        // 4. Call success callback
        onSuccess(paymentIntent);
      } else {
        console.log('Payment not succeeded, status:', paymentIntent.status);
        setPaymentError('Payment was not completed successfully');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500, mx: 'auto' }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Purchase Property
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            {property.name}
          </Typography>
          
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            Total Amount: {formatPrice(property.totalValue)}
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {paymentError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {paymentError}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Payment Information
            </Typography>
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!stripe || processing}
              sx={{ minWidth: 120 }}
            >
              {processing ? (
                <CircularProgress size={24} />
              ) : (
                `Pay ${formatPrice(property.totalValue)}`
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

const PaymentForm = ({ property, onSuccess, onCancel }) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent 
        property={property} 
        onSuccess={onSuccess} 
        onCancel={onCancel} 
      />
    </Elements>
  );
};

export default PaymentForm; 