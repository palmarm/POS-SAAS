import React, { useState, useEffect } from 'react';
import { 
  CreditCardIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BuildingStorefrontIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/ui/Modal';

interface Subscription {
  plan: {
    id: string;
    name: string;
    price: number;
    billingCycle: 'monthly' | 'yearly';
    features: string[];
    limitations: {
      users: number;
      branches: number;
      products: number;
      monthlySales: number;
    };
  };
  status: 'active' | 'expired' | 'pending' | 'canceled';
  startDate: Date;
  nextBillingDate: Date;
  paymentMethod: {
    type: 'card' | 'mobile';
    last4?: string;
    provider?: string;
  };
  usage: {
    users: number;
    branches: number;
    products: number;
    currentMonthSales: number;
  };
  invoices: Array<{
    id: string;
    date: Date;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    downloadUrl: string;
  }>;
}

export const SubscriptionDashboard: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockSubscription: Subscription = {
        plan: {
          id: 'pro',
          name: 'Pro Plan',
          price: 79,
          billingCycle: 'monthly',
          features: ['Unlimited products', 'Up to 5 branches', 'Advanced reports'],
          limitations: {
            users: 10,
            branches: 5,
            products: -1,
            monthlySales: 5000
          }
        },
        status: 'active',
        startDate: new Date(2024, 0, 15),
        nextBillingDate: new Date(2024, 2, 15),
        paymentMethod: {
          type: 'card',
          last4: '4242',
          provider: 'Visa'
        },
        usage: {
          users: 3,
          branches: 2,
          products: 245,
          currentMonthSales: 3250
        },
        invoices: [
          {
            id: 'INV-001',
            date: new Date(2024, 1, 15),
            amount: 79,
            status: 'paid',
            downloadUrl: '#'
          },
          {
            id: 'INV-002',
            date: new Date(2024, 0, 15),
            amount: 79,
            status: 'paid',
            downloadUrl: '#'
          }
        ]
      };
      
      setSubscription(mockSubscription);
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0;
    return (current / limit) * 100;
  };

  const getDaysUntilBilling = () => {
    if (!subscription) return 0;
    const today = new Date();
    const diffTime = subscription.nextBillingDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  const handleCancelSubscription = () => {
    showToast('Subscription cancellation requested. Please contact support.', 'info');
    setShowCancelModal(false);
  };

  if (loading) {
    return (
      <div className="pt-16 pl-[240px] bg-background min-h-screen flex items-center justify-center">
        <div className="spinner-border text-primary-600" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!subscription) return null;

  const daysUntilBilling = getDaysUntilBilling();
  const isExpiringSoon = daysUntilBilling <= 7;

  return (
    <div className="pt-16 pl-[240px] bg-background min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-secondary-900">Subscription Dashboard</h1>
          <p className="text-secondary-500 mt-1">Manage your plan and billing information</p>
        </div>

        {/* Alert for expiring soon */}
        {isExpiringSoon && (
          <div className="mb-6 p-4 bg-warning-50 border border-warning-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-warning-600" />
              <span className="text-warning-800">
                Your subscription will renew in {daysUntilBilling} days.
              </span>
            </div>
            <Button variant="secondary" size="sm">Update Payment</Button>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Current Plan Card */}
          <div className="col-span-8">
            <Card>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-secondary-900">Current Plan</h2>
                    <span className="px-2 py-1 bg-success-100 text-success-700 rounded-full text-xs font-medium">
                      {subscription.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-secondary-900">
                    {subscription.plan.name}
                  </p>
                  <p className="text-secondary-500 mt-1">
                    ${subscription.plan.price}/{subscription.plan.billingCycle}
                  </p>
                </div>
                <Button variant="primary" onClick={handleUpgrade}>
                  Upgrade Plan
                </Button>
              </div>

              {/* Features */}
              <div className="border-t border-secondary-200 pt-4">
                <h3 className="font-medium text-secondary-900 mb-3">Plan Features</h3>
                <ul className="grid grid-cols-2 gap-2">
                  {subscription.plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-secondary-600">
                      <CheckCircleIcon className="w-4 h-4 text-success-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Usage Statistics */}
            <Card className="mt-6">
              <h2 className="text-xl font-bold text-secondary-900 mb-4">Usage Statistics</h2>
              <div className="space-y-4">
                <UsageStat
                  label="Active Users"
                  current={subscription.usage.users}
                  limit={subscription.plan.limitations.users}
                  icon={<UserGroupIcon className="w-5 h-5" />}
                />
                <UsageStat
                  label="Branches"
                  current={subscription.usage.branches}
                  limit={subscription.plan.limitations.branches}
                  icon={<BuildingStorefrontIcon className="w-5 h-5" />}
                />
                <UsageStat
                  label="Products"
                  current={subscription.usage.products}
                  limit={subscription.plan.limitations.products}
                  icon={<CubeIcon className="w-5 h-5" />}
                />
                <UsageStat
                  label="Monthly Sales"
                  current={subscription.usage.currentMonthSales}
                  limit={subscription.plan.limitations.monthlySales}
                  icon={<ChartBarIcon className="w-5 h-5" />}
                  format="currency"
                />
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="col-span-4 space-y-6">
            {/* Billing Info */}
            <Card>
              <h3 className="font-bold text-secondary-900 mb-4">Billing Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Next Billing Date:</span>
                  <span className="font-medium text-secondary-900">
                    {subscription.nextBillingDate.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Amount:</span>
                  <span className="font-medium text-secondary-900">
                    ${subscription.plan.price}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Payment Method:</span>
                  <span className="font-medium text-secondary-900">
                    {subscription.paymentMethod.type === 'card' 
                      ? `${subscription.paymentMethod.provider} ending in ${subscription.paymentMethod.last4}`
                      : subscription.paymentMethod.provider}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="sm" fullWidth className="mt-4">
                Update Payment Method
              </Button>
            </Card>

            {/* Cancel Subscription */}
            <Card>
              <h3 className="font-bold text-secondary-900 mb-4">Cancel Subscription</h3>
              <p className="text-sm text-secondary-600 mb-4">
                You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
              <Button 
                variant="danger" 
                fullWidth 
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Subscription
              </Button>
            </Card>
          </div>
        </div>

        {/* Recent Invoices */}
        <Card className="mt-6">
          <h2 className="text-xl font-bold text-secondary-900 mb-4">Recent Invoices</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50 border-b border-secondary-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Invoice ID</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Date</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Amount</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-secondary-600">Status</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-secondary-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {subscription.invoices.map(invoice => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 font-mono text-sm">{invoice.id}</td>
                    <td className="px-6 py-4">{invoice.date.toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">${invoice.amount}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        invoice.status === 'paid' ? 'bg-success-100 text-success-700' :
                        invoice.status === 'pending' ? 'bg-warning-100 text-warning-700' :
                        'bg-danger-100 text-danger-700'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-primary-600 hover:text-primary-700 text-sm">
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Cancel Subscription Modal */}
        {showCancelModal && (
          <Modal
            isOpen={showCancelModal}
            onClose={() => setShowCancelModal(false)}
            title="Cancel Subscription"
          >
            <div className="space-y-4">
              <p className="text-secondary-600">
                Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.
              </p>
              <div className="bg-warning-50 p-3 rounded-lg">
                <p className="text-sm text-warning-800">
                  <strong>Note:</strong> Your data will be retained for 30 days after cancellation.
                </p>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="ghost" onClick={() => setShowCancelModal(false)}>
                  Keep Subscription
                </Button>
                <Button variant="danger" onClick={handleCancelSubscription}>
                  Yes, Cancel
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

// Usage Stat Component
const UsageStat: React.FC<{
  label: string;
  current: number;
  limit: number;
  icon: React.ReactNode;
  format?: 'number' | 'currency';
}> = ({ label, current, limit, icon, format = 'number' }) => {
  const percentage = limit === -1 ? 0 : (current / limit) * 100;
  const isNearLimit = percentage >= 80;
  
  const formatValue = (value: number) => {
    if (format === 'currency') {
      return `$${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };

  const limitText = limit === -1 ? 'Unlimited' : formatValue(limit);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-secondary-700">{label}</span>
        </div>
        <span className="text-sm text-secondary-600">
          {formatValue(current)} / {limitText}
        </span>
      </div>
      {limit !== -1 && (
        <ProgressBar 
          percentage={percentage} 
          color={isNearLimit ? 'warning' : 'primary'}
        />
      )}
    </div>
  );
};