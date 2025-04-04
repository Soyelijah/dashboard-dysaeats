'use client';

import React, { useState, useEffect } from 'react';
import { 
  CardElement, 
  Elements, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '../common/button';
import { Input } from '../common/input';
import { Label } from '../common/label';
import { Separator } from '../common/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../common/card';
import { useToast } from '@/hooks/useToast';
import { useDictionary } from '@/hooks/useDictionary';
import { getStripePublishableKey, createPaymentIntent, confirmPaymentIntent } from '@/services/paymentService';

interface PaymentFormProps {
  amount: number;
  currency?: string;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
}

let stripePromise: Promise<any> | null = null;

const getStripe = async () => {
  if (!stripePromise) {
    const key = await getStripePublishableKey();
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

// The actual form component
const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency = 'usd',
  onPaymentSuccess,
  onPaymentError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const dict = useDictionary();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    const createIntent = async () => {
      try {
        const { clientSecret } = await createPaymentIntent(amount, currency);
        setClientSecret(clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast({
          title: dict.payments.error,
          description: dict.payments.errorCreatingIntent,
          variant: 'destructive',
        });
        onPaymentError('Failed to initiate payment process');
      }
    };

    createIntent();
  }, [amount, currency, toast, dict.payments.error, dict.payments.errorCreatingIntent, onPaymentError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName,
          },
        },
      });

      if (error) {
        toast({
          title: dict.payments.paymentFailed,
          description: error.message,
          variant: 'destructive',
        });
        onPaymentError(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        toast({
          title: dict.payments.paymentSuccessful,
          description: dict.payments.paymentProcessed,
        });
        onPaymentSuccess(paymentIntent.id);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: dict.payments.error,
        description: dict.payments.generalError,
        variant: 'destructive',
      });
      onPaymentError('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#EF4444',
        iconColor: '#EF4444',
      },
    },
    hidePostalCode: true,
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="cardholderName">{dict.payments.cardholderName}</Label>
          <Input
            id="cardholderName"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder={dict.payments.enterName}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="card-element">{dict.payments.cardDetails}</Label>
          <div className="rounded-md border border-input p-3">
            <CardElement id="card-element" options={cardElementOptions} />
          </div>
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!stripe || !elements || isProcessing}
            loading={isProcessing}
          >
            {isProcessing 
              ? dict.payments.processing 
              : `${dict.payments.pay} ${new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: currency.toUpperCase(),
                }).format(amount / 100)}`
            }
          </Button>
        </div>
      </div>
    </form>
  );
};

// The wrapper component that loads Stripe
const StripePaymentForm: React.FC<PaymentFormProps> = (props) => {
  const [stripeInstance, setStripeInstance] = useState<any>(null);
  const dict = useDictionary();

  useEffect(() => {
    const initializeStripe = async () => {
      const stripe = await getStripe();
      setStripeInstance(stripe);
    };
    
    initializeStripe();
  }, []);

  if (!stripeInstance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dict.payments.loading}</CardTitle>
          <CardDescription>{dict.payments.preparingPayment}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.payments.securePayment}</CardTitle>
        <CardDescription>{dict.payments.paymentDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripeInstance}>
          <PaymentForm {...props} />
        </Elements>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <Separator className="my-2" />
        <div className="text-xs text-muted-foreground">
          {dict.payments.securityNote}
        </div>
      </CardFooter>
    </Card>
  );
};

export default StripePaymentForm;