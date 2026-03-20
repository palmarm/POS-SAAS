import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCardIcon, ShieldCheckIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';

interface PlanDetails {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
}

export const PaymentScreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<PlanDetails | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile'>('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    mobileNumber: '',
    mobileProvider: 'mpesa'
  });
  const { showToast } = useToast();

  useEffect(() => {
    const planId = searchParams.get('plan');
    const cycle = searchParams.get('cycle') as 'monthly' | 'yearly';
    
    // Fetch plan details
    const plans: Record<string, PlanDetails> = {
      basic: { id: 'basic', name: 'Basic Plan', price: cycle === 'monthly' ? 29 : 290, billingCycle: cycle },
      pro: { id: 'pro', name: 'Pro Plan', price: cycle === 'monthly' ? 79 : 790, billingCycle: cycle },
      enterprise: { id: 'enterprise', name: 'Enterprise Plan', price: cycle === 'monthly' ? 199 : 1990, billingCycle: cycle }
    };
    
    if (planId && plans[planId]) {
      setPlan(plans[planId]);
    }
  }, [searchParams]);

  const handlePayment = async () => {
    if (!plan) return;
    
    // Validation
    if (paymentMethod === 'card') {
      if (!formData.cardNumber || !formData.cardName || !formData.expiry || !formData.cvv) {
        showToast('Please fill in all card details', 'error');
        return;
      }
    } else {
      if (!formData.mobileNumber) {
        showToast('Please enter mobile number', 'error');
        return;
      }
    }
    
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showToast('Payment successful! Your subscription is now active.', 'success');
      
      // Redirect to subscription dashboard
      setTimeout(() => {
        window.location.href = '/subscription/dashboard';
      }, 1500);
    } catch (error) {
      showToast('Payment failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="pt-16 pl-[240px] bg-background min-h-screen flex items-center justify-center">
        <Card>
          <p className="text-secondary-600">Invalid plan selection. Please choose a plan first.</p>
          <Button className="mt-4" onClick={() => window.location.href = '/pricing'}>
            View Plans
          </Button>
        </Card>
      </div>
    );
  }

  const tax = plan.price * 0.1;
  const total = plan.price + tax;

  return (
    <div className="pt-16 pl-[240px] bg-background min-h-screen">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-secondary-900">Complete Your Purchase</h1>
          <p className="text-secondary-500 mt-1">Secure payment processing</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Payment Form */}
          <div className="col-span-7">
            <Card>
              <h2 className="text-lg font-bold text-secondary-900 mb-4">Payment Details</h2>
              
              {/* Payment Method Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 py-3 rounded-lg border-2 font-medium transition-all ${
                    paymentMethod === 'card'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-secondary-200 text-secondary-600 hover:border-secondary-300'
                  }`}
                >
                  💳 Credit/Debit Card
                </button>
                <button
                  onClick={() => setPaymentMethod('mobile')}
                  className={`flex-1 py-3 rounded-lg border-2 font-medium transition-all ${
                    paymentMethod === 'mobile'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-secondary-200 text-secondary-600 hover:border-secondary-300'
                  }`}
                >
                  📱 Mobile Money
                </button>
              </div>

              {/* Card Payment Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <Input
                    label="Card Number"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    icon={<CreditCardIcon className="w-5 h-5" />}
                  />
                  <Input
                    label="Name on Card"
                    placeholder="John Doe"
                    value={formData.cardName}
                    onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiry Date"
                      placeholder="MM/YY"
                      value={formData.expiry}
                      onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                    />
                    <Input
                      label="CVV"
                      placeholder="123"
                      type="password"
                      value={formData.cvv}
                      onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Mobile Money Form */}
              {paymentMethod === 'mobile' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">Provider</label>
                    <select
                      className="w-full rounded-lg border border-secondary-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.mobileProvider}
                      onChange={(e) => setFormData({ ...formData, mobileProvider: e.target.value })}
                    >
                      <option value="mpesa">M-Pesa</option>
                      <option value="airtel">Airtel Money</option>
                      <option value="orange">Orange Money</option>
                    </select>
                  </div>
                  <Input
                    label="Mobile Number"
                    placeholder="+254 712 345 678"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  />
                  <div className="bg-secondary-50 p-3 rounded-lg">
                    <p className="text-sm text-secondary-600">
                      You will receive a prompt on your phone to complete the payment.
                    </p>
                  </div>
                </div>
              )}

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-secondary-200">
                <div className="flex items-center gap-1 text-xs text-secondary-500">
                  <LockClosedIcon className="w-3 h-3" />
                  Secure Payment
                </div>
                <div className="flex items-center gap-1 text-xs text-secondary-500">
                  <ShieldCheckIcon className="w-3 h-3" />
                  SSL Encrypted
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="col-span-5">
            <Card>
              <h2 className="text-lg font-bold text-secondary-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-secondary-600">{plan.name}</span>
                  <span className="font-medium">${plan.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Tax (10%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-secondary-200 pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-secondary-500 mt-1">
                    Billed {plan.billingCycle === 'monthly' ? 'monthly' : 'annually'}
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                fullWidth
                size="lg"
                className="mt-6"
                onClick={handlePayment}
                loading={loading}
              >
                Pay ${total.toFixed(2)}
              </Button>

              <p className="text-center text-xs text-secondary-500 mt-4">
                By completing this payment, you agree to our Terms of Service and Privacy Policy.
                You can cancel your subscription at any time.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};