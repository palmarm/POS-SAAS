import React, { useState, useEffect } from 'react';
import { 
  CreditCardIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useToast } from '../../hooks/useToast';
import { subscriptionAPI, invoiceAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface Subscription {
  id: number;
  plan_id: number;
  plan_name: string;
  status: 'active' | 'expired' | 'canceled' | 'pending';
  billing_cycle: 'monthly' | 'yearly';
  start_date: string;
  next_billing_date: string;
  payment_method: string;
  auto_renew: boolean;
}

interface Plan {
  id: number;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  limitations: {
    users: number;
    branches: number;
    products: number;
    monthly_sales: number;
  };
}

interface Usage {
  users: number;
  branches: number;
  products: number;
  currentMonthSales: number;
}

interface Invoice {
  id: number;
  invoice_number: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
}

export const SubscriptionDashboard: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [usage, setUsage] = useState<Usage>({ users: 0, branches: 0, products: 0, currentMonthSales: 0 });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    setLoading(true);
    try {
      // Fetch current subscription
      const subRes = await subscriptionAPI.getCurrent();
      if (subRes.data.success && subRes.data.data.subscription) {
        setSubscription(subRes.data.data.subscription);
        setCurrentPlan(subRes.data.data.subscription.plan);
      }
      
      // Fetch invoices
      const invRes = await invoiceAPI.getAll();
      if (invRes.data.success) {
        setInvoices(invRes.data.data);
      }
      
      // Fetch usage data (would come from real API)
      // For now, using mock data
      setUsage({
        users: 3,
        branches: 2,
        products: 245,
        currentMonthSales: 3250
      });
      
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      showToast(error.response?.data?.message || 'Failed to load subscription data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      const response = await subscriptionAPI.cancel();
      if (response.data.success) {
        showToast('Subscription cancelled successfully', 'success');
        await fetchSubscriptionData();
        setShowCancelModal(false);
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to cancel subscription', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const getDaysUntilBilling = () => {
    if (!subscription?.next_billing_date) return 0;
    const today = new Date();
    const nextDate = new Date(subscription.next_billing_date);
    const diffTime = nextDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0;
    return (current / limit) * 100;
  };

  if (loading) {
    return (
      <div className="pt-16 pl-[240px] bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-secondary-600">Loading subscription data...</p>
        </div>
      </div>
    );
  }

  const daysUntilBilling = getDaysUntilBilling();
  const isExpiringSoon = daysUntilBilling <= 7 && daysUntilBilling > 0;
  const planLimits = currentPlan?.limitations || { users: 0, branches: 0, products: 0, monthly_sales: 0 };

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
            <Button variant="secondary" size="sm" onClick={() => navigate('/subscription/checkout')}>
              Update Payment
            </Button>
          </div>
        )}

        {/* Subscription Expired Alert */}
        {subscription?.status === 'expired' && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-danger-600" />
              <span className="text-danger-800">
                Your subscription has expired. Please renew to continue using premium features.
              </span>
            </div>
            <Button variant="primary" size="sm" onClick={handleUpgrade}>
              Renew Now
            </Button>
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subscription?.status === 'active' ? 'bg-success-100 text-success-700' :
                      subscription?.status === 'expired' ? 'bg-danger-100 text-danger-700' :
                      'bg-warning-100 text-warning-700'
                    }`}>
                      {subscription?.status?.toUpperCase() || 'ACTIVE'}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-secondary-900">
                    {currentPlan?.name || 'Pro Plan'}
                  </p>
                  <p className="text-secondary-500 mt-1">
                    ${subscription?.billing_cycle === 'monthly' ? currentPlan?.price_monthly : currentPlan?.price_yearly}
                    /{subscription?.billing_cycle}
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
                  {currentPlan?.features?.map((feature, idx) => (
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
                  current={usage.users}
                  limit={planLimits.users}
                  icon={<UserGroupIcon className="w-5 h-5" />}
                />
                <UsageStat
                  label="Branches"
                  current={usage.branches}
                  limit={planLimits.branches}
                  icon={<BuildingStorefrontIcon className="w-5 h-5" />}
                />
                <UsageStat
                  label="Products"
                  current={usage.products}
                  limit={planLimits.products}
                  icon={<CubeIcon className="w-5 h-5" />}
                />
                <UsageStat
                  label="Monthly Sales"
                  current={usage.currentMonthSales}
                  limit={planLimits.monthly_sales}
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
                    {subscription?.next_billing_date 
                      ? new Date(subscription.next_billing_date).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Amount:</span>
                  <span className="font-medium text-secondary-900">
                    ${subscription?.billing_cycle === 'monthly' ? currentPlan?.price_monthly : currentPlan?.price_yearly}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Payment Method:</span>
                  <span className="font-medium text-secondary-900 capitalize">
                    {subscription?.payment_method || 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Auto-renew:</span>
                  <span className={`font-medium ${subscription?.auto_renew ? 'text-success-600' : 'text-danger-600'}`}>
                    {subscription?.auto_renew ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="sm" fullWidth className="mt-4">
                Update Payment Method
              </Button>
            </Card>

            {/* Cancel Subscription */}
            {subscription?.status === 'active' && (
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
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <Card className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-secondary-900">Recent Invoices</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/subscription/invoices')}>
              View All
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50 border-b border-secondary-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Invoice #</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Date</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Amount</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-secondary-600">Status</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-secondary-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {invoices.slice(0, 5).map(invoice => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 font-mono text-sm">{invoice.invoice_number}</td>
                    <td className="px-6 py-4">{new Date(invoice.date).toLocaleDateString()}</td>
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
                      <button 
                        onClick={() => window.open(`/api/invoices/${invoice.invoice_number}/download`, '_blank')}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-secondary-400">
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Cancel Subscription Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">Cancel Subscription</h3>
              <p className="text-secondary-600 mb-4">
                Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period on {subscription?.next_billing_date ? new Date(subscription.next_billing_date).toLocaleDateString() : 'the next billing date'}.
              </p>
              <div className="bg-warning-50 p-3 rounded-lg mb-6">
                <p className="text-sm text-warning-800">
                  <strong>Note:</strong> Your data will be retained for 30 days after cancellation.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setShowCancelModal(false)} className="flex-1">
                  Keep Subscription
                </Button>
                <Button variant="danger" onClick={handleCancelSubscription} loading={cancelling} className="flex-1">
                  Yes, Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
const BuildingStorefrontIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const CubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

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