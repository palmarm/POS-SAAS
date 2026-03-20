import React, { useState } from 'react';
import { CheckIcon, StarIcon } from '@heroicons/react/24/solid';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../hooks/useToast';

interface Plan {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  limitations: {
    users: number;
    branches: number;
    products: number;
    monthlySales: number;
  };
  recommended?: boolean;
  color: string;
}

export const PricingPlans: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { showToast } = useToast();

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: {
        monthly: 29,
        yearly: 290 // 2 months free
      },
      features: [
        'Up to 500 products',
        'Single store/branch',
        'Basic sales reports',
        'Email support',
        'Customer management',
        'Sales history (30 days)'
      ],
      limitations: {
        users: 1,
        branches: 1,
        products: 500,
        monthlySales: 1000
      },
      color: 'from-gray-600 to-gray-700'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: {
        monthly: 79,
        yearly: 790 // 2 months free
      },
      features: [
        'Unlimited products',
        'Up to 5 stores/branches',
        'Advanced analytics & reports',
        'Priority support',
        'Customer credit tracking',
        'Sales history (1 year)',
        'Inventory management',
        'Export reports (PDF/CSV)',
        'API access'
      ],
      limitations: {
        users: 10,
        branches: 5,
        products: -1, // Unlimited
        monthlySales: 5000
      },
      recommended: true,
      color: 'from-primary-600 to-primary-700'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: {
        monthly: 199,
        yearly: 1990 // 2 months free
      },
      features: [
        'Everything in Pro',
        'Unlimited stores/branches',
        'Unlimited users',
        '24/7 dedicated support',
        'Custom integrations',
        'White-label branding',
        'Advanced security features',
        'SLA guarantee',
        'On-premise option available'
      ],
      limitations: {
        users: -1, // Unlimited
        branches: -1, // Unlimited
        products: -1, // Unlimited
        monthlySales: -1 // Unlimited
      },
      color: 'from-purple-600 to-purple-700'
    }
  ];

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    showToast('Redirecting to checkout...', 'info');
    // Navigate to payment screen
    setTimeout(() => {
      window.location.href = `/subscription/checkout?plan=${planId}&cycle=${billingCycle}`;
    }, 1500);
  };

  const getPrice = (plan: Plan) => {
    const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
    return price === -1 ? 'Custom' : `$${price}`;
  };

  const getBillingPeriod = () => {
    return billingCycle === 'monthly' ? 'per month' : 'per year';
  };

  const getSavings = (plan: Plan) => {
    if (billingCycle === 'yearly') {
      const monthlyTotal = plan.price.monthly * 12;
      const yearlyPrice = plan.price.yearly;
      const savings = monthlyTotal - yearlyPrice;
      if (savings > 0) {
        return `Save $${savings}/year`;
      }
    }
    return null;
  };

  return (
    <div className="pt-16 pl-[240px] bg-background min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-secondary-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-secondary-600 max-w-2xl mx-auto">
            Select the perfect plan for your business. All plans include full POS functionality,
            with additional features as you scale.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 mt-8 p-1 bg-secondary-100 rounded-lg">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs text-success-600 font-normal">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.recommended ? 'border-2 border-primary-500 shadow-lg' : ''
              }`}
              padding="lg"
            >
              {/* Recommended Badge */}
              {plan.recommended && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary-600 text-white px-3 py-1 rounded-bl-lg text-sm font-medium">
                    Recommended
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className={`bg-gradient-to-r ${plan.color} -mx-6 -mt-6 px-6 py-8 mb-6`}>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{getPrice(plan)}</span>
                  <span className="text-white/80">{getBillingPeriod()}</span>
                </div>
                {getSavings(plan) && (
                  <p className="text-success-100 text-sm mt-2">{getSavings(plan)}</p>
                )}
              </div>

              {/* Features List */}
              <div className="space-y-4 mb-6">
                <p className="text-sm font-medium text-secondary-600">What's included:</p>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-secondary-700">
                      <CheckIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Limitations */}
              <div className="border-t border-secondary-200 pt-4 mb-6">
                <p className="text-xs text-secondary-500 mb-2">Plan limits:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-secondary-500">Users:</span>
                    <span className="ml-1 font-medium text-secondary-900">
                      {plan.limitations.users === -1 ? 'Unlimited' : `Up to ${plan.limitations.users}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-secondary-500">Branches:</span>
                    <span className="ml-1 font-medium text-secondary-900">
                      {plan.limitations.branches === -1 ? 'Unlimited' : `Up to ${plan.limitations.branches}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-secondary-500">Products:</span>
                    <span className="ml-1 font-medium text-secondary-900">
                      {plan.limitations.products === -1 ? 'Unlimited' : `Up to ${plan.limitations.products.toLocaleString()}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-secondary-500">Monthly sales:</span>
                    <span className="ml-1 font-medium text-secondary-900">
                      {plan.limitations.monthlySales === -1 ? 'Unlimited' : `$${plan.limitations.monthlySales.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                variant={plan.recommended ? 'primary' : 'secondary'}
                fullWidth
                onClick={() => handleSubscribe(plan.id)}
                className="mt-4"
              >
                {plan.id === selectedPlan ? 'Processing...' : `Start ${plan.name} Plan`}
              </Button>
            </Card>
          ))}
        </div>

        {/* Enterprise Contact Section */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-secondary-50 to-secondary-100">
            <h3 className="text-lg font-bold text-secondary-900 mb-2">
              Need a custom solution?
            </h3>
            <p className="text-secondary-600 mb-4">
              Contact our sales team for custom pricing, on-premise deployment, or special requirements.
            </p>
            <Button variant="secondary">Contact Sales</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};