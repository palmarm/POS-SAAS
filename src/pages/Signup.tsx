import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon, 
  PhoneIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useToast } from '../hooks/useToast';
import { authAPI } from '../services/api';

// Validation schema
const signUpSchema = yup.object({
  name: yup.string().required('Full name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().required('Email is required').email('Invalid email format'),
  phone: yup.string().required('Phone number is required'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  businessName: yup.string().required('Business name is required'),
  plan: yup.string().required('Please select a plan'),
});

type SignUpFormData = yup.InferType<typeof signUpSchema>;

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}

export const SignUp: React.FC = () => {
  const [step, setStep] = useState<'info' | 'plan' | 'payment'>('info');
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpFormData>({
    resolver: yupResolver(signUpSchema),
    defaultValues: {
      plan: 'pro'
    }
  });

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 29,
      features: [
        'Up to 500 products',
        'Single store/branch',
        'Basic sales reports',
        'Email support',
        'Customer management',
        'Sales history (30 days)'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 79,
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
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      features: [
        'Everything in Pro',
        'Unlimited stores/branches',
        'Unlimited users',
        '24/7 dedicated support',
        'Custom integrations',
        'White-label branding',
        'Advanced security features'
      ]
    }
  ];

  const onSubmitInfo = async (data: SignUpFormData) => {
    // Store data in localStorage temporarily
    localStorage.setItem('signup_data', JSON.stringify(data));
    setStep('plan');
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    const signupData = JSON.parse(localStorage.getItem('signup_data') || '{}');
    signupData.plan = planId;
    localStorage.setItem('signup_data', JSON.stringify(signupData));
  };

  const handleCompleteSignUp = async () => {
    setLoading(true);
    try {
      const signupData = JSON.parse(localStorage.getItem('signup_data') || '{}');
      
      // Register user
      const response = await authAPI.register({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        phone: signupData.phone,
        businessName: signupData.businessName,
        plan: signupData.plan
      });

      showToast('Account created successfully! Please login.', 'success');
      
      // Clear signup data
      localStorage.removeItem('signup_data');
      
      // Navigate to login
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-5">
      <Input
        label="Full Name"
        placeholder="John Doe"
        icon={<UserIcon className="w-5 h-5" />}
        error={errors.name?.message}
        {...register('name')}
      />
      
      <Input
        label="Email Address"
        type="email"
        placeholder="john@example.com"
        icon={<EnvelopeIcon className="w-5 h-5" />}
        error={errors.email?.message}
        {...register('email')}
      />
      
      <Input
        label="Phone Number"
        placeholder="+1 234 567 8900"
        icon={<PhoneIcon className="w-5 h-5" />}
        error={errors.phone?.message}
        {...register('phone')}
      />
      
      <Input
        label="Business Name"
        placeholder="My Store"
        icon={<BuildingStorefrontIcon className="w-5 h-5" />}
        error={errors.businessName?.message}
        {...register('businessName')}
      />
      
      <Input
        label="Password"
        type="password"
        placeholder="Create a strong password"
        icon={<LockClosedIcon className="w-5 h-5" />}
        error={errors.password?.message}
        {...register('password')}
      />
      
      <Input
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        icon={<LockClosedIcon className="w-5 h-5" />}
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      
      <Button
        type="submit"
        variant="primary"
        fullWidth
        size="lg"
        className="mt-6"
      >
        Continue to Plan Selection
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {plans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => handlePlanSelect(plan.id)}
            className={`relative p-4 rounded-xl border-2 text-left transition-all ${
              selectedPlan === plan.id
                ? 'border-primary-600 bg-primary-50'
                : 'border-secondary-200 hover:border-primary-300'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-2 right-4 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                Popular
              </div>
            )}
            <h3 className="text-lg font-bold text-secondary-900">{plan.name}</h3>
            <p className="text-2xl font-bold text-primary-600 mt-2">
              ${plan.price}
              <span className="text-sm text-secondary-500 font-normal">/mo</span>
            </p>
            <ul className="mt-4 space-y-1">
              {plan.features.slice(0, 3).map((feature, idx) => (
                <li key={idx} className="text-xs text-secondary-600 flex items-center gap-1">
                  <CheckCircleIcon className="w-3 h-3 text-success-500" />
                  {feature}
                </li>
              ))}
              {plan.features.length > 3 && (
                <li className="text-xs text-primary-600 mt-1">
                  +{plan.features.length - 3} more features
                </li>
              )}
            </ul>
          </button>
        ))}
      </div>
      
      <div className="bg-secondary-50 p-4 rounded-lg">
        <p className="text-sm text-secondary-600">
          <strong>14-day free trial</strong> on all plans. No credit card required to start.
          Cancel anytime.
        </p>
      </div>
      
      <div className="flex gap-3">
        <Button variant="ghost" onClick={() => setStep('info')}>
          Back
        </Button>
        <Button variant="primary" onClick={handleCompleteSignUp} loading={loading} className="flex-1">
          Create Account
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">POS SaaS</h1>
          <p className="text-secondary-600">Start your 14-day free trial today</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center ${step === 'info' ? 'text-primary-600' : 'text-secondary-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step === 'info' ? 'border-primary-600 bg-primary-50' : 'border-secondary-300'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Account Info</span>
            </div>
            <div className="w-12 h-0.5 bg-secondary-200" />
            <div className={`flex items-center ${step === 'plan' ? 'text-primary-600' : 'text-secondary-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step === 'plan' ? 'border-primary-600 bg-primary-50' : 'border-secondary-300'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Choose Plan</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit(onSubmitInfo)}>
            {step === 'info' && renderStep1()}
            {step === 'plan' && renderStep2()}
          </form>
        </Card>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-secondary-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};